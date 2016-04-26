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
	if (cat == "All") {
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
	if (cat == "All") {
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
	if(!req.body.title || req.body.title === '' || !req.body.description || req.body.description === '' || 
      !req.body.price || req.body.price === '' || !req.body.category || req.body.category === '') { 
		return res.status(400).json({message: 'Please fill out all the required fields in the form'});
     }
	var product = new Product(req.body);
	product.user = req.user;
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

router.put('/products/:product', function(req, res, next) {
	var editedProduct = req.product;
	editedProduct.title = req.body.title;
	editedProduct.category = req.body.category;
	editedProduct.description = req.body.description;
	editedProduct.price = req.body.price;
	editedProduct.pictures = req.body.pictures;
	editedProduct.tags = req.body.tags;

	editedProduct.save(function(err, product) {
		if(err){ console.log(err);
			return next(err); }
		res.json(product);
	});
});

router.put('/products/changeAvail/:product', function(req, res, next) {
	var editedProduct = req.product;
	editedProduct.active = !editedProduct.active;

	editedProduct.save(function(err, product) {
		if(err){ console.log(err);
			return next(err); }
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

router.put('/user/:user', function(req, res, next) {
	var editedUser = req.user;
	editedUser.firstName = req.body.firstName;
	editedUser.lastName = req.body.lastName;
	editedUser.email = req.body.email;
	console.log(editedUser);

	editedUser.save(function (err, user){
		if(err){ 
			console.log(err);
			return next(err); }
		res.json(user);
	});
});

router.get('/users/:user', function(req, res, next) {
	req.user.populate('posted', function(err, user) {
		if (err) { console.log(err);
			return next(err);}
		res.json(user);
	});
});


router.post('/register', function(req, res, next){
  if(!req.body.net_id || !req.body.email || !req.body.firstName || !req.body.lastName){
  	return res.status(400).json({message: 'Please fill out all the fields in the form'});
  }
  var repeateduser = false;
  var query = User.find({net_id: req.body.net_id});
  query.exec(function(err, user) {
  	if (user && user != '' && user != null) {
  		res.status(400).json({message: 'This user is already registered'});
  	}
  	else {

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

  	}
  });
});

router.post('/getUser', function(req, res, next){
	if(!req.body.net_id) {return res.status(400).json({message: 'Please enter a NetID'});}
	var net_id = req.body.net_id;
	var uqu = User.findOne({'net_id': net_id});
	uqu.exec(function(err, user){
		if (err) {
			return next(err);
		}
		if(!user) {return res.status(400).json({message: 'Unregistered NetID, plase create an account'});}
		res.json(user);
	});
});

router.get('/addproduct', function(req, res) {
  	res.json(req);
});

router.get('/welcome', function(req, res) {
  	res.json(req);
});

/*app.app.get('/splash', function(req, res){
  res.render('splash', {name: req.session.cas_user});
});

app.app.get('/logout', app.cas.logout);

app.app.get('/login', app.cas.bouncer, function(req, res){
  res.redirect('/');
});

app.app.get('/', app.cas.blocker, function(req, res){
  res.render('index', {name: req.session.cas_user});
});*/

/*exports.index = function(req, res){
	res.render('index', {name: req.session.cas_user});
};

exports.splash = function(req, res){
	res.render('splash', {name: req.session.cas_user});
};

exports.login = function(req, res){
	res.redirect('/');
};*/


module.exports = router;


