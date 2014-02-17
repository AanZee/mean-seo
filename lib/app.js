var Browser = require("zombie");
var assert = require("assert");
var Cache = require("./cache.js"),
    cache = new Cache();

var browser = new Browser();



exports = module.exports = forwardChecker;

function forwardChecker(req, res, next) {

    var url = req.url;
    var isCrawler = url.match(/\?_escaped_fragment_=/g) != null ? true : false;
    if (isCrawler) {
    	var newUrl = parseUrlFramgment(req),
            cachedVal = cache.cachedCopy(newUrl);

        if (cachedVal){
            res.send(cachedVal)
        }

        else{
            Browser.visit(newUrl, function(e, browser, status) {
                if (e) return cb(e);
                var html = browser.html();
                cache.save("url",html);          
                res.send(html);
            });
        }
    }

    next();
}



function parseUrlFramgment(req) {
    var urlParts = req.url.split('?_escaped_fragment_=');
    console.log(urlParts);
    // If no fragment in URL this is not a request for an HTML snapshot
    // of an AJAX page.
    if (urlParts.length !== 2) return undefined;

    // Express adds a protocol property to the req object.
    var protocol = req.protocol || options.protocol;

    var url = protocol + '://' + req.headers.host;
    var path = urlParts[0];
    var fragment = urlParts[1];

    if (fragment.length === 0) {
        // We are dealing with crawlable an ajax page without a hash fragment
        url += path; // No hashbang or fragment
    } else {
        url += path + '#!' + decodeURIComponent(fragment);
    }

    return url;
}