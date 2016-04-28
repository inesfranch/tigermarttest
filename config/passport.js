var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy(
	function(net_id, password, done) {
		User.findOne({ net_id: net_id}, function(err, user) {
			if (err) {return done(err); }
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