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
          return products.getUser($stateParams.id);
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
    return $http.post('/products/' + o.user._id, product).success(function(data){
      o.products.push(data);
      o.user.posted.push(data);
    });
  };
  o.register = function(user){
    return $http.post('/register', user).success(function(data){
      o.user = data;  
      console.log(user);
    });
  };
  o.getUser = function(user){
    console.log(user.net_id + "2"); 
    return $http.post('/getUser', user).success(function(data){
      o.user = data;
      console.log(o.user + "1s");
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
  o.getUser = function(netid) {
    return $http.get("/users" + id).then(function(res){
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
function($scope, products){
  //$scope.product = product;
  $scope.user = products.user;
}]);


// FORM CONTROL
app.controller('FormCtrl', [
'$scope',
'products',
function($scope, products){
  $scope.addProduct = function(dataUrl1){
      if(!$scope.title || $scope.title === '') { return; }
    console.log("hello1");
    console.log(products.user);
    console.log("hello2");
    console.log(products.user.net_id);
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
      userid: products.user._id,
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

  $scope.getUser = function() {
    console.log($scope.user.net_id + "1");
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
