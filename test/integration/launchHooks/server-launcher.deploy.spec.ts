import {serverDouble} from '../../common/ServerDouble';

before(async () => {
    await serverDouble.start();
});

after(async () => {
    serverDouble.stop();
});
