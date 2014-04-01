/* Dependencies & Locals
================================================== */
var horizon = require('../utilities/horizon');
var moment = require('moment');


/* Init
================================================== */
module.exports.init = function(app){

    // Listen for a date to give distances from earth
    app.get(/(\d{4}-\d{2}-\d{2})$/, module.get);

};


/* Module Methods
================================================== */
module.get = function(req, res){

    var date = moment(req.params[0])._d;

    horizon.getPlanetDistancesOnDate(date, function(error, planets){
        if(error)
            req.json({ error: error });
        else
            res.json({ planets: planets });
    });
};