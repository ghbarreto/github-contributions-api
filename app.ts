import { Parser } from './utils/parser';

import type { Contributions, GitInfo } from './types';

const express = require('express');
const app = express();

app.get('/api', async (req, res) => {
    const git = new Parser();
    const endpoint = 'https://github.com/ghbarreto';
    const selector = '.js-yearly-contributions';

    const base = await git.parse(endpoint, selector);

    const gitInfo: GitInfo[] = [];

    base.forEach(row => {
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

app.listen(3030, () => {
    console.log(`Example app listening at http://localhost:3030`);
});
