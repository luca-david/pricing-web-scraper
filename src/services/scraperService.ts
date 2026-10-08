import { chromium, type Locator, type Page } from "playwright";

export interface PriceResult {
    stringPrice: string,
    floatPrice: number | null,
}

export function parsePriceToFloat(priceString: string): number | null {
    const normalized = priceString.replace(',', '.');
    const match = normalized.match(/\d+(?:\.\d+)?/);
    if (match) {
        return parseFloat(match[0]);
    } else {
        return null;
    }
}

export async function getDiscountedPrice(page: Page): Promise<string | null | undefined> {
  const redPrice = await page.locator('[data-testid*="GridMenuDishBase"]').evaluateAll((elements) => {
    for (const el of elements) {
      const computedColor = window.getComputedStyle(el).color;
      
      // Parse 'rgb(R, G, B)' format
      const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        
        if (!r || !g || !b) {
            return;
        }

        // Detect predominantly RED elements (High Red value, Low Green & Blue)
        if (r > 180 && g < 100 && b < 100) {
          return el.textContent?.trim() || null;
        }
      }
    }
    return null;
  });

  return redPrice;
}


export async function scrapePriceFromUrl(url: string, selector: string): Promise<PriceResult | null> {
    //launch browser with no GUI and setup an user
    const browser = await chromium.launch({ headless: true }); //opens browser
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        //we specify the compatibility for search engine, OS kernel version and primary search engine
    });
    const page = await context.newPage(); //opens a new incognito page using the given context()

    await page.route('**/getMenuCategories*', async (route) => {
        const req = route.request();
        const body = JSON.parse(req.postData() || '{}');
        body.delivery_lat = 44.412733;
        body.delivery_lng = 26.196911;
        await route.continue({ postData: JSON.stringify(body) });
    });
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        //locate the container that contains the product
        const productCard = page.locator('[data-testid*="GridMenuDishBase"], [role="button"]')
        .filter({ hasText: selector }) //look for the card that has the text given in the params
        .first();

        await productCard.waitFor({ state: 'visible', timeout: 30000 });
        console.log('Found the product card with name: ' + selector);

        await productCard.scrollIntoViewIfNeeded();

        //give dynamic discount prices up to 3 seconds to inject into DOM
        await page.waitForTimeout(2000);
                
        //search for the price only inside of this card(and that is visible to the frontend)
        //extract all visible text inside the card as a single string
        const cardText = await productCard.innerText();
        console.log('Card text content:\n', cardText);
        await page.screenshot({ path: 'debug_card.png', fullPage: true });

        //match all price occurences to the regex
        const priceMatches = cardText.match(/\d+(?:[.,]\d+)?\s*lei/gi);

        if (!priceMatches || priceMatches.length === 0) {
            console.log('No price strings matched in the card text');
            return null;
        }
        console.log('Raw price strings found: ', priceMatches);

        //parse all text contents to numeric values
        let parsedPrices: number[] = [];
        
        for (const price of priceMatches) {
            //parse to float
            const numericValue = parsePriceToFloat(price);
            if (numericValue !== null) {
                //if valid, append to array
                parsedPrices.push(numericValue);
            }
        }

        if (parsedPrices === null || parsedPrices.length) {
            return null;
        }

        const lowestPrice = Math.min(...parsedPrices);
        const lowestRawString = `${lowestPrice} lei`;

        return { stringPrice: lowestRawString, floatPrice: lowestPrice };


    } catch (error) {
        console.error('Scraping failed for URL: ' + url)
        console.error(error);
        return null;
    } finally {
        //delete context and close the browser after returning the data
        await context.close();
        await browser.close();
    }
}