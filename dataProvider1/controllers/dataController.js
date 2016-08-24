'use strict';

var dataService = require('../services/dataService'),
    _ = require('lodash');

var DataController = function () {
};

function retrieveUserData(accessToken, serviceNumber, res){
    dataService.getFakeDgfipDataWithAccessToken(accessToken, serviceNumber, function (err, info) {
        if (err) {
            if (err.name == 'invalid_request') {
                console.error('Invalid request !');
                res.statusCode = 400;
            }
            else if (err.name == 'invalid_token') res.statusCode = 401;
            else if (err.name == 'insufficient_scope') res.statusCode = 403;
            else {
                console.error('unexpected error with token validation : ' + JSON.stringify(err));
                res.statusCode = 400;
            }
            if (!('name' in err)) {
                err.name = 'unexpected_error';
            }
            if (!('message' in err)) {
                err.message = 'unexpected error';
            }
            res.setHeader('WWW-Authenticate', 'Bearer: error="' + err.name + '",error_description="' + err.message + '"');
            res.send(err.name + ":" + err.message);
        }
        else {
            res.statusCode = 200;
            res.set({'content-type': 'application/json'});
            res.send(JSON.stringify(info));
        }
    });
}

DataController.prototype.getUserData = function (req, res) {
    var accessToken;
    try {
        accessToken = req.header('Authorization').split(" ")[1];
    }
    catch(err) {
        console.error(err);
        res.statusCode = 400;
        res.send(err);
    }

    if (accessToken) {
        if(req.params.year === '2014'){
            retrieveUserData(accessToken, null, res);
        }
        else {
            res.statusCode = 200;
            res.set({'content-type': 'application/json'});
            res.send(JSON.stringify({}));
        }

    }
};

DataController.prototype.getDataDependingOnServiceNumber = function (req, res) {
    if(_.contains(['1', '2'], req.params.serviceNumber)){
        var accessToken;
        try {
            accessToken = req.header('Authorization').split(" ")[1];
        }
        catch(err) {
            console.error(err);
            res.statusCode = 403;
            res.send(err);
        }

        if (accessToken) {
            retrieveUserData(accessToken, req.params.serviceNumber, res);
        }
    }
    else {
        console.error('Unavailable service number : ' + req.params.serviceNumber);
        res.statusCode = 404;
        res.send(err);
    }
};

module.exports.DataController = DataController;