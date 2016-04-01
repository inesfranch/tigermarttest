var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Product = mongoose.model('Product');

router.get('/products', function(req, res, next) {
	Product.find(function(err, products){
		if(err){return next(err);}
		res.json(products);
	});
});

router.post('/products', function(req, res, next) {
	var product = new Product(req.body);
	product.save(function(err, product) {
		if(err){ return next(err); }
		res.json(product);
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

router.get('/products/:product', function(req, res) {
  res.json(req.product);
});

//var cas = require('grand_master_cas');
//var routes = require('.');


//router.get('/splash', routes.splash);
 // grand_master_cas provides a logout
//router.get('/logout', cas.logout);
 // cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
//router.get('/login', cas.bouncer, routes.login);
 // cas.blocker redirects to the redirectUrl supplied above if not logged in.
//router.get('/', cas.blocker, routes.index);

module.exports = router;
