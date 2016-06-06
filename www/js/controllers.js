angular.module('my-wechat.controllers', [])
.controller('messageController',['$scope','$state','$ionicPopup','localStorageService','messageService',
function($scope,$state,$ionicPopup,localStorageService,messageService){

  $scope.$on("$ionicView.beforeEnter",function(){
    $scope.messages = messageService.getAllMessages();
    $scope.popup = {
      isPopup: false,
      index: 0
    };
  });
  $scope.noReadMessages = function(){
    return _.reduce($scope.messages,
                    function(sum,o){return sum+o.noReadMessages},
                    0);
  };
  $scope.onSwipeLeft = function(){
    $state.go("tab.friends");
  };
  $scope.popupMessageOptions = function(message){ //弹出消息操作选项
    
    $scope.popup.index = $scope.messages.indexOf(message);
    $scope.popup.optionsPopup = $ionicPopup.show({
      templateUrl: "templates/popup.html",
      scope: $scope
    });
    $scope.popup.isPopup = true;
  };

  $scope.markMessage = function(){//标记未读已读
    var message = $scope.messages[$scope.popup.index];
    if (message.showHints) {
      message.showHints = false;
      message.noReadMessages = 0;
    } else {
      message.showHints = true;
      message.noReadMessages = 1;
    }
    $scope.popup.optionsPopup.close();
    $scope.popup.isPopup = false;
    messageService.updateMessage(message);
  };

  $scope.deleteMessage = function() {
    var message = $scope.messages[$scope.popup.index];
    $scope.messages.splice($scope.popup.index, 1);
    $scope.popup.optionsPopup.close();
    $scope.popup.isPopup = false;
    messageService.deleteMessageId(message.id);
    messageService.clearMessage(message);
  };

  $scope.topMessage = function() {//置顶
    var message = $scope.messages[$scope.popup.index];
    if (message.isTop) {
      message.isTop = 0;
    } else {
      message.isTop = new Date().getTime();
    }
    $scope.popup.optionsPopup.close();
    $scope.popup.isPopup = false;
    messageService.updateMessage(message);
  };

  $scope.messageDetails = function(message) {
    $state.go("messageDetail", {
      "messageId": message.id
    });
  };
}])
.controller("messageDetailController",['$stateParams','$scope','$window','$ionicScrollDelegate',
  '$timeout','messageService',
function($stateParams,$scope,$window,$ionicScrollDelegate,$timeout,messageService){
  
  //能否放到$ionicView.beforeEnter事件中赋值
  $scope.messageNum = 0;
  
  $scope.doRefresh = function(){
    $scope.messageNum += 5;
    $timeout(function(){
        $scope.messageDetails = messageService.getAmountMessageById($scope.messageNum,
          $stateParams.messageId);
        $scope.$broadcast('scroll.refreshComplete'); //http://ionicframework.com/docs/api/directive/ionRefresher/
    },200);
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
    $scope.message = messageService.getMessageById($stateParams.messageId);
    $scope.message.noReadMessages = 0;
    $scope.message.showHints = false;
    messageService.updateMessage($scope.message);
    $scope.messageNum = 10;
    $scope.messageDetails = messageService.getAmountMessageById($scope.messageNum,
      $stateParams.messageId);
    $timeout(function() {
      viewScroll.scrollBottom();
    }, 50);
  });
}])
.controller("friendsController",['$scope','$state','contactService','$ionicScrollDelegate','$window','$location',
function($scope,$state,contactService,$ionicScrollDelegate,$window,$location){
  $scope.contactListCache = {};
  $scope.previousLetter = "";
  $scope.isDragging = false;

  $scope.$on("$ionicView.beforeEnter",function(){
    _.forEach($scope.validContactsFirstLetterList, $scope.getContactsByFirstLetter);
  });
  $scope.onSwipeLeft = function() {
    $state.go("tab.find");
  };
  $scope.onSwipeRight = function() {
    $state.go("tab.message");
  };
  $scope.contacts_right_bar_swipe = function(e){
    var barHeight = $(".kingc-contacts-right-bar-inner").height(),
        lettersCount = $scope.validContactsFirstLetterList.length,
        letter = $scope.validContactsFirstLetterList[parseInt(e.gesture.center.pageY / (barHeight / lettersCount + 2))-2];

    $scope.isDragging = true;
    if($scope.previousLetter != letter){
      $scope.previousLetter = letter;
      $scope.scrollTo(letter);
    }
  };
  $scope.onRelease = function(e){
    $scope.isDragging = false;
  };
  $scope.getContactsCount = function(){
    return contactService.getUserNames() ? contactService.getUserNames().length : 0;
  };
  $scope.validContactsFirstLetterList = contactService.getValidContactsFirstLetterList();
  $scope.getContactsByFirstLetter = function(firstLetter) {
    if (!$scope.contactListCache[firstLetter]){
        $scope.contactListCache[firstLetter] = contactService.getContactsByFirstLetter(firstLetter);
    }
    return $scope.contactListCache[firstLetter];
  };
  $scope.scrollTo = function(letter){
    //var o = $ionicScrollDelegate.getScrollPosition();
    var topB = angular.element($window.document.getElementById("index-bar-B")).offset().top;
    //console.log(angular.element($window.document.getElementById("index-bar-"+letter)).offset().top-topB);
    $location.hash("index-bar-"+letter);
    $ionicScrollDelegate.anchorScroll(false);
    //$ionicScrollDelegate.scrollTop(true);
  };
  $scope.scrollTop = function(){
    $ionicScrollDelegate.scrollTop(true);
  };

}])