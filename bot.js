//importing the module, extra is a like a wrapper class
const puppeteer = require("puppeteer-extra");
//imports puppeteer plugin, makes it harder for websites to detect what is going on
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
//attaches the plugin instance to the puppeteer
//under the hood the puppeteer object object maintains a list of plugins and applies when the browser is launched
puppeteer.use(StealthPlugin());

const product_url =
  "https://www.stanley1913.com/products/adventure-quencher-travel-tumbler-40-oz?variant=53972889207144";
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
    "input[id='email']": "jonj73675@gmail.com",
    "input[id='TextField0']": "Bob",
    "input[id='TextField1']": "Chad",
    "input[id='shipping-address1']": " 452 W Street",
    "input[id='TextField4']": "Houston",
    "select[id='Select1']": "TX",
    "input[id='TextField5']": "77046",
    "input[id='TextField6']": "(862) 219-8100",
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

        await page.$eval(selector, (el) =>
          el.dispatchEvent(new Event("change", { bubbles: true }))
        );
      } else {
        await page.focus(selector);
        await page.evaluate(
          (sel, val) => {
            const input = document.querySelector(sel);
            input.value = val;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.dispatchEvent(new Event("blur", { bubbles: true }));
          },
          selector,
          value
        );
        // await page.focus(selector);
        // await page.click(selector, { clickCount: 3 });
        // await page.type(selector, value);
      }
    } catch (err) {
      console.log(`failed to fill ${selector}: ${err.message}`);
    }
  }

  //await page.waitForTimeout(1000);
  const shippingButton = await page.waitForSelector("button[type='submit']", {
    visible: true,
  });

  await shippingButton.evaluate((el) => el.click());

  // Wait for the shipping section or the new "Continue to shipping" button
  ///////////
  const continueShippingBtn = await page.waitForSelector(
    "::-p-xpath(//button[.//span[text()='Continue to payment']])"
  );
  await continueShippingBtn.evaluate((el) => el.scrollIntoView());
  // Click it
  await continueShippingBtn.evaluate((el) => el.click());
}

async function fillOutPayment(page) {}

async function checkOut() {
  const page = await getPage();

  await addToCart(page);
  await fillOutBilling(page);
}

checkOut();
/*<button aria-busy="false" aria-live="polite" type="submit" class="_1m2hr9ge _1m2hr9gd _1fragemuj _1fragemn2 _1fragemp4 _1fragemtx _1fragemuc _1fragemue _1fragemu3 _1m2hr9g1p _1m2hr9g1l _1fragemoy _1m2hr9g1f _1m2hr9g1c _1fragemu2 _1fragemtr _1m2hr9g20 _1m2hr9g1x _1m2hr9g16 _1m2hr9g13 _1m2hr9gh _1m2hr9gf _1fragem32 _1m2hr9g1w _1m2hr9g19 _1m2hr9g17 _1fragempz _1m2hr9g1k"><span class="_1m2hr9gv _1m2hr9gu _1fragemtt _1fragemu8 _1fragemu2 _1fragemuf _1m2hr9gr _1m2hr9gp _1fragem3c _1fragem87 _1fragemtv">Continue to payment</span></button> */
