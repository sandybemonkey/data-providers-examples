var fc = require('./fcService');
var dao = require('./dao');
var config = (new (require('../helpers/configManager.js'))())._rawConfig;

var _ = require('lodash');

function DataService() {
}

var DGFIP_SCOPES = ['dgfip_rfr', 'dgfip_nbpac', 'dgfip_sitfam','dgfip_nbpart'];

DataService.prototype.getQuotientFamilialWithAccessToken = function (accessToken, callback) {
    fc.checkAccessToken(accessToken, function (err, res) {
        if (err) {
            callback(err, null);
        }
        else {
            try {
                var json = res;
            }
            catch (err) {
                callback(err, null);
            }
            if (json) {
                var userIdentity = json.identity;
                var allowedScopes = json.scope;

                if (allowedScopes.indexOf(config.scopes['/quotientfamilial']) != -1) {
                    console.log('scope quotientfamilial allowed for this user : ' + userIdentity.family_name+ ' for service provider ' + json.client.client_id + '/' + json.client.client_name);
                    var quotient = dao.getQuotientFamilial(userIdentity);
                    callback(null, {pivotIdentity: userIdentity, quotient: quotient});
                }
                else {
                    var errorObj = new Error();
                    errorObj.name = 'insufficient_scope';
                    errorObj.message = 'You are not authorized for the scope quotientfamilial';
                    callback(errorObj, null);
                }
            }
        }
    });
};

DataService.prototype.formatUserData = function (rawData) {
    var formattedData = {};

    _.forEach(rawData, function (value, key) {
        if (_.contains(DGFIP_SCOPES, key)) {
            if (key !== 'dgfip_nbpac') {
                formattedData[key] = value;
            }
            else {
                formattedData.pac = {
                    nbPac: value
                };
            }
        }
    });

    return formattedData;
};

DataService.prototype.getFakeDgfipDataWithAccessToken = function (accessToken, callback) {
    var self = this;
    fc.checkAccessToken(accessToken, function (err, res) {
        if (err) {
            callback(err, null);
        }
        else {
            try {
                var json = res;
            }
            catch (err) {
                callback(err, null);
            }
            if (json) {
                var userIdentity = json.identity;
                var allowedScopes = json.scope;

                var validScopes = _.intersection(allowedScopes, DGFIP_SCOPES);

                if (validScopes.length > 0) {
                    console.log('scopes : ' + JSON.stringify(validScopes) + ' allowed for this user : ' + userIdentity.family_name+ ' for service provider ' + json.client.client_id + '/' + json.client.client_name);

                    dao.getUserDataDependingOnAllowedScopes(userIdentity, validScopes, function (err, userData){
                       if(err){
                           callback(err, null);
                       }
                        else {
                           var formattedData = self.formatUserData(userData);
                           callback(null, formattedData);
                       }
                    });
                }
                else {
                    var errorObj = new Error();
                    errorObj.name = 'insufficient_scope';
                    errorObj.message = 'You are not authorized for the scopes ' + JSON.stringify(allowedScopes);
                    callback(errorObj, null);
                }
            }
        }
    });
};

module.exports = new DataService();