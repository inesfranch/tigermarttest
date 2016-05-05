var mongoose = require('mongoose');

var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  net_id: {type: String, lowercase: true, unique: true, required: true},
  hash: String,
  salt: String,
  code: Number,
  verified: {type: Boolean, default: false},
  email: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  notifications: [{type: String, required:false}],
  loggedInAuthKey: String,
  posted: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}]
});

UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
};

UserSchema.methods.generateJWT = function(loggedIn){
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 90);
	var logAuthKey = null;
	if (loggedIn) {
		this.loggedInAuthKey = crypto.randomBytes(16).toString('hex');
		logAuthKey = this.loggedInAuthKey;
	}
	console.log(logAuthKey + "   ---1");
	return jwt.sign({
		_id: this._id,
		net_id: this.net_id,
		email: this.email,
		firstName: this.firstName,
		lastName: this.lastName,
		posted: this.posted,
		notifications: this.notifications,
		verified: this.verified,
		exp: parseInt(exp.getTime() / 1000),
		loggedInAuthKey: logAuthKey,
	}, 'SECRET');
};

mongoose.model('User', UserSchema);