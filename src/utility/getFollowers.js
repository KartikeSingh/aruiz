const { default: puppeteer } = require("puppeteer");

module.exports = async (username = "BlockPound_") => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
    });

    const page = await browser.newPage();

    await page.goto(`https://twitter.com/${username}`);

    await new Promise(res => setTimeout(res, 3000))

    const followers = await page.evaluate(() => {
        const t = [...document.getElementsByClassName("css-18t94o4")].filter(v => v.textContent.includes("Followers")).map(v => v.textContent)[0]
        
        return t.slice(0, t.indexOf("F"));
    });

    await browser.close();
    
    return followers;
}