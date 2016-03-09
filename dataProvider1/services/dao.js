'use strict';
var mongoose = require('mongoose'),
	configManager = (new (require('../helpers/configManager.js'))());

mongoose.connect(configManager.getReplicationHosts(), configManager.getOptions());

var Schema = mongoose.Schema;

var userSchema = new Schema({
	given_name : String,
	family_name : String,
	dgfip_rfr : Number,
	dgfip_nbpac : Number,
	dgfip_sitfam : String,
	dgfip_nbpart : Number
});
var User = mongoose.model('User', userSchema, 'user');

function Dao() {}

Dao.prototype.getQuotientFamilial = function(userId) {
	// ici, chercher dans la BDDs
	return 9107.41;
};

Dao.prototype.getUserDataDependingOnAllowedScopes = function (identity, scopes, callback) {
	var fieldsToPopulate = scopes.join(' ');

	User.findOne({family_name : identity.family_name, given_name: identity.given_name}, fieldsToPopulate, function (err, userData) {
		if(err){
			console.log('Error retrieving data: '+ err);
			callback(err, null);
		}
		else {
			callback(null, userData._doc);
		}
	});
};

module.exports = new Dao();