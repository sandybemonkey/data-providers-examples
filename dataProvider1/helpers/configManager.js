'use strict';

var config = require('../config/config.json'),
    _ = require('lodash');
var Configuration = function(){};

Configuration.prototype._rawConfig = config;

Configuration.prototype.getMongoPort = function(){
    return this._rawConfig.mongo.port;
};

Configuration.prototype.getMongoHost = function(){
    return this._rawConfig.mongo.host;
};

Configuration.prototype.getMongoDb = function(){
    return this._rawConfig.mongo.db;
};

Configuration.prototype.getOptions = function(){
    return this._rawConfig.mongo.options;
};

Configuration.prototype.getReplicationHosts = function(){
    var self = this;
    var hosts = 'mongodb://';
    var data = _.map(this._rawConfig.mongo.hosts, function(host){
        return host+':'+self.getMongoPort();
    });
    hosts+=data.toString()+'/'+self.getMongoDb();

    return hosts;
};

module.exports = Configuration;