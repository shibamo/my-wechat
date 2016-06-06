angular.module('my-wechat.directives', [])
.directive('rjHoldActive',['$ionicGesture', '$timeout', '$ionicBackdrop',
function($ionicGesture,$timeout,$ionicBackdrop){
  return {
    scope: false,
    restrict: 'A',
    replace: false,
    link: function(scope, iElm, iAttrs, controller) {
      $ionicGesture.on("hold", function() {
        iElm.addClass('active');
        $timeout(function() {
          iElm.removeClass('active');
        }, 300);
      }, iElm);
    }
  };
}])
.directive('rjCloseBackDrop',[function(){
  return {
    scope: false,
    restrict: 'A',
    replace: false,
    link: function(scope, iElm, iAttrs, controller) {
      var htmlEl = angular.element(document.querySelector('html'));
      htmlEl.on("click", function(event) {
        if (event.target.nodeName === "HTML" &&
        scope.popup.optionsPopup &&
        scope.popup.isPopup) {
          scope.popup.optionsPopup.close();
          scope.popup.isPopup = false;
      }
    });
    }
  };
}])
.directive('resizeFootBar', ['$ionicScrollDelegate', function($ionicScrollDelegate){
  return {
    replace: false,
    link: function(scope, iElm, iAttrs, controller) {
      scope.$on("taResize", function(e, ta) {
        if (!ta) return;
        var scroll = document.body.querySelector("#message-detail-content");
        var scrollBar = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        var taHeight = ta[0].offsetHeight; //http://www.cftea.com/c/2006/12/PCTKER6T0V62S854.asp
        var newFooterHeight = taHeight + 10;
        newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

        iElm[0].style.height = newFooterHeight + 'px';
        scroll.style.bottom = newFooterHeight + 'px';
        scrollBar.scrollBottom();
      });
    }
  };
}])