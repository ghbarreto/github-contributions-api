import { JSDOM } from 'jsdom';
import axios from 'axios';

export const fetch = (params: string) => axios(params);

export class Parser {
    async parse(endpoint, selector) {
        try {
            const { data } = await fetch(endpoint);

            const dom = new JSDOM(data);
            const { document } = dom.window;

            return document.querySelectorAll(selector);
        } catch (err) {
            throw new Error(err);
        }
    }
}
