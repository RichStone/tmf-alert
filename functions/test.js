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
        console.error('getting authors failed: ' + e);
        return false;
    }
});

// getAllLinks Cloud Function
(async () => {
    try {
        var timestampOneDayBefore = Date.now();
        timestampOneDayBefore = timestampOneDayBefore - 24*360000;
        console.log(timestampOneDayBefore);
        const url = 'https://www.thefastlaneforum.com/community/forums/-/index.rss';
        Feed.load(url, (err, rss) => {
            rss.items.forEach( (item, index, )=> {
                //adjust for timezone difference of rss feed & Date.now()
                const adjustedItemTimestamp = item.created + 24*360000;
                if (adjustedItemTimestamp > timestampOneDayBefore) {
                    console.log(index);
                }
            });
            if (err) {
                console.log('error status rss-to-json Feed.load: ' + err);
            }
        });
    } catch (e) {
        console.error("getting last 24 hour links failed: " + e);
    }
})();