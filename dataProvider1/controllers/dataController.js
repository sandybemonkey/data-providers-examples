'use strict';

var dataService = require('../services/dataService');

var DataController = function () {
};

function retrieveUserData(accessToken, res){
    dataService.getFakeDgfipDataWithAccessToken(accessToken, function (err, info) {
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
        if(req.params.year === '2016'){
            retrieveUserData(accessToken, res);
        }
        else {
            res.statusCode = 200;
            res.set({'content-type': 'application/json'});
            res.send(JSON.stringify({}));
        }

    }
};

module.exports.DataController = DataController;