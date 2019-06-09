const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.addAuthor = functions.firestore
    .document('users/{userId}/trackedAuthors/{newAuthor}')
    .onCreate((snapshot, context) => {
        fetch('https://www.thefastlaneforum.com/community/threads/c-programming-books.88834/')
            .then((response) => {
                return response.text();
            })
            .catch((error) => {
                console.error("something went wrong: " + error);
            })
            .then((body) => {
                console.log(body);
                return body
            })
            .catch((error) => {
                console.error("something went wrong: " + error)
            });
        console.log(context.params.newAuthor);
        console.log(snapshot.data().dateCreated);
        return true
    });

exports.testo = functions.https.onRequest(async (req, res) => {
    const original = req.query.text;
    console.log('goof');
    res.redirect('https://www.google.com/')
});
