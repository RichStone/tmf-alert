const fetch = require('node-fetch');
const jsdom = require('jsdom');
const Feed = require('rss-to-json');


// getAuthors Cloud Function
(async () => {
    try {
        const url = 'https://www.thefastlaneforum.com/community/threads/c-programming-books.88834/';
        const response = await fetch(url);
        const textResponse = await response.text();
        const dom = new jsdom.JSDOM(textResponse, {
            contentType: "text/html",
            storageQuota: 1000
        });
        const authors = dom.window.document.querySelectorAll('h4.message-name');
        authors.forEach(author => {
            console.log(author.textContent);
        });
        return authors;
    } catch (e) {
        console.log('something went wrong: ' + e);
        return false;
    }
})();

// getAllLinks Cloud Function
(async () => {
    try {
        const currTime = Date.now();
        const url = 'https://www.thefastlaneforum.com/community/forums/-/index.rss';
        const rssFeedResponse = await fetch(url);

    } catch (e) {
        console.log(e);
    }
})();