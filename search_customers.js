const OAuth = require('oauth')
const async = require('async')
const _ = require('lodash')

// YOU CAN FIND THIS ON YOUR TWITTER DEVELOPER CONSOLE
const CLIENT_ID = 'YOUR TWITTER CONSUMER KEY'
const CLIENT_SECRET = 'YOUR TWITTER CONSUMER SECRET'
const ACCESS_TOKEN = 'YOUR ACCESS TOKEN'
const ACCESS_SECRET = 'YOUR ACCESS SECRET'

const keywords = ['keyword1', 'keyword2', 'keyword3']

const oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    CLIENT_ID,
    CLIENT_SECRET,
    '1.0A', '127.0.0.1/callback', 'HMAC-SHA1'
)

function searchUsersByProfile(keyword, access_token, access_secret, callback) {
    var url = `https://api.twitter.com/1.1/users/search.json?q=${keyword}`
    oauth.get(url, access_token, access_secret, (error, data, response) => {
        if (error) callback(error)
        else callback(null, JSON.parse(data))
    })
}

function searchUsersByTweets(keyword, access_token, access_secret, callback) {
    var url = `https://api.twitter.com/1.1/search/tweets.json?q=${keyword}&count=100`
    oauth.get(url, access_token, access_secret, (error, data, response) => {
        if (error) callback(error)
        else {
            var parsed = JSON.parse(data)
            callback(null, (parsed && parsed.statuses) ? parsed.statuses : [])
        }
    })
}

// EXAMPLE OF USAGE
var users_by_profile = []
var users_by_tweets = []

async.each(keywords, function(k, callback) {
    searchUsersByProfile(k, ACCESS_TOKEN, ACCESS_SECRET, (error, u) => {
        if (error) callback(error)
        else {
            users_by_profile.push(... u)

            searchUsersByTweets(k, ACCESS_TOKEN, ACCESS_SECRET, (error, tweets) => {
                if (error) callback(error)
                else {
                    users_by_tweets.push(... _.map(tweets, 'user'))
                    callback()
                }
            })
        }
    })
}, function(error) {
    if (error) console.log(error)
    else {
        users_by_profile = _.uniqBy(users_by_profile, 'screen_name')
        users_by_tweets = _.uniqBy(users_by_tweets, 'screen_name')
        console.log('Finished with queries: ', users_by_profile.length, ' users by profile, ', users_by_tweets.length, ' users by tweets')
    }
})
