const fs = require('fs');

const VCR_FILE = process.env.VCR_FILE || '/vcr.jsonl';
const fileStream = fs.createWriteStream(VCR_FILE, { flags: 'a' });
let vcr = [];
if (fs.existsSync(VCR_FILE)) {
    vcr = fs
        .readFileSync(VCR_FILE)
        .toString()
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l));
}

console.log('\n\nagnosticVCR Started\n===================\n');

let customMatcher = null;

const customMatcherScript = process.env.CUSTOM_MATCHER
if (customMatcherScript && fs.existsSync(customMatcherScript)) {
    customMatcher = require(customMatcherScript)
}

function finder(cached, received) {
    const urlParts = received.url.split('?');
    const urlMatched = urlParts[0] === cached.url;
    const queryStringMatched = urlParts[1] === cached.queryString;
    const methodMatched = received.requestOptions.method === cached.method;
    const reqBodyMatched = received.requestData.equals(Buffer.from(cached.reqBody));

    if (customMatcher) {
        return customMatcher({ urlMatched, queryStringMatched, methodMatched, reqBodyMatched }, { cached, received });
    } else {
        const matched = urlMatched && methodMatched;
        return matched;
    }
}

module.exports = {
    *beforeSendRequest(req) {
        const match = vcr.find(c => finder(c, req));
        if (match) {
            console.log('VCR response:', req.url);
            const response = {
                statusCode: match.statusCode,
                header: match.headers,
                body: Buffer.from(match.resBody)
            };
            return { response };
        } else console.log('New request, recording:', req.url);
    },
    *beforeSendResponse(req, res) {
        const urlParts = req.url.split('?');
        const cacheData = {
            url: urlParts[0],
            queryString: urlParts[1],
            method: req.requestOptions.method,
            headers: req.requestOptions.headers,
            statusCode: res.response.statusCode,
            reqBody: req.requestData.toJSON().data,
            resBody: res.response.body.toJSON().data,
        };
        fileStream.write(JSON.stringify(cacheData) + '\n');
        vcr.push(cacheData);
        console.log('Recorded:', req.url);
    }
};
