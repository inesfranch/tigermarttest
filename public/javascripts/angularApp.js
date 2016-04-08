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

    $urlRouterProvider.otherwise('home');
  }]);

app.factory('products', ['$http', function($http){
  var o = {
    products: []
  };
  o.getAll = function(cat) {
    console.log(cat);
    return $http.get('/products?cat='+cat).success(function(data){
      angular.copy(data, o.products);
    });
  };
  o.create = function(product) {
    return $http.post('/products', product).success(function(data){
      o.products.push(data);
    });
  };
  o.search = function(q) {
    q = q.toString();
    return $http.get("/search?q="+q).success(function(data) {
      angular.copy(data, o.products);
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
      products.search($scope.q)
    };

    $scope.filterCat = function(){
      products.getAll($scope.cat)
    };

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
    $scope.pictures = null;
    $scope.tags = '';
  };

  $scope.onFileSelect = function(image) {
    if (angular.isArray(image)) {
      image = image[0];
    }

    // This is how I handle file types in client side
    if (image.type !== 'image/png') {
      alert('Only PNG and JPEG are accepted.');
      return;
    }

    $scope.uploadInProgress = true;
    $scope.uploadProgress = 0;
    
    $scope.upload = $upload.upload({
      url: '/upload/image',
      method: 'POST',
      file: image
    }).progress(function(event) {
      $scope.uploadProgress = Math.floor(event.loaded / event.total);
      $scope.$apply();
    }).success(function(data, status, headers, config) {
     $scope.uploadInProgress = false;
// If you need uploaded file immediately 
$scope.uploadedImage = JSON.parse(data);      
}).error(function(err) {
  $scope.uploadInProgress = false;
  console.log('Error uploading file: ' + err.message || err);
});
};
}]);
