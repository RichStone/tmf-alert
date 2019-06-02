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

// getRecentAuthorActivity Cloud Function
(async () => {
    try {
        const url = 'https://www.thefastlaneforum.com/community/forums/-/index.rss';
        Feed.load(url, (err, rss) => {
            let last50ThreadLinks = [];
            rss.items.forEach( (item, index, )=> {
                last50ThreadLinks.push(item.link);
            });
            // get recentAuthorActivity
            (async () => {
                try {
                    const trackedAuthors = 'FierceRacoon';
                    const baseUrl = 'https://www.thefastlaneforum.com';
                    const url = last50ThreadLinks[0];
                    let response = await fetch('https://www.thefastlaneforum.com/community/threads/what-is-the-best-value-you-ever-paid-for.79713/page-19');
                    let textResponse = await response.text();
                    let dom = new jsdom.JSDOM(textResponse, {
                        contentType: "text/html",
                        storageQuota: 1000
                    });
                    let doc = dom.window.document;
                    let pageNav = doc.querySelector('ul.pageNav-main');

                    let newAuthorActivity = [];
                    if (pageNav) {
                        const lastThreadPageRelativeUrl = pageNav.lastElementChild
                                                                .querySelector('a')
                                                                .getAttribute('href');
                        const lastThreadPageAbsoluteUrl = baseUrl + lastThreadPageRelativeUrl;
                        response = await fetch(url);
                        textResponse = await response.text();
                        dom = new jsdom.JSDOM(textResponse, {
                            contentType: "text/html",
                            storageQuota: 1000
                        });
                        doc = dom.window.document;

                        const timestampOneDayBefore = Date.now() - 24*3600000;
                        console.log(timestampOneDayBefore);
                        const recentPosts = doc.querySelectorAll('article');
                        recentPosts.forEach(post => {
                            try {
                                let timePublished = post.querySelector('time').getAttribute('data-time')  * 1000;
                                console.log(timePublished);
                                if(timePublished > timestampOneDayBefore) {
                                    console.log('BINGO!');
                                    newAuthorActivity.push({'author': 'some', 'timePublished': timePublished});
                                }
                            } catch (e) {
                                console.log('weird type error: ' + e);
                            }
                        });
                    } else {
                        console.log('Thread has one page.')
                    }
                    return pageNav;
                } catch (e) {
                    console.error('getting authors failed: ' + e);
                    return false;
                }
            })();

            if (err) {
                console.log('error status rss-to-json Feed.load: ' + err);
            }
        });
    } catch (e) {
        console.error("getting last 24 hour links failed: " + e);
    }
})();