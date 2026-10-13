import { chromium, type Page } from "playwright";
import { type Request, type Response } from "express";
import { STATE_PATH } from "./sessionController.js";

export interface PriceResult {
    stringPrice: string,
    floatPrice: number | null,
    originalPrice?: number | null,
    discountPercent?: number | null,
}


export function parsePriceToFloat(priceString: string): number | null {
    const normalized = priceString.replace(',', '.');
    const match = normalized.match(/\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
}


function normalizeName(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/**
 * Walks the whole JSON tree (we don't know exactly how deep Bolt nests the
 * items) and collects every object that looks like a menu item:
 *   { name: { value: "..." }, price: { value: <number>, ... } }
 */
function collectItems(node: any, out: any[]): void {
    if (Array.isArray(node)) {
        for (const child of node) collectItems(child, out);
        return;
    }
    if (node && typeof node === 'object') {
        if (typeof node.name?.value === 'string' && typeof node.price?.value === 'number') {
            out.push(node);
        }
        for (const child of Object.values(node)) collectItems(child, out);
    }
}

//looks for the item in the selector
function pickItem(items: any[], wantedName: string): any | null {
    const wanted = normalizeName(wantedName);
    return (
        items.find((i) => normalizeName(i.name.value) === wanted) ??
        //if exact match not found, look for strings that include the selector
        items.find((i) => normalizeName(i.name.value).includes(wanted)) ??
        null
    );
}

async function scrapePriceFromUrl(url: string, selector: string): Promise<PriceResult | null> {
    //launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        locale: 'ro-RO',
        storageState: STATE_PATH, //get this from sessionController(startSession and finishSession endpoints to get a new bolt-state.json)
        geolocation: { latitude: 44.412733, longitude: 26.196911 },
        permissions: ['geolocation'],
    });
    const page: Page = await context.newPage();

    try {
        // 2. Force our delivery coordinates on the menu request.
        //    Campaigns (like the 30% discount) depend on the delivery location, and a
        //    fresh headless browser has no saved address. We only touch fields that
        //    ALREADY exist in the request, so we can't break a request that has a
        //    different shape than we expect.
        await page.route('**/getMenuCategories*', async (route) => {
            const req = route.request();
            const options: { url?: string; postData?: string } = {};
            console.log('METHOD: ', req.method());
            console.log('URL: ', req.url());
            console.log('BODY: ', req.postData());
            
            await route.continue(options);
        });

        // 3. Listen for the menu responses BEFORE navigating. If we registered the
        //    listener after goto(), the response could arrive before we are listening.
        //    The JSON contains the exact prices, so we never have to parse the DOM.
        const menuPayloads: any[] = [];
        page.on('response', async (res) => {
            if (!res.url().includes('getMenuCategories')) return;
            try {
                menuPayloads.push(await res.json());
            } catch {
                // response had no readable JSON body (e.g. redirect), ignore it
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // 4. Poll until one of the captured responses contains our item (max 60 s).
        //    The menu is fetched after the page loads, and possibly in several calls.
        const allItems: any[] = [];
        let processed = 0;
        let found: any | null = null;
        const deadline = Date.now() + 60000;

        while (!found && Date.now() < deadline) {
            // only look at payloads that arrived since the last loop
            for (; processed < menuPayloads.length; processed++) {
                collectItems(menuPayloads[processed], allItems);
            }
            found = pickItem(allItems, selector);
            if (!found) await page.waitForTimeout(500);
        }

        // 5. Nothing found: print enough info to see WHY instead of failing silently.
        if (!found) {
            console.log(`Item "${selector}" not found.`);
            console.log(`getMenuCategories responses captured: ${menuPayloads.length}`);
            console.log(`Menu items parsed: ${allItems.length}`);
            console.log('Sample of item names seen:', allItems.slice(0, 10).map((i) => i.name.value));
            return null;
        }

        // 6. Read the prices from the JSON.
        //    price.value          -> what the customer pays now (43.4 when discounted)
        //    price.original_price -> the undiscounted price (62), only present on discounts
        //    price.discount_percent -> 30
        const price = found.price;
        console.log(`Found "${found.name.value}": ${price.price_str ?? price.value}`);

        return {
            stringPrice: price.price_str ?? `${price.value} lei`,
            floatPrice: price.value,
            originalPrice: price.original_price?.value ?? null,
            discountPercent: price.discount_percent ?? null,
        };
    } catch (error) {
        console.error('Scraping failed for URL: ' + url);
        console.error(error);
        return null;
    } finally {
        // 7. Always close the browser, even if something above threw.
        await context.close();
        await browser.close();
    }
}

export const getCurrentPricesCAndA = async (req: Request, res: Response) => {
    
    const selector = req.query.selector;

    console.log('selector is ', selector)

    const url = "https://food.bolt.eu/ro-ro/325-bucharest/p/44578-shaormeria-ca-1-decembrie/"

    if (!selector || typeof selector !== 'string') {
        return res.status(404).json({
            'error': 'Missing selector'
        });
    }

    const price = await scrapePriceFromUrl(url, selector);

    console.log('The price in float: ', price?.floatPrice); 
    console.log('String price', price?.stringPrice);
    console.log('The original price: ', price?.originalPrice);
    console.log('Discount percent: ', price?.discountPercent);
    
    if (price === null) {
        return res.status(404).json({
            'message': 'No prices found for the given selector'
        })
    }

    return res.status(200).json({
        'message': 'Succesfully retrieved prices from site',
        'data': price,
        'url': url
    });
}

export const getCurrentPricesRollMaster = async (req: Request, res: Response) => {

    const selector = req.query.selector;

    const url = "https://food.bolt.eu/ro-ro/325-bucharest/p/4791-roll-master-titan/"

    if (!selector || typeof selector !== 'string') {
        return res.status(400).json({
            'error': 'Selector is missing or invalid'
        })
    }

    const price = await scrapePriceFromUrl(url, selector);

    if (price === null) {
        return res.status(200).json({
            'message': 'No prices were found for the given selector',
            'data': null
        });
    }

    return res.status(200).json({
        'message': 'Successfully retrieved the price for ' + selector ,
        'data': price,
        'url': url
    })
}

export const getCurrentPricesLeBab = async (req: Request, res: Response) => {
    const selector = req.query.selector;

    const url = 'https://food.bolt.eu/ro-ro/325-bucharest/p/72612-lbfc-le-bab-fried-chicken-timpuri-noi/'

    if (!selector || typeof selector !== 'string') {
        return res.status(400).json({
            'message': 'Missing or invalid selector'
        });
    }

    const price = await scrapePriceFromUrl(url, selector);

    if (price === null) {
        return res.status(404).json({
            'message': 'No price found for' + selector,
            'data': null,
            'url': url
        });
    }

    return res.status(200).json({
        'message': 'Successfully scraped price for ' + selector,
        'data': price,
        'url': url
    });
}