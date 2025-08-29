//importing the module, extra is a like a wrapper class
const puppeteer = require("puppeteer-extra");
//imports puppeteer plugin, makes it harder for websites to detect what is going on
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
//attaches the plugin instance to the puppeteer
//under the hood the puppeteer object object maintains a list of plugins and applies when the browser is launched
puppeteer.use(StealthPlugin());

const product_url =
  "https://www.stanley1913.com/products/adventure-quencher-travel-tumbler-40-oz?variant=53972889239912";
async function getPage() {
  //creates a new browser instance, running instance of chrome/chromium
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  //await page.goto(product_url);
  //await browser.close();

  return page;
}

async function addToCart(page) {
  //navigates to the page url
  await page.goto(product_url);

  //add to cart
  //waits until the Dom element matching that selector exists before proceeding
  //get a cleaner selector, looks auto generated
  await page.waitForSelector(
    "button[id=ProductSubmitButton-template--24574459871592__4b86bc5c-f0d6-46d6-8684-1235f066332e-product-form-template--24574459871592__4b86bc5c-f0d6-46d6-8684-1235f066332e-]"
  );
  //simulates a real mouse click
  await page.click(
    "button[id=ProductSubmitButton-template--24574459871592__4b86bc5c-f0d6-46d6-8684-1235f066332e-product-form-template--24574459871592__4b86bc5c-f0d6-46d6-8684-1235f066332e-"
  );
  //
  //checkout button
  await page.waitForSelector(
    "button[class=c-btn c-btn--dark u-full cart__checkout]"
  );

  //directly executing a dom query using the dom object(a method on the document object)
  await page.evaluate(() =>
    document
      .getElementsByClassName("c-btn c-btn--dark u-full cart__checkout")[0]
      .click()
  );

  //
}

async function fillOutBilling(page) {
  await page.waitFor(1000);
  await page.type("input[id='TextField0']", "Bob");
  await page.waitFor(100);
  await page.type("input[id='TextField1']", "Chad");
  await page.waitFor(100);
  await page.type("input[id='TextField1']", "Chad");
  await page.waitFor(100);
  await page.type("input[id='shipping-address1']", "Chad");
  await page.waitFor(100);
  await page.type("input[id='TextField4']", "Houston");
  //drop down
  await page.waitFor(100);
  await page.type("input[id='Select1']", "Texas");

  await page.waitFor(100);
  await page.type("input[id='TextField5']", "77046");

  await page.waitFor(100);
  await page.type("input[id='TextField6']", "4445672345");

  await page.waitFor(100);
  await page.type(
    "input[class=_1m2hr9ge _1m2hr9gd _1fragemuj _1fragemn2 _1fragemp4 _1fragemtx _1fragemuc _1fragemue _1fragemu3 _1m2hr9g1p _1m2hr9g1l _1fragemoy _1m2hr9g1f _1m2hr9g1c _1fragemu2 _1fragemtr _1m2hr9g20 _1m2hr9g1x _1m2hr9g16 _1m2hr9g13 _1m2hr9gh _1m2hr9gf _1fragem32 _1m2hr9g1w _1m2hr9g19 _1m2hr9g17 _1fragempz _1m2hr9g1k]"
  );
}

async function checkOut() {
  const page = await getPage();

  await addToCart(page);
}
