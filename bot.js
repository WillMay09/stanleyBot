//importing the module, extra is a like a wrapper class
const puppeteer = require("puppeteer-extra");
//imports puppeteer plugin, makes it harder for websites to detect what is going on
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
//attaches the plugin instance to the puppeteer
//under the hood the puppeteer object object maintains a list of plugins and applies when the browser is launched
puppeteer.use(StealthPlugin());

const product_url =
  "https://www.stanley1913.com/products/the-iceflow-flip-straw-tumbler-30-oz?variant=53972775141736";
async function getPage() {
  //creates a new browser instance, running instance of chrome/chromium
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  //await page.goto(product_url);
  //await browser.close();

  return page;
}

async function addToCart(page) {
  await page.goto(product_url, { waitUntil: "domcontentloaded" });

  await page.waitForSelector("button[data-testid='buy-buttons-add-to-cart']");
  await page.click("button[data-testid='buy-buttons-add-to-cart']");

  //checkout button
  //true ensures button, is clickable, sometimes visable in the dom but not clickable
  const checkoutBtn = await page.waitForSelector(
    "button.c-btn.c-btn--dark.u-full.cart__checkout",
    {
      visible: true,
    }
  );
  //scroll into view first
  //ensures element is visable within the viewport
  //returns ElementHandle object
  await checkoutBtn.evaluate((el) => el.scrollIntoView());

  //now click it from inside the browser context
  //calls the dom method directly on the element, bypasses some puppeteer edge cases
  await checkoutBtn.evaluate((el) => el.click());
}

async function fillOutBilling(page) {
  const billingInfo = {
    "input[id='TextField0]": "Bob",
    "input[id='TextField1']": "Chad",
    "input[id='shipping-address1']": " 452 W Street",
    "input[id='TextField4']": "Houston",
    "input[id='Select1']": "Texas",
    "input[id='TextField5']": "77046",
    "input[id='TextField6']": "4445672345",
    "input[name='cardNumber']": "4111111111111111",
  };

  for (const [selector, value] of Object.entries(billingInfo)) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      //check for the dropdown
      const tagName = await page.$eval(selector, (el) =>
        el.tagName.toLowerCase()
      );

      if (tagName === "select") {
        await page.select(selector, value);
      } else {
        await page.focus(selector);
        await page.click(selector, { clickCount: 3 });
        await page.type(selector, value);
      }
    } catch (err) {
      console.log("failed to fill ${selector}: ${err.message}");
    }
  }

  await page.type();
}

async function checkOut() {
  const page = await getPage();

  await addToCart(page);
  await fillOutBilling(page);
}

checkOut();
