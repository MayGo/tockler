import { Application } from 'spectron';
import * as utils from './utils';

type TestContext = {
    app: Application;
};
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let app: Application;

describe('application launch', function () {
    beforeEach(async () => {
        app = utils.createApplication();
        await utils.startApplication(app);
        app.client.windowByIndex(1);
        await app.client.waitUntilWindowLoaded();
    });

    afterEach(async () => {
        await utils.stopApplication(app);
    });

    it('Header contains application name', async () => {
        const text = await app.client.getText('#appName');
        expect(text).toEqual('Tockler');
    });
});
