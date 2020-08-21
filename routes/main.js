const express = require('express');
const router = express.Router();
const { startScraping } = require('../public/javascript/scraping');
const { countries } = require('../utils/countriesList');

router.get('/', (req, res) => {
    res.render('homepage', { countries });
});

router.post('/', async (req, res) => {
    let { city, job, countryCode, keywords } = req.body;
    keywords = keywords.split(' ');

    const jobsLinks = await startScraping(`https://${countryCode.toLowerCase()}.indeed.com/?r=us`, { city, job, keywords });

    if (jobsLinks.length > 0) {
        res.render('jobs', { jobs: jobsLinks, nameJob: job, city });
    } else {
        res.redirect('/error');
    }
});

router.get('/error', (req, res) => {
    res.render('error');
});


module.exports = router;