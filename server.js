const express = require('express');
const app = express();
const puppeteer = require('puppeteer');

let getContent = async (url) => {
    try {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('https://test.theuxm.com');
        const html = await page.content(); // serialized HTML of page DOM.
        await browser.close();

        // console.log(html);
        // res.send(html);
        return html

    } catch(e) {
        console.log(e);
        // res.send("ERROR");
        return 'Err'
    }
}

const port = 3001;
app.get('*', async (req, res) => {
    const local_url = req.query.url
    console.log(local_url)
    if(!local_url || local_url.indexOf('http')==-1) {
        res.send(null)
        return
    }
    const html = await getContent(local_url)
    return res.status(200).send(html); // Serve prerendered page as response.
});

app.listen(port, () => {
    console.log(`Web server is running at port ${port}`);
});