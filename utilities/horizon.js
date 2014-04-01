/* Dependencies & Locals
================================================== */
var request     = require('request'),
    async       = require('async'),
    moment      = require('moment'),
    u           = require('underscore'),
    config      = require('./horizon-config.json');


/* Export
================================================== */
module.exports.getPlanetDistancesOnDate = function (date, onAllComplete){

    // Start Session
    module.createHorizonSession(function(horizonRequest){

        // Append to Preperation
        var prepRequests = u.clone(config.prepRequests);

        prepRequests.push({
            "start_time": moment(date).format('YYYY-MM-DD'),
            "stop_time": moment(date).add('d', 1).format('YYYY-MM-DD'),
            "step_size": "1",
            "interval_mode": "d",
            "set_time_span": "Use Specified Times"
        });

        // Run Preperation
        async.eachSeries(prepRequests, horizonRequest, function(error){
            if(error)
                return onAllComplete(error);

            // Get each planet
            async.mapSeries(config.planetRefs, module.makeGetPlanetOnDate(date, horizonRequest), function(error, planets){
                if (error)
                    return onAllComplete(error);
                else
                    onAllComplete(false, planets);
            });
        });
    });
};


// Returns function horizonRequest(formFields, onComplete);
module.createHorizonSession = function (onMakeComplete){

    var horizonUrl = config.url;

    // Make an initial request to retrieve a new session
    request.post(horizonUrl, function(error, res, body) {
        if (error)
            return onComplete(error);

        // Set up the CGI Session
        // Use a 'jar' for the cookie instead of request's global jar. 
        // This is necessary for concurrency.
        var cookieString = res.headers['set-cookie'][0];
        var jar = request.jar();
        jar.setCookie(request.cookie(cookieString), horizonUrl);

        onMakeComplete(function (formFields, onComplete){

            var horizonRequest = request.post({ url: horizonUrl, jar: jar }, function(error, res, body){
                onComplete(error, res, body);
            });

            horizonRequestForm = horizonRequest.form();

            for(var formField in formFields)
                horizonRequestForm.append(formField, formFields[formField]);

            horizonRequest.setHeader('Content-Length', horizonRequestForm.getLengthSync());
        })
    });
};

module.makeGetPlanetOnDate = function(date, horizonRequest){

    var startTime = moment(date).format('YYYY-MM-DD');
    var endTime = moment(date).add('d', 1).format('YYYY-MM-DD');

    return function(planetRef, onComplete){
        
        // Set the Planet
        horizonRequest({
            "body": planetRef.id,
            "select_body": "Select Indicated Body"
        }, function(){

            // Get Ephimeris (Go)
            horizonRequest({
                "go": "Generate Ephemeris"
            }, function(error, res, body){

                var regex = /\$\$SOE([\s\S]*)EOE/g;
                var matches = body.match(regex);
                var distance = matches[0].split(',')[3];             

                onComplete(false, {
                    id: planetRef.id,
                    name: planetRef.name,
                    distance: parseFloat(distance)
                });
            });

        });
    };
};