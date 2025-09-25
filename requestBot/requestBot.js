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
  cookies = await page.cookies();
  await page.evaluate((cookies) => {
    async function addToCart() {
      await fetch("https://www.stanley1913.com/cart/add", {
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
    }
    addToCart;
  }, cookies);
}

async function cartToken(page) {
  await page.evaluate(async () => {
    page.evaluate(
      await fetch("https://www.stanley1913.com/cart.js", {
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
          cookie:
            'cart_currency=USD; BVBRANDID=56693659-b233-4489-9c36-2f881564782d; localization=US; crl8.fpcuid=06ebfb0f-33c9-4b8e-b79c-dd2e0631fdba; OptanonAlertBoxClosed=2025-08-26T23:12:39.338Z; _shopify_y=c9614417-cc19-471a-b15e-de7ec8d55c39; __kla_id=eyJjaWQiOiJZak0yWkRCaU56WXRZMlZoTWkwME16RmtMV0UwTkRNdE9UQmxPR1F4TUdZelkyTTQifQ==; _gcl_au=1.1.983824787.1756249960; _ga=GA1.1.130517865.1756249960; _fbp=fb.1.1756249959894.143426684627137152; _pin_unauth=dWlkPU5tRTBNR1F5TWpJdE5qY3dZeTAwT1dObExUbG1aRGd0T1RoaU0yRmlObUpoTjJaag; _ttp=01K3MAFBJXAS701BS2Y2R67NMG_.tt.0; __BillyPix_uid=v0.4.8-9u9e61yc-met5vq2p; __BillyPix_sid=ID-36-2AD6EC; _cs_c=0; sa-user-id=s%253A0-67a9ae0b-882c-5b30-6730-6d747e06cb93.mQd%252FwUfV9ZrybkTj%252BYASDAKPmnq233S9bQVimxVNSlw; sa-user-id-v2=s%253AH8cUDcFwXP1NfLqZUpTPE0n_d1Y.scrp2qhtTZ6dDw42nVNICvin2rYvSAA9diw%252BaasZOKo; sa-user-id-v3=s%253AAQAKIJz6ivcddqmNNDaZdofvIfX3StT4JYYk1bYiaqDs7nCDEAMYAyDV7rLCBjABOgQv-638QgROH3Jy.DOHMs9s%252BR1IVt90%252B1IVmZxJ8ZbnoPIZZpd5WA35JVxY; addshoppers.com=2%7C1%3A0%7C10%3A1756249960%7C15%3Aaddshoppers.com%7C44%3AZWI0NWMzMDQzZTcwNGYzYTg3NWJlNmUyODUyZWMwNDg%3D%7Cecb7e03b570cb235d6f69206d230efce7b827de2d04ed64cf08280128fb0ca98; _hjSessionUser_1962792=eyJpZCI6ImI0MGEzMTU0LTZmMDEtNThhMi05N2FlLTQ2MTE5ODlmYzM0ZiIsImNyZWF0ZWQiOjE3NTYyNDk5NjA0NDMsImV4aXN0aW5nIjp0cnVlfQ==; cart=hWN2Gb3sa6tTG5zvmk7bnYXJ%3Fkey%3D179551c04c9ba8f291ba433c519b8d1c; apay-session-set=qGK8zTAngFv8XsB41rxmP8Pi1JVz4Z8AFO3WhNfSfBA7QYlTkXbDeMUb7CWIHGc%3D; _orig_referrer=https%3A%2F%2Fwww.google.com%2F; _landing_page=%2Fcollections%2Ftumblers%3Futm_source%3Dgoogle%26utm_medium%3Dcpc%26utm_campaign%3DUS%2520-%2520Brand%2520-%2520Quencher%26bg_source%3Dga%26bg_campaign%3D22820709501%26bg_kw%3Dkwd-1463494690527-mi--pi--ppi-%26bg_source_id%3D765594499579%26gad_source%3D1%26gad_campaignid%3D22820709501%26gbraid%3D0AAAAADDIE2KToUKPXrXcGABtDrlKkfTT_%26gclid%3DCj0KCQjwuKnGBhD5ARIsAD19RsYpGFpE3z-iEzRDGXgJHO1-9HPmXjiXNqErvLyyAi0Prz6j2jwWEJcaAhSSEALw_wcB; __BillyPix_utm={"utm_source":"google","utm_medium":"cpc","utm_campaign":"US - Brand - Quencher","bg_source":"ga","bg_source_id":"765594499579","bg_kw":"kwd-1463494690527-mi--pi--ppi-","bg_campaign":"22820709501"}; sa-u-source=google; sa-u-date=2025-09-17T10:57:20.444Z; _vid_t=AHT9lMWkm1XLMYaQo5AvBhPktvZVRqR+gvol2pH1QId4e4vVwfV/37QsuBbT/NqVr/Keoipz0Pr0d4w4MK+qPeVzrvnFwLLxHoJ9dbE=; avmws=1.000601478568ae3f6845f25996289001.42523113.1758106639.1758107921.9.282314980; _cs_cvars=%7B%221%22%3A%5B%22item_brand%22%2C%22Quenchers%22%5D%2C%222%22%3A%5B%22item_category%22%2C%22Quencher%20Flowstate%20%22%5D%2C%223%22%3A%5B%22item_variant%22%2C%22Pale%20Stone%20Winterscape%22%5D%2C%224%22%3A%5B%22pageType%22%2C%22product%22%5D%7D; __BillyPix_session_id=v0.4.8-lsb4k34a-mfnvatcc_1758108278502; _ga_HL54PQL9WM=GS2.1.s1758106639$o7$g1$t1758108278$j35$l0$h0; _rdt_uuid=1756249959998.10b0bc82-d3b7-4bfd-b770-0fcba40a1706; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Sep+17+2025+06%3A24%3A39+GMT-0500+(Central+Daylight+Time)&version=202502.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=31a5f21e-ae03-42ab-a436-ded35b17c146&interactionCount=2&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&AwaitingReconsent=false&intType=1&geolocation=US%3BTX; _shdfp=eyJub25jZSI6MTc1ODEwODI3OTY5MCwic2hkSWQiOiJhNFV5UE9GWmtUWjA3TmRWV001VCIsImNyZWF0ZWRBdCI6MTc1NjI0OTk2MTE3MiwiaXNQcml2YXRlIjpmYWxzZSwiaXNCb3QiOmZhbHNlLCJ1cGRhdGVkQXQiOjE3NTgxMDY2NDE5OTMsInNob3BpZnlDbGllbnRJZCI6ImM5NjE0NDE3LWNjMTktNDcxYS1iMTVlLWRlN2VjOGQ1NWMzOSJ9; _ga_0LZK6PTNTR=GS2.1.s1758151879$o8$g0$t1758151879$j60$l0$h0; ttcsid_C5504DL6KGKN7QK7RDH0=1758151879473::8bqQ1hyTfispaYsv0I4S.8.1758151879473; ttcsid=1758151879485::i1v6k2MC7gnFQWsVgzON.8.1758151879485; _uetsid=null|1qx9zb|2|fzl|0|2086; _cs_id=ab686053-da7e-af87-cbb6-c9b2e2b3ed62.1756249960.13.1758157676.1758157676.1743520772.1790413960213.1.x; _uetvid=29bce0f082d211f0bc61d939f2922ed2|1ki74er|1758686082461|1|1|bat.bing.com/p/insights/c/e; _shopify_s=53daa3ea-c6a4-451f-bb23-326f26d77daf; _dd_s=rum=0&expire=1758687063048; keep_alive=eyJ2IjoyLCJ0cyI6MTc1ODY4NjE2NDMyNywiZW52Ijp7IndkIjowLCJ1YSI6MSwiY3YiOjEsImJyIjoxfSwiYmh2Ijp7Im1hIjozMDgsImNhIjozLCJrYSI6MCwic2EiOjI4LCJrYmEiOjAsInRhIjowLCJ0IjozNjAwLCJubSI6MSwibXMiOjAuMjUsIm1qIjowLjkyLCJtc3AiOjAuNjUsInZjIjoxLCJjcCI6MC41OCwicmMiOjAsImtqIjowLCJraSI6MCwic3MiOjAuMTYsInNqIjowLjEyLCJzc20iOjAuNzUsInNwIjoyLCJ0cyI6MCwidGoiOjAsInRwIjowLCJ0c20iOjB9LCJzZXMiOnsicCI6MjMsInMiOjE3NTYyNDk5NTE5NzgsImQiOjI0MzUzOTZ9fQ%3D%3D; _shopify_essential=%3AAZjop4IMAAEA5V2w39-9oIZhkcxUGyCC9U7U6SVS-t9uOQhRvSLwf7hmnllZ_kMQHUpJCxJzcnqbuG_jvlbIgY02IacLbN4YJQjC-57V8LbWUYHQk3yZd9pSaCcFciQ59G5O-shzz48ZI4uaueLnCOPojVOsB_k4PzCWosyiAGrrxOJBYPfgDfMj_BjSF9NeJu7ImwlgG_CXKaW_QN3_eLcRDzOUFCwJTEBRYsmnQLNOZQbHkNPJqdvBbg10e7Y-i6Y2QYqVCwy8t-4aoYW3KFpoXIb5KZb75uf-YSNxjKdSQN7yGEx0QRoEriAqOhLxzl3Se3-cQwE-P-3kE_EPA1L_x3Kh1BtZ80vqNCBnupHMTW_EtMvZKjji80s4NlloVv_2l8YQlQL4bXYM5AXPhEjt-Ai4yuun3WmOoZf2pYFv7wAzomO0jKwGFymXEPUtNVqGCHC7ITQm_xYTElya-E0yaPGSqF_zgcy5QaC1uY4cpbckLT2U2unBUpw-eiblnSwY9udbd_wkzCpKzFcnEPDatgEVFVj7wdhkbpNdRh-Ex1_qfVOor-TF_uQ6q9zzoCU%3A; _tracking_consent=3PAMS._US_t_f_njoOXpUdQWyhBNLq1USPAw_%7B%22onetrust.groups%22%3A%22C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%22%2C%22onetrust.datestamp%22%3A%222025-08-26T23%3A12%3A39.338Z%22%7D',
          Referer:
            "https://www.stanley1913.com/products/winterscape-quencher-h2-0-flowstate-tumbler-40-oz?variant=44559799746687",
        },
        body: null,
        method: "GET",
      })
    );
  });
}

async function run() {
  const page = await getPage();
  await page.goto(product_url);
  await byPassRequest(page);
  await cartToken(page);

  console.log("completed");
}

run();
