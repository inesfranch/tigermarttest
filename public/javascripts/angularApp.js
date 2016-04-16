var app = angular.module('tigerMart', ['ui.router', 'ngFileUpload', 'ngImgCrop']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['products', function(products){
          return products.getAll('all');
        }]
      }
    });
    $stateProvider
    .state('products', {
      url: '/products/{id}',
      templateUrl: '/products.html',
      controller: 'ProductsCtrl',
      resolve: {
        product: ['$stateParams', 'products', function($stateParams, products) {
          return products.get($stateParams.id);
        }]
      }
    });
    $stateProvider
    .state('users', {
      url: '/users/{id}',
      templateUrl: '/user.html',
      controller: 'UsersCtrl',
      resolve: {
        user: ['$stateParams', 'products', function($stateParams, products) {
          return products.user($stateParams.id);
        }]
      }
    });
    $stateProvider
    .state('form', {
      url: '/addproduct',
      templateUrl: '/addproduct.html',
      controller: 'FormCtrl',
    });
    $stateProvider
    .state('welcome', {
      url: '/welcome',
      templateUrl: '/welcome.html',
      controller: 'WelcomeCtrl',
    });
    $stateProvider
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'WelcomeCtrl',
    });

    // $urlRouterProvider.when('products');
    // $urlRouterProvider.when('products/:product');
    $urlRouterProvider.otherwise('welcome');
  }]);

app.factory('products', ['$http', function($http){
  var o = {
    products: [],
    user: ""
  };
  o.getAll = function(cat) {
    return $http.get('/products?cat='+cat).success(function(data){
      angular.copy(data, o.products);
    });
  };
  o.create = function(product) {
    return $http.post('/products', product).success(function(data){
      o.products.push(data);
    });
  };
  o.register = function(user){
    console.log("hello2");
  return $http.post('/register', user).success(function(data){
    console.log("hello8");
    o.user = data;
    console.log(o.user);
    //console.log(o.user.net_id);
    });
  };
  o.search = function(q, cat) {
    q = q.toString();
    cat = cat.toString();
    return $http.get("/search?q="+q+"&cat="+cat).success(function(data) {
      angular.copy(data, o.products);
    });
  };
  o.get = function(id) {
    return $http.get("/products/" + id).then(function(res){
      return res.data;
    });
  };
  o.user = function(netid) {
    return $http.get("/users/" + netid).then(function(res){
      return res.data;
    });
  };
  return o;
}])


// MAIN CONTROLLER
app.controller('MainCtrl', [
  '$scope',
  'products',
  function($scope, products){

    $scope.products = products.products;

    $scope.user = products.user;
    
    $scope.search = function(){
      if(!$scope.q || $scope.q === '') { return; }
      if(!$scope.cat || $scope.cat === '') {$scope.cat = "all";}
      products.search($scope.q, $scope.cat)
    };

    $scope.filterCat = function(){
      products.getAll($scope.cat)
    };

}]);

// PRODUCT CONTROLLER
app.controller('ProductsCtrl', [
'$scope',
'products',
'product',
function($scope, products, product){
  $scope.product = product;
}]);

// USER CONTROLLER
app.controller('UsersCtrl', [
'$scope',
'products',
'product',
'user',
function($scope, products, product, user){
  $scope.product = product;
  $scope.user = user;

  // Code from http://www.bootply.com/94444
  $('#myCarousel').carousel({
  interval: 10000
})
$('.carousel .item').each(function(){
  var next = $(this).next();
  if (!next.length) {
    next = $(this).siblings(':first');
  }
  next.children(':first-child').clone().appendTo($(this));
  
  if (next.next().length>0) {
    next.next().children(':first-child').clone().appendTo($(this));
  }
  else {
    $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
  }
})
}]);


// FORM CONTROL
app.controller('FormCtrl', [
'$scope',
'products',
function($scope, products){
  $scope.addProduct = function(dataUrl1){
      if(!$scope.title || $scope.title === '') { return; }
    
    // ADD VALIDATIONS LATER!
    products.create({
      title: $scope.title,
      category: $scope.category,
      description: $scope.description,
      price: $scope.price,
      pictures: dataUrl1.split("base64,")[1],
      tags: $scope.tags,
      date: new Date(),
      month: ((new Date()).getMonth() + 1),
      day: (new Date()).getDate(),
      year: (new Date()).getYear() - 100,
      net_id: "mfishman", // NEED TO CHANGE NET_ID!
      active: true
    });
    $scope.title = '';
    $scope.category = '';
    $scope.description = '';
    $scope.price = '';
    $scope.picFile1 = '';
    $scope.tags = '';
  };
}]);

app.controller('WelcomeCtrl', [
'$scope',
'$state',
'products',
function($scope, $state, products){

  $scope.getuser = function(netid) {

  }
  $scope.register = function() {
    console.log("hello1");
    products.register($scope.user).error(function(error) {
      $scope.error = error;
    }).then(function() {
      $state.go('home');
    });

  };
}]);
