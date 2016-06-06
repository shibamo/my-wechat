angular.module('my-wechat', ['ionic',
  'my-wechat.routes','my-wechat.controllers','my-wechat.directives','my-wechat.services',
  'monospaced.elastic'])
  
.config(['$ionicConfigProvider',function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
}])

.run(['$ionicPlatform', '$http', 'messageService', 'contactService', 'dateService', '$rootScope','$window',
function($ionicPlatform, $http, messageService, contactService, dateService, $rootScope,$window) {
  var url = "";

  $rootScope._ = $window._; //Let lodash available in scopes

  if (ionic.Platform.isAndroid()) {
    //url = "/android_asset/www/"; //发现去掉这行在华为机也可以运行
  }

  $http.get(url + "data/json/messages.json").then(function(response) {
    messageService.init(response.data.messages);
  });

  contactService.needInit() && $http.get(url + "data/json/friends.json").then(function(response){
    contactService.init(response.data.results);
  });

  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}])

