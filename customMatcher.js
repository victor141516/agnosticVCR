module.exports = function ({ urlMatched, queryStringMatched, methodMatched, reqBodyMatched }, { cached, received }) {
    console.log('Custom matcher: not using recorded');
    return false;
}