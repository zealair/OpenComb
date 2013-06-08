

module.exports = function()
{
    var browserify = require('browserify');
    var b = browserify();
    b.add('./test-a.js');
    b.bundle().pipe(process.stdout);
}

module.exports.prototype.bundle = function(list)
{

}

module.exports.prototype.middleware = function(res,rsp,next)
{
    if(req._parsedUrl.pathname=='/opencomb/frontend')
    {

    }
}