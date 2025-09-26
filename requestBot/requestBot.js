const puppeteer = require("puppeteer-extra");
//imports puppeteer plugin, makes it harder for websites to detect what is going on
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const product_url =
  "https://www.stanley1913.com/products/the-textured-everyday-tumbler-20-oz?variant=53973062615400";

puppeteer.use(StealthPlugin());

let cookies = "";
async function getPage() {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  return page;
}

async function parseCookies(page) {
  //grabbing all the cookies in the browser
  const cookies = await page.cookies();
  let cookieList = "";
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    let cookieString = cookie.name + "=" + cookie.value;
    if (i != cookies.length - 1) {
      cookieString = cookieString + "; ";
    }
    cookieList += cookieString;
  }
  console.log(cookieList);
  return cookieList;
}

async function byPassRequest(page) {
  await page.waitForSelector("button[aria-label='Add to Cart']");

  //grabbing required fields for backend
  //   <input type="hidden" name="product-id" value="8160873676927"></input>;
  //   <input
  //     type="hidden"
  //     name="section-id"
  //     value="template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e"
  //   ></input>;
  //   <input
  //     type="hidden"
  //     name="id"
  //     value="44559799746687"
  //     class="product-variant-id"
  //     data-cart-variant=""
  //   ></input>;
  //   <input
  //     class="quantity__input"
  //     type="number"
  //     name="quantity"
  //     id="Quantity-template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e-product-form-template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e-"
  //     data-cart-quantity=""
  //     data-min="1"
  //     min="1"
  //     step="1"
  //     value="1"
  //     form="product-form-template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e-"
  //     aria-label="Quantity"
  //     mm-min="1"
  //     mm-stock-max="NaN"
  //     max="20"
  //     mm-max="20"
  //     mm-step="1"
  //   ></input>;

  let productId = await page.$eval(
    'input[name="product-id"]',
    (el) => el.value
  );
  let varientId = await page.$eval('input[name="id"]', (el) => el.value);
  let quantity = await page.$eval('input[name="quantity"]', (el) => el.value);
  let sectionId = await page.$eval(
    'input[name="section-id"]',
    (el) => el.value
  ); // optional
  cookies = await parseCookies(page);
  await page.evaluate(
    async (cookies, product_url, productId, varientId, quantity, sectionId) => {
      let response = await fetch("https://www.stanley1913.com/cart/add", {
        headers: {
          accept: "application/javascript",
          "accept-language": "en-US,en;q=0.9",
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundaryOWiBWvl9BlbO7Vzf",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          cookie: cookies,
          Referer: product_url,
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: `------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="form_type"\r\n\r\nproduct\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="utf8"\r\n\r\n✓\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="id"\r\n\r\n${varientId}\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="properties[Shipping]"\r\n\r\n\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="product-id"\r\n\r\n${productId}\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="section-id"\r\n\r\n${sectionId}\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="quantity"\r\n\r\n${quantity}\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="sections"\r\n\r\ncart-notification-product,cart-notification-button,cart-icon-bubble\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="sections_url"\r\n\r\n/products/winterscape-quencher-h2-0-flowstate-tumbler-40-oz\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf--\r\n`,
        method: "POST",
      });
    },
    cookies,
    product_url,
    productId,
    varientId,
    quantity,
    sectionId
  );
}

async function cartToken(page) {
  let response = await page.evaluate(
    async (cookies, product_url) => {
      let response = await fetch("https://www.stanley1913.com/cart.js", {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          cookie: cookies,
          Referer: product_url,
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: null,
        method: "GET",
      });
      return response.json();
    },
    cookies,
    product_url
  );

  console.log(response);

  return (shippingPageUrl = `https://www.stanley1913.com/checkouts/cn/${response.token}/en-us/information?`);
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
  await delay(2000);
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
  try {
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
  } catch (err) {
    console.log(`❌ Failed at checkout navigation: ${err.message}`);
  }
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const page = await getPage();
  await page.goto(product_url);
  await byPassRequest(page);
  let shippingUrl = await cartToken(page);
  await page.goto(shippingUrl);
  await fillOutBilling(page);
  await fillOutPayment(page);

  console.log("completed");
}

{
  /* <button data-add-to-cart="" type="submit" name="add" id="ProductSubmitButton-template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e-product-form-template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e-" class="product-form__submit button button--full-width button--primary c-btn c-btn--dark" aria-label="Add to Cart" data-testid="buy-buttons-add-to-cart">
                <span data-add-btn-text="">Add to Cart */
}

run();
