import { chromium, type Browser, type BrowserContext } from "playwright";
import { type Request, type Response } from "express";
import path from "node:path";

// export const saveCurrentSession = async (req: Request, res: Response) => {
//     const browser = await chromium.launch({ headless: true });
//     const context = await browser.newContext({ locale: 'ro-RO' });
//     const page = await context.newPage();

//     await page.goto('https://food.bolt.eu/ro-ro/325-bucharest/p/44578-shaormeria-ca-1-decembrie/');

//     //press enter in the terminal once the discountede price is visible
//     await new Promise<void>((resolve) => process.stdin.once('data', () => resolve()));

//     await context.storageState({ path: 'bolt-state.json' });
//     await browser.close();
// }

//absolute path for the generated json for the session
export const STATE_PATH = path.resolve(process.cwd(), 'bolt-state.json');

//these need to be in the outer scope since the 2 functions need to know the state of these variables
let loginBrowser: Browser | null = null;
let loginContext: BrowserContext | null = null;

export const startSession = async (req: Request, res: Response) => {
    //check if there is a session already active
    if (loginBrowser) {
        return res.status(409).json({
            'error': 'There already exists an active session'
        });
    }

    loginBrowser = await chromium.launch({ headless: false });
    loginContext = await loginBrowser.newContext({ 
        locale: 'ro-RO',
    });

    const page = await loginContext.newPage();
    const link = 'https://food.bolt.eu/ro-ro/325-bucharest/p/44578-shaormeria-ca-1-decembrie/'
    await page.goto(link);

    return res.json({
        'message': 'Window opened. After log in, ensure the discounts are visible and call the /session/finish endpoint'
    });
}

export const finishSession = async (req: Request, res: Response) => {
    if (!loginBrowser || !loginContext) {
        return res.status(400).json({
            'error': 'No browser is open or it does not have loginContext'
        });
    }

    //write the opened browser's cookies and localStorage data to the file
    await loginContext.storageState({ path: STATE_PATH });

    await loginBrowser.close();
    loginBrowser = null;
    loginContext = null;

    return res.status(200).json({
        'message': 'Session data saved',
        'path': STATE_PATH
    });
}