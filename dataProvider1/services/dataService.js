var fc = require('./fcService');
var dao = require('./dao');
var config = (new (require('../helpers/configManager.js'))())._rawConfig;

var _ = require('lodash');

function DataService() {
}

var DGFIP_SCOPES = ['dgfip_rfr', 'dgfip_nbpac', 'dgfip_sitfam', 'dgfip_nbpart'],
    DGFIP_OS1_SCOPES = ['dgfip_rfr', 'dgfip_nbpart'],
    DGFIP_OS2_SCOPES = ['dgfip_aft'];

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
                    console.log('scope quotientfamilial allowed for this user : ' + userIdentity.family_name + ' for service provider ' + json.client.client_id + '/' + json.client.client_name);
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

DataService.prototype.formatUserData = function (rawData, serviceNumber) {
    var formattedData;

    if (serviceNumber == 1) {
        formattedData = {
            'rfr': rawData.dgfip_rfr || null,
            'nbPart':rawData.dgfip_nbpart || 1.0
        };
    } else if (serviceNumber == 2) {
        formattedData = {aft: rawData.dgfip_aft || ''};
    } else {
        formattedData = {
            'rfr': rawData.dgfip_rfr || null,
            'sitFam': rawData.dgfip_sitfam || 'C',
            'nbPart': rawData.dgfip_nbpart || 1.0,
            'pac': {
                'nbPac': rawData.dgfip_nbpac || 0
            }
        };
    }

    return formattedData;
};

DataService.prototype.getFakeDgfipDataWithAccessToken = function (accessToken, serviceNumber, callback) {
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
                var scopesList = DGFIP_SCOPES;

                if (serviceNumber == 1) {
                    scopesList = DGFIP_OS1_SCOPES;
                } else if (serviceNumber == 2) {
                    scopesList = DGFIP_OS2_SCOPES;
                }

                var validScopes = _.intersection(allowedScopes, scopesList);

                if (validScopes.length > 0) {
                    console.log('scopes : ' + JSON.stringify(validScopes) + ' allowed for this user : ' + userIdentity.family_name + ' for service provider ' + json.client.client_id + '/' + json.client.client_name);

                    dao.getUserDataDependingOnAllowedScopes(userIdentity, validScopes, function (err, userData) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            var formattedData = self.formatUserData(userData, serviceNumber);
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