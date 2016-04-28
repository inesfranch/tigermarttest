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
          return products.getAll();
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
        user_id: ['$stateParams', 'products', function($stateParams, products) {
          return $stateParams.id;
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
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });
    $stateProvider
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
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

app.factory('products', ['$http', 'auth', function($http, auth){
  var o = {
    products: [],
    user: "",
    user2: ""
  };
  o.getAll = function() {
    return $http.get('/products').success(function(data){
      angular.copy(data, o.products);
    });
  };
  o.getCat = function(cat) {
    return $http.get('/productscat?cat='+cat).success(function(data){
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
    return $http.post('/products/' + user._id, product, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
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
  o.search = function(q) {
    q = q.toString();
    return $http.get("/search?q="+q).success(function(data) {
      angular.copy(data, o.products);
    });
  };
  o.get = function(id) {
    return $http.get("/products/" + id).then(function(res){
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
  o.delProduct = function(productID, userID) {
    return $http.delete('/products/' + productID + '/' + userID).success(function(data){
      console.log(data);
      console.log("Product Deleted...");
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
}]);
app.factory('auth', ['$http', '$window', function($http, $window) {
  var auth = {};

  auth.saveToken = function(token) {
    $window.localStorage['tigermart-token'] = token;
  };

  auth.getToken = function() {
    return $window.localStorage['tigermart-token'];
  };

  auth.isLoggedIn = function(){
    var token = auth.getToken();
    if (token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function() {
    if (auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload;
    }
  };

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logIn = function(user){
    return $http.post('/getUser', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function(){
    $window.localStorage.removeItem('tigermart-token');
  };


  return auth;
}])


// MAIN CONTROLLER
app.controller('MainCtrl', [
'$scope',
'$state',
'products',
'auth',
function($scope, $state, products, auth){

  $scope.products = products.products;

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.data = {
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

  /*if(!sessionStorage.getItem('user')){
    $state.go('welcome');
  }*/

  //$scope.user = JSON.parse(sessionStorage.getItem('user'));

  $scope.user = auth.currentUser();
  console.log($scope.user);

  /*$scope.logOut = function(){
    sessionStorage.removeItem('user');
    $state.go('welcome');
  };*/

  $scope.search = function(){
    console.log(auth.currentUser());
    /*if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}*/
    products.search($scope.q)
  };

  $scope.logOut = function(){
    auth.logOut();
    $state.go('welcome');
  }

}]);

// VIEW PRODUCT CONTROLLER
app.controller('ProductsCtrl', [
'$scope',
'products',
'product',
'$state',
'auth',
function($scope, products, product, $state, auth){
  if(!sessionStorage.getItem('user')) {
    $state.go('welcome');
  } 
  $scope.product = product;

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.changeCat = function(cat){
    products.getCat(cat);
  };

  /*$scope.linkToCat = function(cat){
    products.getAll(cat).error(function(error){
      $scope.error = error;
    })
  };*/

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
  //$scope.tags = product.tags;
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
      //tags: $scope.tags,
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
    //$scope.tags = '';
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
  var user = auth.getToken();
  
  if($state.params.id != user._id) {
    console.log("hello2");
    $state.go('home');
  } 
  $scope.user = user;

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
    $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
  };

  $scope.deleteProduct = function(productID, userID){
    products.delProduct(productID, userID);
    $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
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
    console.log("hello");
    products.editUser(user, user._id).error(function(error){
      $scope.error = error;
    }).success(function() { 
      console.log("hello2");
      $state.go('home'); 
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
    //console.log($scope.tags);

    var picURL = dataUrl1.split("base64,")[1];
    if (!$scope.picFile1)
      picURL = "";

    // ADD VALIDATIONS LATER!
    products.create({
      title: $scope.title,
      category: $scope.category,
      description: $scope.description,
      price: $scope.price,
      pictures: picURL,
      //tags: "tags",
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
    //$scope.tags = '';
  };
}]);

/*app.controller('WelcomeCtrl', [
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
}]);*/

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);