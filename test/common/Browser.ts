import * as puppeteer from 'puppeteer';
import {Browser, LaunchOptions} from 'puppeteer';

export class BrowserLauncher {

    private browser: Browser | undefined;

    public async initialize(options?: LaunchOptions): Promise<void> {
        if (typeof options === 'undefined') {
            options = {
                headless: true
            };
        }

        this.browser = await puppeteer.launch(options);
    }

    public async closeBrowser(): Promise<void> {
        if (typeof this.browser !== 'undefined') {
            await this.browser.close();
        }
    }

    public getBrowser(): Browser {
        if (typeof this.browser === 'undefined') {
            throw new Error('unable to initialize browser.');
        }

        return this.browser;
    }
}

export const browserLauncher: BrowserLauncher = new BrowserLauncher();
