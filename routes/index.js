var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');

/*router.get('/products', function(req, res, next) {
	Product.find(function(err, products){
		if(err){return next(err);}
		res.json(products);
	});
});*/

router.get('/products', function(req, res, next) {
	var cat = req.query.cat;
	if (cat == "all") {
		Product.find(function(err, products){
			if(err){return next(err);}
			res.json(products);
		});
	}
	else {
		var qu = Product.find({
			'category': cat
		});
		qu.exec(function(err, products){
			if(err){return next(err);}
			res.json(products);
		});
	}

});

router.get('/search', function(req, res, next) {
	var q = req.query.q;
	var cat = req.query.cat;
	if (cat == "all") {
		var qu = Product.find({'$or': [
			{'title': {$regex: q, $options: "i"}},
			{'description': {$regex: q, $options: "i"}}]});
		qu.exec(function(err, products) {
			if(err){return next(err);}
			res.json(products);
		});
	}
	else {
		var qu = Product.find({'$or': [
			{'title': {$regex: q, $options: "i"}, 'category': {$regex: cat}},
			{'description': {$regex: q, $options: "i"}, 'category': {$regex: cat}}]});
		qu.exec(function(err, products) {
			if(err){return next(err);}
			res.json(products);
		});
	}
	
});

router.post('/products/:user', function(req, res, next) {
	var product = new Product(req.body);
	product.user = req.user;
	console.log(req.user);
	console.log(req.user.net_id);
	console.log(req.user.firstName);
	product.save(function(err, product) {
		if(err){ console.log(err);
			return next(err); }
		req.user.posted.push(product);
		req.user.save(function(err, user) {
			if (err) {return next(err);}
			res.json(product);
		})
	});
});

router.param('product', function(req, res, next, id) {
	var query = Product.findById(id);
	query.exec(function(err, product) {
		if (err) {return next(err); }
		if (!product) {return next(new Error('can\'t find product')); }
		req.product = product;
		return next();
	});
});

router.get('/products/:product', function(req, res, next) {
	req.product.populate('userid', function(err, product) {
		if (err) { return next(err); }
		res.json(product);
	});
});

router.param('user', function(req, res, next, id) {
	var query = User.findById(id);
	query.exec(function(err, user) {
		if (err) {return next(err); }
		if (!user) {return next(new Error('can\'t find user')); }
		req.user = user;
		return next();
	});
});

router.get('/users/:user', function(req, res, next) {
	req.user.populate('posted', function(err, user) {
		if (err) {return next(err);}
		res.json(user);
	});
});


router.post('/register', function(req, res, next){
  if(!req.body.username){
    //some error
  }
  if(!req.body.email || !req.body.firstName || !req.body.lastName){
  	return res.status(400).json({message: 'Please fill out all fields'});
  }
  var user = new User();

  user.net_id = req.body.net_id;

  user.email = req.body.email;
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.posted = [];
  user.save(function (err){
    if(err){ 
    	console.log(err);
    	return next(err); }
    res.json(user);
  });
});

router.get('/addproduct', function(req, res) {
  	res.json(req);
});

router.get('/welcome', function(req, res) {
  	res.json(req);
});

//var cas = require('grand_master_cas');
//var routes = require('.');


module.exports = router;

/*module.exports.index = function(req, res){
  res.render('index', { name: req.session.cas_user, title: 'Grand Master CAS' });
};

module.exports.splash = function(req, res){
  res.render('splash', { name: req.session.cas_user, title: 'Grand Master CAS' });
};

module.exports.login = function(req, res) {
  res.redirect('/');
}*/

/*var cas = require('grand_master_cas');

cas.configure({
  casHost: "fed.princeton.edu",   // required
  casPath: "/cas",                  // your cas login route (defaults to "/cas")
  ssl: true,                        // is the cas url https? defaults to false
  port: 443,                        // defaults to 80 if ssl false, 443 if ssl true
  service: "http://localhost:3000", // your site
  sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
  renew: false,                     // true or false, false is the default
  gateway: false,                   // true or false, false is the default
  redirectUrl: '/splash'            // the route that cas.blocker will send to if not authed. Defaults to '/'
});


router.get('/splash', function(req, res){
  res.render('splash', { name: req.session.cas_user, title: 'Grand Master CAS' });
});

 // grand_master_cas provides a logout
router.get('/logout', cas.logout);

 // cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
router.get('/login', cas.bouncer, function(req, res) {
  res.redirect('/');
});

 // cas.blocker redirects to the redirectUrl supplied above if not logged in.
router.get('/', cas.blocker, function(req, res){
  res.render('index', { name: req.session.cas_user, title: 'Grand Master CAS' });
});*/
