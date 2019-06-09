const fetch = require('node-fetch');
const jsdom = require('jsdom');
const Feed = require('rss-to-json');

// getRecentAuthorActivity Cloud Function
const rssUrl = 'https://www.thefastlaneforum.com/community/forums/-/index.rss';
Feed.load(rssUrl, (feedErr, rss) => {
    const getMatchingAuthors = function (urls) {
        urls.forEach(threadUrl => {
            (async () => {
                //TODO: get authors from database
                const trackedAuthors = ['FierceRacoon', 'AgainstAllOdds', 'levijean', 'Timmy C', 'jpn'];
                //TODO: get current user
                const userId = 'XiKh3MMTySd6lgradgOdGTG6Ojo1';
                const baseUrl = 'https://www.thefastlaneforum.com';
                let response = await fetch(threadUrl);
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
                    response = await fetch(lastThreadPageAbsoluteUrl);
                    textResponse = await response.text();
                    dom = new jsdom.JSDOM(textResponse, {
                        contentType: "text/html",
                        storageQuota: 1000
                    });
                    doc = dom.window.document;

                    const timestampOneDayBefore = Date.now() - 24*3600000;
                    const recentPosts = doc.querySelectorAll('article[data-author]');
                    recentPosts.forEach(post => {
                        let timePublished = post.querySelector('time').getAttribute('data-time')  * 1000;
                        if(timePublished > timestampOneDayBefore) {
                            let author = post.getAttribute('data-author');
                            if (trackedAuthors.includes(author)) {
                                let postContent = post.querySelector('article.message-body').textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
                                newAuthorActivity.push({
                                    'timePublished': timePublished,
                                    'postContent': postContent,
                                    'url': lastThreadPageAbsoluteUrl
                                });
                                console.log(newAuthorActivity[newAuthorActivity.length - 1]);
                            }
                        }
                    });
                } else {
                    const timestampOneDayBefore = Date.now() - 24*3600000;
                    const recentPosts = doc.querySelectorAll('article[data-author]');
                    recentPosts.forEach(post => {
                        let timePublished = post.querySelector('time').getAttribute('data-time')  * 1000;
                        if(timePublished > timestampOneDayBefore) {
                            let author = post.getAttribute('data-author');
                            if (trackedAuthors.includes(author)) {
                                let postContent = post.querySelector('article.message-body').textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
                                newAuthorActivity.push({
                                    'author': author,
                                    'timePublished': timePublished,
                                    'postContent': postContent,
                                    'url': threadUrl
                                });
                                console.log(newAuthorActivity[newAuthorActivity.length - 1]);
                            }
                        }
                    });
                }
            })();
        });
    };

    const last50ThreadUrls = [];
    rss.items.forEach( item => {
        last50ThreadUrls.push(item.link);
    });

    getMatchingAuthors(last50ThreadUrls);

    if (feedErr) {
        console.error('error status rss-to-json Feed.load: ' + feedErr);
    }
});