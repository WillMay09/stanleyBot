//importing the module, extra is a like a wrapper class
const { timeout } = require("puppeteer");
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

async function fillOutPayment(page) {
  const creditCardInfo = [
    {
      iframe: "iframe[id^='card-fields-number']",
      selector: "input[id='number']",
      value: "4539781755627228",
    },
    {
      iframe: "iframe[id^='card-fields-expiry']",
      selector: "input[id='expiry']",
      value: "05/31",
    },
    {
      iframe: "iframe[id^='card-fields-verification_value']",
      selector: "input[id='verification_value']",
      value: "758",
    },
    { iframe: null, selector: "input[id='name']", value: "Bob Chad" }, // outside iframe
  ];

  for (const { iframe, selector, value } of creditCardInfo) {
    try {
      let frame = page;

      if (iframe) {
        const frameHandle = await page.waitForSelector(iframe, {
          visible: true,
          timeout: 10000,
        });
        frame = await frameHandle.contentFrame();
      }
      await frame.waitForSelector(selector, { visible: true, timeout: 5000 });
      await frame.type(selector, value);
    } catch (error) {
      console.log(`Failed to fill ${error} : ${error.message}`);
    }
  }

  const continueToPayment = await page.waitForSelector(
    "::-p-xpath(//button[.//span[text()='Pay now']])"
  );

  await continueToPayment.evaluate((el) => el.scrollIntoView());

  await continueToPayment.evaluate((el) => el.click());
}

//previous loop

// try {
//   let frame = page;

//   if (iframe) {
//     const frameHandle = await page.waitForSelector(iframe);
//     frame = await frameHandle.contentFrame();
//   }

//   await frame.waitForSelector(selector, { visible: true, timeout: 10000 });
//   await frame.type(selector, value);
// } catch (error) {
//   console.log(`Failed to fill ${selector}: ${error.message}`);
// }
//html elements
/*
card number:
<input required="" aria-required="true" autocomplete="cc-number" id="number" name="number" type="text" inputmode="numeric" pattern="[0-9\s]*" aria-describedby="error-for-number tooltip-for-number" data-current-field="number" class="input-placeholder-color--lvl-22" placeholder="Card number" aria-invalid="true" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 1rem; letter-spacing: normal; line-height: 1.5; color: rgb(0, 0, 0); text-decoration: none; text-transform: none; --placeholder-color: hsl(0, 0%, 44%); padding: calc(0.5 * (-1.5rem + max(2.35714rem, 3.42857rem))) 0.785714rem; transition: padding 0.2s ease-out;">

expiration date:
<input required="" aria-required="true" autocomplete="cc-exp" id="expiry" name="expiry" type="text" inputmode="numeric" pattern="[0-9\s\/]*" aria-describedby="error-for-expiry tooltip-for-expiry" data-current-field="expiry" class="input-placeholder-color--lvl-22" placeholder="Expiration date (MM / YY)" aria-invalid="true" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 1rem; letter-spacing: normal; line-height: 1.5; color: rgb(0, 0, 0); text-decoration: none; text-transform: none; --placeholder-color: hsl(0, 0%, 44%); padding: calc(0.5 * (-1.5rem + max(2.35714rem, 3.42857rem))) 0.785714rem; transition: padding 0.2s ease-out;">

security code:
<input autocomplete="cc-csc" id="verification_value" name="verification_value" type="text" inputmode="numeric" pattern="[0-9]*" aria-describedby="error-for-verification_value tooltip-for-verification_value" data-current-field="verification_value" class="input-placeholder-color--lvl-22" placeholder="Security code" aria-invalid="true" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 1rem; letter-spacing: normal; line-height: 1.5; color: rgb(0, 0, 0); text-decoration: none; text-transform: none; --placeholder-color: hsl(0, 0%, 44%); padding: calc(0.5 * (-1.5rem + max(2.35714rem, 3.42857rem))) 0.785714rem; transition: padding 0.2s ease-out;">

name on card
<input required="" aria-required="true" autocomplete="cc-name" id="name" name="name" type="text" inputmode="text" pattern="" aria-describedby="error-for-name tooltip-for-name" data-current-field="name" class="input-placeholder-color--lvl-22" placeholder="" aria-invalid="false" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 1rem; letter-spacing: normal; line-height: 1.5; color: rgb(0, 0, 0); text-decoration: none; text-transform: none; --placeholder-color: hsl(0, 0%, 44%); padding: calc(1.5px + 0.857143rem + (0.5 * (-2.35714rem + max(2.35714rem, 3.42857rem)))) 0.785714rem calc(-1.5px - 2.35714rem + max(2.35714rem, 3.42857rem) - (0.5 * (-2.35714rem + max(2.35714rem, 3.42857rem)))); transition: padding 0.2s ease-out;">

phone number
<input id="TextField8" name="phone" placeholder="Mobile phone number" type="tel" aria-required="false" aria-labelledby="TextField8-label" autocomplete="tel" class="_7ozb2uq _7ozb2up _1fragemn2 _1fragemum _1fragempz _1fragemts _7ozb2ut _7ozb2us _1fragemu8 _1fragemu3 _1fragemui _7ozb2u11 _7ozb2uv _7ozb2uu _1fragemqn _1fragemqz _7ozb2u15 _7ozb2u1o _7ozb2ur">

Pay button
<button aria-busy="false" aria-live="polite" type="submit" class="_1m2hr9ge _1m2hr9gd _1fragemuj _1fragemn2 _1fragemp4 _1fragemtx _1fragemuc _1fragemue _1fragemu3 _1m2hr9g1p _1m2hr9g1l _1fragemoy _1m2hr9g1f _1m2hr9g1c _1fragemu2 _1fragemtr _1m2hr9g20 _1m2hr9g1x _1m2hr9g16 _1m2hr9g13 _1m2hr9gh _1m2hr9gf _1fragem32 _1m2hr9g1w _1m2hr9g19 _1m2hr9g17 _1fragempz _1m2hr9g1k"><span class="_1m2hr9gv _1m2hr9gu _1fragemtt _1fragemu8 _1fragemu2 _1fragemuf _1m2hr9gr _1m2hr9gp _1fragem3c _1fragem87 _1fragemtv">Pay now</span></button>


<iframe class="card-fields-iframe" frameborder="0" id="card-fields-number-ypw8kgqordq00000" name="card-fields-number-ypw8kgqordq00000" scrolling="no" src="https://checkout.pci.shopifyinc.com/build/102f5ed/number-ltr.html?identifier=&amp;locationURL=" title="Field container for: Card number" style="height: 49px;"></iframe>
expiration date iframe
<iframe class="card-fields-iframe" frameborder="0" id="card-fields-expiry-4y0b8lngrn000000" name="card-fields-expiry-4y0b8lngrn000000" scrolling="no" src="https://checkout.pci.shopifyinc.com/build/102f5ed/expiry-ltr.html?identifier=&amp;locationURL=" title="Field container for: Expiration date (MM / YY)" style="height: 49px;"></iframe>

security code iframe

<iframe class="card-fields-iframe" frameborder="0" id="card-fields-verification_value-vghe767rn3d00000" name="card-fields-verification_value-vghe767rn3d00000" scrolling="no" src="https://checkout.pci.shopifyinc.com/build/102f5ed/verification_value-ltr.html?identifier=&amp;locationURL=" title="Field container for: Security code" style="height: 49px;"></iframe>

Card name iframe

<iframe class="card-fields-iframe" frameborder="0" id="card-fields-name-0hhkgjjzde900000" name="card-fields-name-0hhkgjjzde900000" scrolling="no" src="https://checkout.pci.shopifyinc.com/build/102f5ed/name-ltr.html?identifier=&amp;locationURL=" title="Field container for: Name on card" style="height: 49px;"></iframe>

*/

/*


*/

async function checkOut() {
  const page = await getPage();

  await addToCart(page);
  await fillOutBilling(page);
  await fillOutPayment(page);
}

checkOut();
/*<button aria-busy="false" aria-live="polite" type="submit" class="_1m2hr9ge _1m2hr9gd _1fragemuj _1fragemn2 _1fragemp4 _1fragemtx _1fragemuc _1fragemue _1fragemu3 _1m2hr9g1p _1m2hr9g1l _1fragemoy _1m2hr9g1f _1m2hr9g1c _1fragemu2 _1fragemtr _1m2hr9g20 _1m2hr9g1x _1m2hr9g16 _1m2hr9g13 _1m2hr9gh _1m2hr9gf _1fragem32 _1m2hr9g1w _1m2hr9g19 _1m2hr9g17 _1fragempz _1m2hr9g1k"><span class="_1m2hr9gv _1m2hr9gu _1fragemtt _1fragemu8 _1fragemu2 _1fragemuf _1m2hr9gr _1m2hr9gp _1fragem3c _1fragem87 _1fragemtv">Continue to payment</span></button> */
