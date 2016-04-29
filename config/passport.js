var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'net_id',
    passwordField: 'password'
	},
	function(username, password, done) {
		console.log(username + "1");
		User.findOne({ 'net_id': username}, function(err, user) {
			if (err) {
				return done(err); 
			}
			if (!user) {
				return done(null, false, {message: 'Incorrect NetID.'});
			}
			if (!user.validPassword(password)) {
				return done(null, false, {message: 'Incorrect password.'});
			}
			return done(null, user);
		});
	}
));