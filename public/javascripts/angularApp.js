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
          return products.getAll('All');
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
          return products.getUserInfo($stateParams.id);
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
    $stateProvider
    .state('editUser', {
      url: '/editUser/{id}',
      templateUrl: '/editUser.html',
      controller: 'EditUserCtrl',
      resolve: {
        user: ['$stateParams', 'products', function($stateParams, products) {
          return products.getUserInfo($stateParams.id);
        }]
      }
    });
    $stateProvider
    .state('index', {
      url: '/index',
      templateUrl: '/index.html',
      controller: 'WelcomeCtrl',
    });
    $stateProvider
    .state('splash', {
      url: '/splash',
      templateUrl: '/splash.html',
      controller: 'WelcomeCtrl',
    });
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
    var user = JSON.parse(sessionStorage.getItem('user'));
    return $http.post('/products/' + user._id, product).success(function(data){
      o.products.push(data);
      user.posted.push(data);
      sessionStorage.setItem('user', JSON.stringify(user));
    });
  };
  o.register = function(user){
    return $http.post('/register', user).success(function(data){
      o.user = data;
      sessionStorage.setItem('user', JSON.stringify(data));  
    });
  };
  o.getUser = function(user){
    return $http.post('/getUser', user).success(function(data){
      o.user = data;
      sessionStorage.setItem('user', JSON.stringify(data));
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
  o.getUserInfo = function(id) {
    return $http.get("/users/" + id).then(function(res){
      sessionStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    });
  };
  o.editUser = function(user) {
    console.log(user);
  };
  return o;
}])


// MAIN CONTROLLER
app.controller('MainCtrl', [
'$scope',
'$state',
'products',
function($scope, $state, products){

  $scope.products = products.products;

  if(!sessionStorage.getItem('user')){
    $state.go('welcome');
  }

  $scope.user = JSON.parse(sessionStorage.getItem('user'));

  $scope.logOut = function(){
    sessionStorage.removeItem('user');
    $state.go('welcome');
  };

  $scope.search = function(){
    if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
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
'$state',

function($scope, products, product, $state){
  if(!sessionStorage.getItem('user')) {
    $state.go('welcome');
  } 
  $scope.product = product;
}]);

// USER CONTROLLER
app.controller('UsersCtrl', [
'$scope',
'products',
'$state',

function($scope, products, $state){
  //$scope.product = product;
  if(!sessionStorage.getItem('user')) {
    console.log("hello");
    $state.go('welcome');
  } 

  $scope.user = JSON.parse(sessionStorage.getItem('user'));

}]);

app.controller('EditUserCtrl', [
'$scope',
'products',
'$state',

function($scope, products, user){
  //$scope.product = product;
  if(!sessionStorage.getItem('user')) {
    console.log("hello");
    $state.go('welcome');
  } 

  $scope.user = JSON.parse(sessionStorage.getItem('user'));

  $scope.editUser = function(){
    console.log("hello");
    products.editUser($scope.user).error(function(error){
      $scope.error = error;
    }).then(function() {
      $state.go('users');
    });
  };
}]);


// FORM CONTROL
app.controller('FormCtrl', [
'$scope',
'products',
'$state',

function($scope, products, $state){
  if(!sessionStorage.getItem('user')) {
    $state.go('welcome');
  } 

  $scope.addProduct = function(dataUrl1, mySingleField){

    var user = JSON.parse(sessionStorage.getItem('user'));

    console.log($scope.title);
    console.log(document.getElementById("mySingleField").value);
    console.log($scope.tags);

    // ADD VALIDATIONS LATER!
    products.create({
      title: $scope.title,
      category: $scope.category,
      description: $scope.description,
      price: $scope.price,
      pictures: dataUrl1.split("base64,")[1],
      tags: "tags",
      date: new Date(),
      month: ((new Date()).getMonth() + 1),
      day: (new Date()).getDate(),
      year: (new Date()).getYear() - 100,
      userid: user._id,
      active: true
    }).error(function(error) {
      $scope.error = error;
    }).then(function() {
      $state.go('home');
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

  $scope.getUser = function() {
    products.getUser($scope.user).error(function(error){
      $scope.error = error;
    }).then(function() {
      $state.go('home');
    });
  }

  $scope.register = function() {
    products.register($scope.user).error(function(error) {
      $scope.error = error;
    }).then(function() {
      $state.go('home');
    });

  };
}]);
