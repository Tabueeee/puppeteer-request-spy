import {browserLauncher} from '../../common/Browser';

before(async () => {
    await browserLauncher.initialize(
        {
            headless: true,
            ignoreHTTPSErrors: true
        }
    );
});

after(async () => {
    await browserLauncher.closeBrowser();
});

