const puppeteer = require('puppeteer');
let isFirstTime = true;


async function startScraping(url, { city, job, keywords }) {


    const browser = await puppeteer.launch({ headless: true, slowMo: 50 });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' }); 
    await page.waitFor(2000);

    if (isFirstTime) {
        await page.type('#text-input-what', job, { delay: 50 });
        await page.type('#text-input-where', city, { delay: 50 });
        await page.keyboard.press('Enter');
        await page.waitFor(2000);
        isFirstTime = !isFirstTime;
        baseURL = page.url();
    }

    const jobs = await page.evaluate(() => {
        return Array
        .from(document.querySelectorAll('.jobsearch-SerpJobCard'))
        .map(elem => ({ 
            linkToPage: elem.querySelector('.title a').href, 
            title: elem.querySelector('.title').innerText, 
            location: elem.querySelector('.sjcl').innerText, 
            description: elem.querySelector('.summary').innerText,
            time: elem.querySelector('.jobsearch-SerpJobCard-footer .date').innerText,
            })
        );
    });

    for (let job of jobs) {
        await page.goto(job.linkToPage);
        await page.waitFor(1000);
        let jobDescription = await page.$$eval('.jobsearch-JobComponent-description', 
            elements => elements.map(element => element.innerText)
        );
        jobDescription = jobDescription.toString();
        job['fullDescription'] = jobDescription;
        if (keywords.some(el => jobDescription.includes(el))) job['containWord'] = true;
    };

    await page.close();
    
    return jobs
   
};

module.exports = { startScraping };
