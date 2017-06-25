import * as utils from './utils';
import { expect } from "chai";

describe('Shell', function () {

  this.timeout(utils.LONG_TIMEOUT);

  beforeEach(async () => {
    this.app = utils.createApplication()
    await utils.startApplication(this.app)
    await this.app.client.waitUntilWindowLoaded()
  })

  afterEach(async () => {
    await utils.stopApplication(this.app)
  });

   it("shows an initial window", async () => {
        const winCount = await this.app.client.getWindowCount();

        expect(winCount).to.equal(2);
    });

  it('is visible', async () => {
    const isVisible = await this.app.browserWindow.isVisible()
    expect(isVisible).to.equal(true)
  })

  it('is not full screen', async () => {
    const isFullScreen = await this.app.browserWindow.isFullScreen()
    expect(isFullScreen).to.equal(false)
  })

  it('is showing dev tools', async () => {
    const isDevToolsOpened = await this.app.browserWindow.isDevToolsOpened()
    expect(isDevToolsOpened).to.equal(true)
  })

  it('displays app name', async () => {
    const title = await this.app.browserWindow.getTitle()
    expect(title).to.equal('Tockler')
  })
})
