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

router.get('/users/:user', function(req, res) {
  	res.json(req.user);
});

router.post('/register', function(req, res, next){
  if(!req.body.username){
    //some error
  }
  if(!req.body.email || !req.body.firstName || !req.body.lastName){
  	return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.netid = req.body.netid;

  user.email = req.body.email;
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.posted = null;

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

exports.index = function(req, res){
  res.render('index', { name: req.session.cas_user, title: 'Grand Master CAS' });
};

exports.splash = function(req, res){
  res.render('splash', { name: req.session.cas_user, title: 'Grand Master CAS' });
};

exports.login = function(req, res) {
  res.redirect('/');
}

module.exports = router;
