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
    .state('productsEdit', {
      url: '/products/{id}/edit',
      templateUrl: '/productsEdit.html',
      controller: 'ProductsEditCtrl',
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
    .state('usersprofile', {
      url: '/usersprofile/{id}',
      templateUrl: '/userprofile.html',
      controller: 'UsersCtrl',
      resolve: {
        user2: ['$stateParams', 'products', function($stateParams, products) {
          return products.getOtherUserInfo($stateParams.id);
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
    user: "",
    user2: ""
  };
  o.getAll = function(cat) {
    return $http.get('/products?cat='+cat).success(function(data){
      angular.copy(data, o.products);
    });
  };
  o.getUserProducts = function(userid) {
    return $http.get('/products?net_id='+userid.net_id).success(function(data){
      angular.copy(data, userid.posted);
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
  o.getOtherUserInfo = function(id) {
    return $http.get("/users/" + id).then(function(res){
      sessionStorage.setItem('user2', JSON.stringify(res.data));
      return res.data;
    });
  };
  o.editUser = function(user, id) {
    return $http.put("/user/" + id, user).success(function(data) {
      console.log(data);
      sessionStorage.setItem('user', JSON.stringify(data));
    });
  };
  o.editProduct = function(product, id) {
    return $http.put('/products/' + id, product).success(function(data){
      console.log(data);
      console.log("Product Edited...");
      $http.get('/products?cat=All').success(function(data){
      angular.copy(data, o.products);
      });
    });
  };
  o.changeProductAvail = function(id) {
    return $http.put('/products/changeAvail/' + id).success(function(data){
      console.log(data);
      console.log("Product Availability changed...");
      $http.get('/products?cat=All').success(function(data){
      angular.copy(data, o.products);
      });
    });
  };
  /*o.filterActive = function(user) {
    return $http.get("/active?user="+user).success(function(data){
      angular.copy(data, o.products);
    });
  };*/
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

// VIEW PRODUCT CONTROLLER
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

  $scope.linkToCat = function(cat){
    console.log("HELLO "+ cat);
    $state.go('home');
    products.getAll(cat).error(function(error){
      $scope.error = error;
    })
  };

  $scope.linkToUser = function(userid){
    console.log("HELLO " + userid.firstName + " " + userid.lastName);
    $state.go('home');
    products.getUserProducts(userid).error(function(error){
      $scope.error = error;
    })
  };
}]);

// EDIT PRODUCT CONTROLLER
app.controller('ProductsEditCtrl', [
'$scope',
'products',
'product',
function($scope, products, product){
  $scope.userid = product.userid;
  $scope.title = product.title;
  $scope.category = product.category;
  $scope.description = product.description;
  $scope.price = product.price;
  $scope.tags = product.tags;
  $scope.pictures = product.pictures;
  //     pictures: dataUrl1.split("base64,")[1],

$scope.editProduct = function(dataUrl1){
    if(!$scope.title || $scope.title === '') { return; }

    // ADD VALIDATIONS LATER!
    products.editProduct({
      title: $scope.title,
      category: $scope.category,
      description: $scope.description,
      price: $scope.price,
      pictures: dataUrl1.split("base64,")[1],
      tags: $scope.tags,
      date: '',
      month: '',
      day: '',
      year: '',
      userid: '',
      active: true
    }, product._id);
    $scope.title = '';
    $scope.category = '';
    $scope.description = '';
    $scope.price = '';
    $scope.picFile1 = '';
    $scope.tags = '';
  };
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
  $scope.user2 = JSON.parse(sessionStorage.getItem('user2'));

  $scope.data = {
    availableOptions: [
      {id: '1', name: 'Active Posts', value: true},
      {id: '2', name: 'Sold Posts', value: false}
    ],
    selectedOption: {id: '1', name: 'Active Posts', value: true}
  };

  $scope.data2 = {
    availableOptions: [
      {id: '1', name: 'All', value: ''},
      {id: '2', name: 'Apparel', value: 'Apparel'},
      {id: '3', name: 'Dorm Items', value: "Dorm Items"},
      {id: '4', name: 'Electronics', value: "Electronics"},
      {id: '5', name: 'Food and Drinks', value: "Food and Drinks"},
      {id: '6', name: 'Furniture', value: "Furniture"},
      {id: '7', name: 'Textbooks', value: "Textbooks"},
      {id: '8', name: 'Tickets', value: "Tickets"},
      {id: '9', name: 'Transportation', value: "Transportation"},
      {id: '10', name: 'Other', value: "Other"}
    ],
    selectedOption: {id: '1', name: 'All', value: ''}
  };

  $scope.data3 = {
    availableOptions: [
      {id: '1', name: 'Price: low to high', value: "price"},
      {id: '2', name: 'Price: high to low', value: "-price"},
      {id: '3', name: 'Date: new to old', value: "-date"},
      {id: '4', name: 'Date: old to new', value: "date"}
    ],
    selectedOption: {id: '4', name: 'Date: old to new', value: "date"}
  };

  $scope.changeProductAvailability = function(id){
    products.changeProductAvail(id);
  };

}]);

app.controller('EditUserCtrl', [
'$scope',
'products',
'$state',

function($scope, products, $state){
  //$scope.product = product;
  if(!sessionStorage.getItem('user')) {
    console.log("hello");
    $state.go('welcome');
  } 

  var user = JSON.parse(sessionStorage.getItem('user'));
  $scope.user = user;

  $scope.editUser = function() {
    products.editUser(user, user._id).error(function(error){
      $scope.error = error;
    }).success(function() { $state.go('home'); });
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
  };

  $scope.register = function() {
    products.register($scope.user).error(function(error) {
      $scope.error = error;
    }).then(function() {
      $state.go('home');
    });

  };
}]);
