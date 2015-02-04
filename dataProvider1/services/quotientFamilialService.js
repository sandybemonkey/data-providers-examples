var fc = require('./fcService');
var dao = require('./dao');
var config = (new (require('../helpers/configManager.js'))())._rawConfig;

function QuotientFamilial() {
}

QuotientFamilial.prototype.getWithAccessToken = function (accessToken, callback) {
    fc.checkAccessToken(accessToken, function (err, res) {
        if (err) {
            callback(err, null);
        }
        else {
            try {
                json = JSON.parse(res);
            }
            catch (err) {
                callback(err,null);
            }
            if (json) {
                var userIdentity = json.identity;
                var allowedScopes = json.scope;

                if (allowedScopes.indexOf(config.scopes['/quotientfamilial']) != -1) {
                    console.log('scope quotientfamilial allowed for this user : ' + userIdentity.family_name);
                    var quotient = dao.getQuotientFamilial(userIdentity);
                    callback(null, {pivotIdentity:userIdentity, quotient:quotient});
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
}

module.exports = new QuotientFamilial();