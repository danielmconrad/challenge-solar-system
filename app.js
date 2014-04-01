/* Dependencies & Locals
================================================== */
var express     = require('express');
var app         = express();


/* Router
================================================== */
var router = require('./router');
router.init(app);


/* Start Server
================================================== */
var server = app.listen(8000, function() {
    console.log('Solar System is Listening on port %d', server.address().port);
});