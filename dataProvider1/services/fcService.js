var request = require('request');
var config = (new (require('../helpers/configManager.js'))())._rawConfig;

function FcService() {
}

FcService.prototype.checkAccessToken = function (accessToken, callback) {
    var url = config.checkTokenURL;
    request.post({url: url, headers: {'content-type': 'application/json'}, json: {"token": accessToken}}, function (error, response, body) {
        // if the server can't be reached, send this error
        var errorObj = new Error();
        if (!response) {
            errorObj.name = 'fc_unreachable';
            errorObj.message = 'France Connect server can\'t be reached.';
            callback(errorObj, null);
        }
        // if there is a response with code 400, there should be a body. parse it and return an error
        else if (response.statusCode == 400 || response.statusCode == 401) {
            try {
                var bodyObj = response.body;
            }
            // if there is no body, don't crash the server...
            catch (err) {
                callback(err, null);
            }
            // if there is a body, build the error
            if (bodyObj) {
                // check that the body contains an 'error' with 'name' and 'message', still not to crash the server
                if (!('error' in bodyObj) || !('name' in bodyObj['error']) || !('message' in bodyObj['error'])) {
                    var err = new Error();
                    err.name = 'unexpected_error';
                    err.message = 'wrong error from France Connect';
                    callback(err, null);
                }
                // if the error is well formed, return it
                else {
                    errorObj.name = bodyObj.error.name;
                    errorObj.message = bodyObj.error.message;
                    callback(errorObj, null);
                }
            }
        }
        else if (error || (response && response.statusCode == 500)) {
            // if it's another error, it's unexpected and we will not have a body: let's just pass the error up
            callback(error, null);
        }
        // it everything is good, pass the body up
        else if (!error && response.statusCode == 200) {
            callback(null, body);
        }
        else {
            var unknownError = new Error();
            unknownError.name="unknown_error";
            unknownError.message="Unknown error";
            callback(unknownError, null);
        }
    });
};

module.exports = new FcService();
