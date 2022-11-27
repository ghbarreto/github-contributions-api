import { Parser } from './utils/parser';
import puppeteer from 'puppeteer';

import type { Contributions, GitInfo, GitProfile } from './types';

const express = require('express');
const app = express();

app.get('/api/contributions', async (req, res) => {
    const git = new Parser();
    const endpoint = 'https://github.com/ghbarreto';
    const selector = '.js-yearly-contributions';

    const base = await git.parse(endpoint, selector);

    const gitInfo: GitInfo[] = [];

    base.forEach((row: HTMLDivElement) => {
        const last_year_contribution = row.querySelector('.f4').textContent.trim().match(/[0-9]/g).join('');
        const contribution_elements: NodeList = row.querySelectorAll('.js-calendar-graph-svg > g > g');
        const contributions: Contributions = [];

        contribution_elements.forEach((contribution: SVGElement) => {
            const rects: HTMLCollection = contribution.getElementsByTagName('rect');

            Array.from(rects).forEach((rect: SVGElement) => {
                const date_contributed = rect.getAttribute('data-date');
                const count_contributed = rect.getAttribute('data-count');

                return contributions.push({
                    [date_contributed]: Number(count_contributed),
                });
            });

            return contribution;
        });

        gitInfo.push({
            last_year_contribution: Number(last_year_contribution),
            contributions,
        });
    });

    res.status(200).send(gitInfo[0]);
});

app.get('/api/profile', async (req, res) => {
    const git = new Parser();
    const endpoint = 'https://github.com/ghbarreto';
    const selector = '.js-profile-editable-replace';

    const base: NodeList = await git.parse(endpoint, selector);

    const gitProfile: GitProfile = {};

    base.forEach((row: HTMLDivElement) => {
        const avatar = row.querySelector('.avatar').getAttribute('src');
        const full_name = row.querySelector('.vcard-fullname').textContent.trim();
        const username = row.querySelector('.vcard-username').textContent.trim();
        const company_name = row.querySelector('.vcard-details > li .p-org').textContent.trim();
        const company_link = row.querySelector('.vcard-details > li a').getAttribute('href');
        const location = row.querySelector('.vcard-details > .vcard-detail .p-label').textContent;

        return Object.assign(gitProfile, {
            avatar,
            full_name,
            username,
            location,
            company: { company_name, company_link },
        });
    });

    res.status(200).send(gitProfile);
});

app.get('/api/contribution', async (req, res) => {
    const browser = await puppeteer.launch({
        args: [`--window-size=1920,1080`],
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
    const page = await browser.newPage();

    await page.goto('https://www.github.com/ghbarreto');

    await page.waitForSelector('.js-calendar-graph-svg > g > g');

    const svg = await page.$$('.js-calendar-graph-svg > g > g');
    const rect = await svg[2].$$('rect');

    await rect[6].click();

    await page.waitForTimeout(2000);

    await page.$('#js-contribution-activity');
    await page.screenshot({ path: 'screenshot.png' });

    const inner_html = await (
        await (await (await page.$('.contribution-activity-listing')).getProperty('innerHTML')).jsonValue()
    ).trim();
    console.log(inner_html);
    await browser.close();

    res.status(200).send({ inner_html });
});

app.listen(3030, () => {
    console.log(`Example app listening at http://localhost:3030`);
});
