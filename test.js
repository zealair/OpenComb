var browserify = require('browserify');
var b = browserify();
b.add('./test-a.js');
b.bundle().pipe(process.stdout);