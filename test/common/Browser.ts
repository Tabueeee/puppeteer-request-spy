import * as puppeteer from 'puppeteer';
import {Browser, LaunchOptions} from 'puppeteer';

export class BrowserLauncher {

    private browser: Browser | undefined;
    private initialized: boolean = false;

    public async initialize(options?: LaunchOptions): Promise<void> {
        this.initialized = true;
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

    public async getBrowser(): Promise<Browser> {
        if (typeof this.browser === 'undefined') {
            if (this.initialized) {
                throw new Error('unable to initialize browser.');
            } else {
                await this.initialize();
            }
        }

        return Promise.resolve(<Browser> this.browser);
    }
}

export const browserLauncher: BrowserLauncher = new BrowserLauncher();
