var app = angular.module('tigerMart', ['ui.router', 'ngFileUpload', 'ngImgCrop']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',

  function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('home', {
      url: '/home/{category}/{query}',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['$stateParams', 'products', function($stateParams, products){
          return products.search($stateParams.category, $stateParams.query);
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
          return products.getUserInfo($stateParams.id);
        }]
      }
    });
    $stateProvider
    .state('usersprofile', {
      url: '/usersprofile/{id}',
      templateUrl: '/userprofile.html',
      controller: 'OtherUsersCtrl',
      resolve: {
        user2: ['$stateParams', 'products', function($stateParams, products) {
          return products.getOtherUserInfo($stateParams.id);
        }]
      }
    });
    $stateProvider
    .state('verify', {
      url: '/verify/{id}',
      templateUrl: '/verify.html',
      controller: 'VerifyCtrl',
      /*resolve: {
        user: ['$stateParams', 'products', function($stateParams, products) {
          return products.getUserInfo($stateParams.id);
        }]
      }*/
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
          $state.go('home', {category: "All", query: ""});
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
          $state.go('home', {category: "All", query: ""});
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
    $stateProvider
    .state('setNotifications', {
     url: '/setNotifications/{id}',
     templateUrl: '/setNotifications.html',
     controller: 'SetNotificationsCtrl',
    });
    $urlRouterProvider.otherwise('welcome');
  }]);

app.factory('products', ['$http', 'auth', '$window', function($http, auth, $window){
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
      console.log(userid);
      angular.copy(data, userid.posted);
    });
  };
  o.create = function(product, user) {
    
    return $http.post('/products/' + user._id, product/*, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }*/).success(function(data){
      o.products.push(data);
      user.posted.push(data);
      o.matchNotifications(data);
      sessionStorage.removeItem('newProd');
    });
  };
  o.search = function(cat, q) {
    if (q == null) q = "";
    else q = q.toString();
    return $http.get("/search?cat="+cat+"&q="+q).success(function(data) {
      angular.copy(data, o.products);
    });
  };
  o.matchNotifications = function(product) {
    return $http.get("/matchNotifications").success(function(data) {
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].notifications.length; j++) {
          var lctitle = product.title.toLowerCase();
          var lcdescription = product.description.toLowerCase();
          var lcnotification = data[i].notifications[j].toLowerCase();
          if ((lctitle.indexOf(lcnotification) > -1) || (lcdescription.indexOf(lcnotification) > -1)){
            o.send(data[i], product);
          }   
        }
      } 
    });
  };
  o.get = function(id) {
    return $http.get("/products/" + id).then(function(res){
      return res.data;
    });
  };
  o.getUserInfo = function(id) {
    return $http.get("/users/" + id).then(function(res){
      var token = res.data.token;
      window.localStorage['tigermart-token'] = token;
      var user = JSON.parse($window.atob(token.split('.')[1]));
      //sessionStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    });
  };
  o.getOtherUserInfo = function(id) {
    return $http.get("/users/" + id).then(function(res){
      var token = res.data.token;
      window.localStorage['tigermart-token2'] = token;
      var user2 = JSON.parse($window.atob(token.split('.')[1]));
      sessionStorage.setItem('user2', JSON.stringify(user2));
      console.log(user2);
      return res.data;
    });
  };
  o.editProduct = function(product, id, user) {
    return $http.put('/products/' + id, product, user).success(function(data){
      console.log(data);
      $http.get('/products?cat=All').success(function(data){
        angular.copy(data, o.products);
      });
      sessionStorage.removeItem('newProd');
    });
  };
  o.setNotifications= function(notification, user) {
    id = user._id.toString();
    notification = notification.toString();
    return $http.put("/setNotifications/"+id+"?notification="+notification).success(function(data){
      user.notifications.push(notification);
      auth.saveToken(data.token);
      //sessionStorage.setItem('user', JSON.stringify(user));
      
      });
  };

  o.delNotification = function(notification, user) {
    //var user = JSON.parse(sessionStorage.getItem('user'));
    return $http.delete("/notifications/"+user._id+"?notification="+notification).success(function(data){
      console.log("Notification deleted...");
      auth.saveToken(data.token);

    });
  };

  o.send = function(user, product) {
    var title = product.title;
    var description = product.description;
    var price = product.price;
    var id = product._id;
    var to = user.email;
    to = to.toString();
    subject = "A product you were looking for is now available!";
    body = "Hey "+user.firstName+",%0A%0AA new product recently posted for sale on Tiger Mart matched one of your alert notifications: %0A%0ATitle: "+title+"%0ADescription: "+description+"%0APrice: $"+price+"%0Ahttp://tigermart.herokuapp.com/%23/products/"+id+"  %0A%0ACheers, %0AThe TigerMart Team %0A%0ANote: Remember to update your alert notifications if you found what you were looking for!";
    return $http.get("/send?to="+to+"&subject="+subject+"&body="+body);
 };

  o.changeProductAvail = function(id) {
    return $http.put('/products/changeAvail/' + id).success(function(data){
      //console.log(data); 
      $http.get('/products?cat=All').success(function(data){
        angular.copy(data, o.products);
      });
    });
  };
  o.delProduct = function(productID, userID) {
    return $http.delete('/products/' + productID + '/' + userID).success(function(data){
      console.log(data);
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
      try {
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
      }
      catch (err){
        $window.localStorage.removeItem('tigermart-token');
        return false;
      }
    } else {
      return false;
    }
  };
  auth.isVerified = function(){
    var user = auth.currentUser();
    return user.verified;
  }
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

  auth.editUser = function(user, id) {
    return $http.put("/user/" + id, user).success(function(data) {
      console.log(data);
      auth.saveToken(data.token);
    });
  };
  auth.verify =function(code, user){
    return $http.put("/verify/" + user._id +"?code="+code).success(function(data) {
      console.log(data);
      auth.saveToken(data.token);
    });
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
  $scope.cat = "All";

  if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
  $scope.user = auth.currentUser();

  console.log($scope.user);
  $scope.data = {
    availableOptions: [
      {id: '1', name: 'All Categories', value: ''},
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

  /*$scope.logOut = function(){
    sessionStorage.removeItem('user');
    $state.go('welcome');
  };*/

  $scope.search = function(){
    console.log(auth.currentUser());
    if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
    $state.go('home', {category: $scope.cat, query: $scope.q});
  };

  $scope.logOut = function(){
    auth.logOut();
    $state.go('welcome');
  };

  $scope.notification = function() {
    sessionStorage.setItem('notification', $scope.q);
    $state.go('setNotifications', { id: $scope.user._id});
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
    if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
  $scope.user = auth.currentUser();
  $scope.cat = "All";

  $scope.product = product;
  $scope.changeCat = function(cat){
    products.getCat(cat);
  };

  $scope.loadUserPage = function(productuserid) {
    if (productuserid == auth.currentUser()._id) {
      $state.go('users', { id: productuserid});
    }
    else {
      $state.go('usersprofile', { id: productuserid });
    }
  };
  $scope.sameUser = function() {
    var b = ($scope.user.net_id == product.userid.net_id);
    console.log(b);
    return b;
  };

  $scope.search = function(){
    console.log(auth.currentUser());
    if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
    $state.go('home', {category: $scope.cat, query: $scope.q});
    console.log("x");
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
'auth',
'$state',
function($scope, products, product, auth, $state){
  if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
  $scope.user = auth.currentUser();
  $scope.cat = "All";
  console.log($scope.user);
  console.log(product);

  if(sessionStorage.getItem('newProd')){
    var newproduct = JSON.parse(sessionStorage.getItem('newProd'));
    $scope.userid = newproduct.userid;
    $scope.title = newproduct.title;
    $scope.category = newproduct.category;
    $scope.description = newproduct.description;
    $scope.price = newproduct.price;
    //$scope.tags = product.tags;
    $scope.pictures = newproduct.pictures;
    //     pictures: dataUrl1.split("base64,")[1],
  }
  else {
    $scope.userid = product.userid;
    $scope.title = product.title;
    $scope.category = product.category;
    $scope.description = product.description;
    $scope.price = product.price;
    //$scope.tags = product.tags;
    $scope.pictures = product.pictures;
    //     pictures: dataUrl1.split("base64,")[1],
  }
  
$scope.search = function(){
  console.log(auth.currentUser());
  if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
  $state.go('home', {category: $scope.cat, query: $scope.q});
  console.log("x");
};


$scope.editProduct = function(dataUrl1){
    if(!$scope.title || $scope.title === '') { return; }

    var picURL = dataUrl1.split("base64,")[1];
    if (!$scope.picFile1)
      picURL = product.pictures;

    // ADD VALIDATIONS LATER!
    var newProd = {
      title: $scope.title,
      category: $scope.category,
      description: $scope.description,
      price: $scope.price,
      pictures: picURL,
      //tags: $scope.tags,
      date: '',
      month: '',
      day: '',
      year: '',
      userid: '',
      active: true
    };
    sessionStorage.setItem('newProd', JSON.stringify(newProd));
    products.editProduct(newProd, product._id, $scope.user).then(function() {
      $scope.title = '';
      $scope.category = '';
      $scope.description = '';
      $scope.price = '';
      $scope.picFile1 = '';
      //$scope.tags = '';
      $state.go('users', { id: $scope.user._id});

    });
    
  };

  $scope.backbutton = function(){
    $state.go('users', {id: $scope.user._id});
  };

}]);

// USER CONTROLLER
app.controller('UsersCtrl', [
'$scope',
'products',
'$state',
'auth',

function($scope, products, $state, auth){

  //$scope.product = product;
  $scope.cat = "All";
  
  if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
  $scope.user = auth.currentUser();
  user = $scope.user;
  //console.log($scope.user);
  
  //console.log(user);

  if($state.params.id != $scope.user._id) {
    $state.go('home', {category: "All", query: ""});
  } 

  $scope.search = function(){
  //console.log(auth.currentUser());
  if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
  $state.go('home', {category: $scope.cat, query: $scope.q});
  //products.search($scope.q);
  };

    /* $scope.search = function(){
    console.log(auth.currentUser());
    if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
    products.search($scope.cat, $scope.q);
  }; */

  //console.log(user.posted[0].title);
  //sessionStorage.clear();
  var statepref = JSON.parse(sessionStorage.getItem('state'));
  var categorypref = JSON.parse(sessionStorage.getItem('category'));
  var sortpref = JSON.parse(sessionStorage.getItem('sortorder'));




  $scope.data = { // for the navbar
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
  //if (!statepref) {
  $scope.data2 = { // for the user filter
    availableOptions: [
      {id: '1', name: 'Active Posts', value: true},
      {id: '2', name: 'Sold Posts', value: false}
    ],
    selectedOption: {id: '1', name: 'Active Posts', value: true}
  };
  if(statepref) {
    console.log(statepref);
    $scope.data2.selectedOption = statepref;
    console.log($scope.data2);
  }

  $scope.data3 = { // for the user filter
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
  if (categorypref) {
    $scope.data3.selectedOption = categorypref;
  }
  $scope.data4 = { // for the user filter
    availableOptions: [
      {id: '1', name: 'Price: low to high', value: "price"},
      {id: '2', name: 'Price: high to low', value: "-price"},
      {id: '3', name: 'Date: new to old', value: "-date"},
      {id: '4', name: 'Date: old to new', value: "date"}
    ],
    selectedOption: {id: '4', name: 'Date: old to new', value: "date"}
  };
  if (sortpref) {
    $scope.data4.selectedOption = sortpref;
  }
  $scope.changeProductAvailability = function(id){
    console.log($scope.data2.selectedOption);
    sessionStorage.setItem('state', JSON.stringify($scope.data2.selectedOption));
    sessionStorage.setItem('category', JSON.stringify($scope.data3.selectedOption));
    sessionStorage.setItem('sortorder', JSON.stringify($scope.data4.selectedOption));
    products.changeProductAvail(id).then(function(){
      $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
    });
  };

  $scope.deleteProduct = function(productID, userID){
    sessionStorage.setItem('state', JSON.stringify($scope.data2.selectedOption));
    sessionStorage.setItem('category', JSON.stringify($scope.data3.selectedOption));
    sessionStorage.setItem('sortorder', JSON.stringify($scope.data4.selectedOption));
    var c = confirm('Are you sure you want to delete this product? This action is irreversible');
    if (c == true) {
      products.delProduct(productID, userID).then(function(){
        $state.go($state.current, {}, {reload: true});
      });
    } else {
      $state.go($state.current, {}, {reload: false});
    }
    
  };
  $scope.logOut = function(){
    auth.logOut();
    $state.go('welcome');
  };

}]);

// OTHER USER CONTROLLER
app.controller('OtherUsersCtrl', [
'$scope',
'products',
'$state',
'auth',
'user2',
function($scope, products, $state, auth, user2){

  $scope.user2 = JSON.parse(sessionStorage.getItem('user2'));
  $scope.cat = "All";

  if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
  /*$scope.user = auth.currentUser();
  user = $scope.user;

  console.log(user.posted[0].title);*/

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

  $scope.search = function(){
    console.log(auth.currentUser());
    if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
    $state.go('home', {category: $scope.cat, query: $scope.q});
    console.log("x");
  };

  $scope.logOut = function(){
    auth.logOut();
    $state.go('welcome');
  };

}]);

app.controller('EditUserCtrl', [
'$scope',
'products',
'$state',
'auth',

function($scope, products, $state, auth){
  //$scope.product = product;
  if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
  $scope.user = auth.currentUser();
  user = $scope.user;
  $scope.cat = "All";

  $scope.editUser = function() {
    auth.editUser(user, user._id).error(function(error){
      $scope.error = error;
    }).success(function() { 
      $state.go('users', {id: $scope.user._id}); 
    });
  };

  $scope.backbutton = function(){
    $state.go('users', {id: $scope.user._id});
  };

  $scope.search = function(){
    console.log(auth.currentUser());
    if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
    $state.go('home', {category: $scope.cat, query: $scope.q});
    console.log("x");
  };
  $scope.logOut = function(){
    auth.logOut();
    $state.go('welcome');
  };

}]);

app.controller('SetNotificationsCtrl', [
  '$scope',
  'products',
  '$state',
  'auth',
  function($scope, products, $state, auth){
    //$scope.product = product;
    if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
    $scope.user = auth.currentUser();
    $scope.cat = "All";

    if (sessionStorage.getItem('notification')) {
      $scope.notification = sessionStorage.getItem('notification');
      sessionStorage.removeItem('notification');
    }

    $scope.deleteNotification = function(notification) {
      products.delNotification(notification, $scope.user).then(function(){
      $state.go($state.current, {}, {reload:true});
    });
    };

    $scope.setNotifications = function(){
      products.setNotifications($scope.notification, $scope.user).error(function(error) {
        $scope.error = error;
      }).then(function() {
        $state.go($state.current, {}, {reload:true});
      });
      $scope.notification = '';
    };

    $scope.backbutton = function(){
      $state.go('users', {id: $scope.user._id});
    };

    $scope.search = function(){
      console.log(auth.currentUser());
      if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
      $state.go('home', {category: $scope.cat, query: $scope.q});
      console.log("x");
    };

    $scope.logOut = function(){
    auth.logOut();
    $state.go('welcome');
  };

  }]);



// FORM CONTROL
app.controller('FormCtrl', [
'$scope',
'products',
'$state',
'auth',

function($scope, products, $state, auth){
  if (!auth.isLoggedIn()) {$state.go('welcome');}
  if (!auth.isVerified()) {$state.go('verify');}
  $scope.user = auth.currentUser();
  $scope.cat = "All";

  if(sessionStorage.getItem('newProd')){
    var newproduct = JSON.parse(sessionStorage.getItem('newProd'));
    $scope.userid = $scope.user._id;
    $scope.title = newproduct.title;
    $scope.category = newproduct.category;
    $scope.description = newproduct.description;
    $scope.price = newproduct.price;
    //$scope.tags = product.tags;
    $scope.pictures = newproduct.pictures;
    //     pictures: dataUrl1.split("base64,")[1],
  }
  /*else {
    $scope.userid = product.userid;
    $scope.title = product.title;
    $scope.category = product.category;
    $scope.description = product.description;
    $scope.price = product.price;
    //$scope.tags = product.tags;
    $scope.pictures = product.pictures;
    //     pictures: dataUrl1.split("base64,")[1],
  }*/
  $scope.search = function(){
    console.log(auth.currentUser());
    if(!$scope.cat || $scope.cat === '') {$scope.cat = "All";}
    $state.go('home', {category: $scope.cat, query: $scope.q});
  };

  $scope.addProduct = function(dataUrl1){

    var user = $scope.user;

    console.log($scope.title);

    var picURL = dataUrl1.split("base64,")[1];
    if (!$scope.picFile1)
      picURL = "";



    var newProd = {
      title: $scope.title,
      category: $scope.category,
      description: $scope.description,
      price: $scope.price,
      pictures: picURL,
      date: new Date(),
      month: ((new Date()).getMonth() + 1),
      day: (new Date()).getDate(),
      year: (new Date()).getYear() - 100,
      userid: user._id,
      active: true
    };
    sessionStorage.setItem('newProd', JSON.stringify(newProd));
    products.create(newProd, user).error(function(error) {
      $scope.error = error;
    }).then(function() {
      $state.go('home', {category: "All", query: ""});

    });
  };
}]);



app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  if (sessionStorage.getItem('userinfo')){
    $scope.user = JSON.parse(sessionStorage.getItem('userinfo'));
  }
  else{
    $scope.user = {};
  }
  $scope.register = function(){
    sessionStorage.setItem('userinfo', JSON.stringify($scope.user));
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).success(function(){
      sessionStorage.removeItem('userinfo');
      $state.go('verify');
    });
  };
  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
      $scope.user.password = "";
    }).then(function(){
      $state.go('home', {category: "All", query: ""});
    });
    
  };
}]);
app.controller('VerifyCtrl', [
  '$scope',
  'auth',
  '$state',
  function($scope, auth, $state) {
    $window.localStorage.removeItem('tigermart-token');
    if (!auth.isLoggedIn()) {$state.go('welcome');}
    $scope.user = auth.currentUser();
    if (auth.isVerified()){ $state.go('home', {category: "All", query: ""}); }

    $scope.verify = function(){
      auth.verify($scope.code, $scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home', {category: "All", query: ""});
      });
    };
    $scope.logOut = function(){
      auth.logOut();
      $state.go('welcome');
    }
  }]);
app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;

}]);