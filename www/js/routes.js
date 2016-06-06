angular.module('my-wechat.routes', [])
.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise("/tab/message");

  $stateProvider
  .state("tab",{
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })
  .state("tab.message",{
    url: "/message",
    views: {
      'tab-message':{
        templateUrl: 'templates/tab-message.html',
        controller: 'messageController'
      }
    }
  })
  .state("messageDetail",{
    url: "/messageDetail/:messageId",
    templateUrl: "templates/message-detail.html",
    controller: 'messageDetailController'
  })
  .state("tab.friends",{
    url: "/friends",
    views: {
      "tab-friends": {
        templateUrl: 'templates/tab-friends.html',
        controller: "friendsController"
      }
    }
  })
  .state("tab.find",{
    url: "/find",
    views: {
      "tab-find": {
        templateUrl: 'templates/tab-find.html'
      }
    }
  })
  .state("tab.setting",{
    url: "/setting",
    views: {
      "tab-setting": {
        templateUrl: 'templates/tab-setting.html'
      }
    }
  });
}]);