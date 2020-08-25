const puppeteer = require('puppeteer');
let isFirstTime = true;
let maxTime = 2; /* |--> TEMPORARY */
let currentTime = 0; /* |--> TEMPORARY */
let indexPage = 0;

process.setMaxListeners(Infinity);


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

    await page.waitFor('.jobsearch-SerpJobCard', { timeout: 0 });

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

    //RECURSION TEMPORARY
    if (currentTime >= maxTime) {
        return jobs;
    } else {
        currentTime += 1;
        indexPage += 10;
        const newURL = baseURL + `&start=${indexPage}`;
        return jobs.concat(await startScraping(newURL, { city, job, keywords }));
    }

    //RECURSION DEFINITIVE
    /* if (jobs.length <= 0) {
        return jobs
    } else {
        indexPage += 10;
        const newURL = baseURL + `&start=${indexPage}`;
        return jobs.concat(await startScraping(newURL, { city, job, keywords }));
    } */
   
};

module.exports = { startScraping };
