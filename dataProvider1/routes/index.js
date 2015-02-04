var express = require('express');
var router = express.Router();
var quotientFamilial = require('../services/quotientFamilialService')

router.get('/', function (req, res) {
    res.render('index');
});

router.get('/quotientfamilial', function (req, res) {

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
        quotientFamilial.getWithAccessToken(accessToken, function (err, info) {
            if (err) {
                if (err.name == 'invalid_request') res.statusCode = 400;
                else if (err.name == 'invalid_token') res.statusCode = 401;
                else if (err.name == 'insufficient_scope') res.statusCode = 403;
                else res.statusCode = 400;
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
                res.send(JSON.stringify(info));
            }
        });
    }
});

module.exports = router;
