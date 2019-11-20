const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://test.theuxm.com');
//   await page.screenshot({path: 'example.png'});
      const html = await page.content(); // serialized HTML of page DOM.
  await browser.close();
  console.log(html);
})();