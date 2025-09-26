const puppeteer = require("puppeteer-extra");
//imports puppeteer plugin, makes it harder for websites to detect what is going on
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const product_url =
  "https://www.stanley1913.com/products/winterscape-quencher-h2-0-flowstate-tumbler-40-oz?variant=44559799746687";

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
  cookies = await page.cookies();
  await page.evaluate(async (cookies) => {
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

        Referer:
          "https://www.stanley1913.com/products/winterscape-quencher-h2-0-flowstate-tumbler-40-oz?variant=44559799746687",
      },
      body: '------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="form_type"\r\n\r\nproduct\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="utf8"\r\n\r\n✓\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="id"\r\n\r\n44559799746687\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="properties[Shipping]"\r\n\r\n\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="product-id"\r\n\r\n8160873676927\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="section-id"\r\n\r\ntemplate--24577119519080__4b86bc5c-f0d6-46d6-8684-1235f066332e\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="quantity"\r\n\r\n1\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="sections"\r\n\r\ncart-notification-product,cart-notification-button,cart-icon-bubble\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf\r\nContent-Disposition: form-data; name="sections_url"\r\n\r\n/products/winterscape-quencher-h2-0-flowstate-tumbler-40-oz\r\n------WebKitFormBoundaryOWiBWvl9BlbO7Vzf--\r\n',
      method: "POST",
    });
  });
}

async function cartToken(page) {
  let response = await page.evaluate(async (cookies) => {
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
        Referer:
          "https://www.stanley1913.com/products/winterscape-quencher-h2-0-flowstate-tumbler-40-oz?variant=44559799746687",
      },
      body: null,
      method: "GET",
    });
    return response.json();
  }, cookies);

  console.log(response);

  return (shippingPageUrl = `https://www.stanley1913.com/checkouts/cn/${response.token}/en-us/information?`);
}

async function run() {
  const page = await getPage();
  await page.goto(product_url);
  await byPassRequest(page);
  let shippingUrl = await cartToken(page);
  await page.goto(shippingUrl);

  console.log("completed");
}

{
  /* <button data-add-to-cart="" type="submit" name="add" id="ProductSubmitButton-template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e-product-form-template--24578131001704__4b86bc5c-f0d6-46d6-8684-1235f066332e-" class="product-form__submit button button--full-width button--primary c-btn c-btn--dark" aria-label="Add to Cart" data-testid="buy-buttons-add-to-cart">
                <span data-add-btn-text="">Add to Cart */
}

run();
