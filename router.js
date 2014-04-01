/* Dependencies & Locals
================================================== */
var util 		= require('util'),
	distance 	= require('./routes/distance');


/* Init
================================================== */
module.exports.init = function(app){

	// Add attributes to the request
	app.use(module.beforeAll);

	// Have routes individually initialize
	distance.init(app);

	// Fallback when no route is found
	app.use(module.notFound);
};


/* Module Methods
================================================== */
module.beforeAll = function(req, res, next){
	var httpPrefix = (req.connection.encrypted) ? 'https' : 'http';
	var domain = req.headers.host;
	req.serverUrl = util.format('%s://%s', httpPrefix, domain);
	
	next();
};


// If no route is found, send an error
module.notFound =function(req, res){
	res.json({
		error: {
			code: 404,
			description: 'Resource not found'
		},
		_links: {
			next: {
				href: util.format('%s/2010-05-02', req.serverUrl)
			}
		}
	});
};