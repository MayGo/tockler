// Type definitions for Aurelia Protractor extensions
// Project: https://github.com/aurelia/skeleton-navigation
// Definitions by: Enrapt <https://github.com/Enrapt>, Kirill Grishin <https://github.com/KirillGrishin>

// Extend existing interfaces with additional functionality from Aurelia Protractor Extender (aurelia.protractor.js)

declare module protractor {
  interface IBrowser extends protractor.Protractor {
    loadAndWaitForAureliaPage(url: string): protractor.Protractor;
    waitForRouterComplete();
  }

  interface IProtractorLocatorStrategy {
    valueBind(bindTarget: string): webdriver.Locator;
  }
}
