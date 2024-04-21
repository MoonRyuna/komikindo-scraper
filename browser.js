const puppeteer = require("puppeteer");

async function startBrowser() {
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
      headless: false,
      ignoreDefaultArgs: ["--enable-automation"],
      args: [
        "--disable-infobars",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu=False",
        "--enable-webgl",
        "--window-size=1600,900",
        "--start-maximized",
      ],
      defaultViewport: null,
      ignoreHTTPSErrors: true,
      protocolTimeout: 3600_000,
    });
  } catch (err) {
    logger.info("Error when starting Chrome...");
    logger.info(err);
    if (browser && browser.connected) {
      logger.info("Closing browser...");
      await browser.close();
    }
    await sleep(1000);
    browser = null;
    firstTab = null;
    logger.info("Trying again...\n\n");
  }
  return browser;
}

module.exports = {
  startBrowser,
};
