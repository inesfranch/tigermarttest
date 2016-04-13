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

    // $urlRouterProvider.when('products');
    // $urlRouterProvider.when('products/:product');
    $urlRouterProvider.otherwise('home');
  }]);

app.factory('products', ['$http', function($http){
  var o = {
    products: []
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


app.controller('MainCtrl', [
  '$scope',
  'products',
  function($scope, products){

    $scope.products = products.products;
    
    $scope.search = function(){
      if(!$scope.q || $scope.q === '') { return; }
      if(!$scope.cat || $scope.cat === '') {$scope.cat = "all";}
      products.search($scope.q, $scope.cat)
    };

    $scope.filterCat = function(){
      products.getAll($scope.cat)
    };

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

app.controller('ProductsCtrl', [
'$scope',
'products',
'product',
function($scope, products, product){
  $scope.product = product;

  

  // FUNCTION GOES HERE!


  //$scope.product = products.products[$stateParams.id];
}]);

app.controller('UsersCtrl', [
'$scope',
'products',
'user',
function($scope, products, user){
  $scope.user = user;

  

  // FUNCTION GOES HERE!


  //$scope.product = products.products[$stateParams.id];
}]);
