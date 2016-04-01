var app = angular.module('tigerMart', ['ui.router']);

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
          return products.getAll();
        }]
      }
    });

  $urlRouterProvider.otherwise('home');
}]);

app.factory('products', ['$http', function($http){
  var o = {
    products: []
  };
  o.getAll = function() {
    return $http.get('/products').success(function(data){
      angular.copy(data, o.products);
    });
  };
  o.create = function(product) {
    return $http.post('/products', product).success(function(data){
      o.products.push(data);
    });
  };
  return o;
}])


app.controller('MainCtrl', [
'$scope',
'products',
function($scope, products){

  $scope.products = products.products;

  $scope.addProduct = function(){
    if(!$scope.title || $scope.title === '') { return; }
    // ADD VALIDATIONS LATER!
    products.create({
      title: $scope.title,
      category: $scope.category,
      description: $scope.description,
      price: $scope.price,
      pictures: $scope.pictures,
      tags: $scope.tags,
      date: new Date(),
      net_id: "mfishman", // NEED TO CHANGE NET_ID!
      active: true
    });
    $scope.title = '';
    $scope.category = '';
    $scope.description = '';
    $scope.price = '';
    $scope.pictures = '';
    $scope.tags = '';
  };

}]);