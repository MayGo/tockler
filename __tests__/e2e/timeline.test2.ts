import { Application, SpectronClient } from "spectron";
import { expect } from "chai";
import { join } from "path";
import * as utils from './utils'

type TestContext = {
  app: any
}

describe("application launch", function () {
    this.timeout(utils.LONG_TIMEOUT);

    beforeEach(async function (this: TestContext): Promise<void> {
        this.app = utils.createApplication()
        await utils.startApplication(this.app)
        await this.app.client.waitUntilWindowLoaded()
    });

    afterEach(async function (this: TestContext): Promise<void> {
        await utils.stopApplication(this.app)
    });

    it('Header contains application name', async function (this: TestContext): Promise<void> {
        const text = await this.app.client.waitUntilTextExists('#appName', 'Tockler', 10000)
       // const text = await this.app.client.getText('#appName');
        expect(text).to.equal('asdas');
    });

});
