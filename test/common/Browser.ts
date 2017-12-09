import * as puppeteer from 'puppeteer';
import {Browser, LaunchOptions} from 'puppeteer';

export class BrowserLauncher {

    private browser: Browser;

    public async initialize(options?: LaunchOptions): Promise<void> {
        this.browser = await puppeteer.launch(options || {
            headless: true
        });
    }

    public async closeBrowser(): Promise<void> {
        await this.browser.close();
    }

    public getBrowser(): Browser {
        return this.browser;
    }
}

export const browserLauncher: BrowserLauncher = new BrowserLauncher();

