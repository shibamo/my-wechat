angular.module('my-wechat.services', [])
.constant('_', window._) //define Lodash as service
.factory('localStorageService', [function(){
  return {
    get: function (key,defaultValue){
      var stored = localStorage.getItem(key);
      try{
        stored = angular.fromJson(stored);
      } catch(error){
        stored = null;
      }

      stored = stored || defaultValue;
      return stored;
    },
    update: function(key, value){
      value && localStorage.setItem(key,angular.toJson(value));
    },
    clear: function(key){
      localStorage.removeItem(key);
    }
  };
}])
.factory('dateService',[function(){
  return {
    handleMessageDate: function(messages){
      var i = 0,
      length = 0,
      messageDate = {},
      nowDate = {},
      weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
      diffWeekValue = 0;
      if(messages){
        nowDate = this.getNowDate();
        length = messages.length;
        for (i = 0; i < length; i++) {
          messageDate = this.getMessageDate(messages[i]);
          if(!messageDate){
            return null;
          }
          if (nowDate.year - messageDate.year > 0) {
            messages[i].lastMessage.time = messageDate.year + "";
            continue;
          }
          if (nowDate.month - messageDate.month >= 0 ||
            nowDate.day - messageDate.day > nowDate.week) 
          {
            messages[i].lastMessage.time = messageDate.month +
            "月" + messageDate.day + "日";
            continue;
          }
          if (nowDate.day - messageDate.day <= nowDate.week &&
            nowDate.day - messageDate.day > 1) 
          {
            diffWeekValue = nowDate.week - (nowDate.day - messageDate.day);
            messages[i].lastMessage.time = weekArray[diffWeekValue];
            continue;
          }
          if (nowDate.day - messageDate.day === 1) {
            messages[i].lastMessage.time = "昨天";
            continue;
          }
          if (nowDate.day - messageDate.day === 0) {
            messages[i].lastMessage.time = messageDate.hour + ":" + messageDate.minute;
            continue;
          }
        }
      } else{

      }
    },
    getNowDate: function(){
      var nowDate = {};
      var date = new Date();
      nowDate.year = date.getFullYear();
      nowDate.month = date.getMonth();
      nowDate.day = date.getDate();
      nowDate.week = date.getDay();
      nowDate.hour = date.getHours();
      nowDate.minute = date.getMinutes();
      nowDate.second = date.getSeconds();
      return nowDate;
    },
    getMessageDate: function(message){
      var messageDate = {};
      var messageTime = "";
      //2015-10-12 15:34:55    messageTime格式范例
      var reg = /(^\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
      var result = new Array();
      if(message){
        messageTime = message.lastMessage.originalTime;
        result = reg.exec(messageTime);
        if (!result) {
            console.log("result is null");
            return null;
        }
        messageDate.year = parseInt(result[1]);
        messageDate.month = parseInt(result[2]);
        messageDate.day = parseInt(result[3]);
        messageDate.hour = parseInt(result[4]);
        messageDate.minute = parseInt(result[5]);
        messageDate.second = parseInt(result[6]);
        return messageDate;
      } else{
        console.log("message is null");
        return null;
      }
    }
  };
}])
.factory('messageService',['localStorageService','dateService',
function(localStorageService,dateService){
  return {
    init: function(messages){
      var i=0;
      var length = 0;
      var messageID = [];
      var date = null;
      var messageDate = null;

      if (messages) {
        length = messages.length;
        for (; i < length; i++) {
          messageDate = dateService.getMessageDate(messages[i]);
          if(!messageDate){
            return null;
          }
          date = new Date(messageDate.year, messageDate.month,
            messageDate.day, messageDate.hour, messageDate.minute,
            messageDate.second);
          messages[i].lastMessage.timeFrome1970 = date.getTime();
          messageID[i] = {
            id: messages[i].id
          };
          localStorageService.update("message_" + messages[i].id, messages[i]);
        }
        localStorageService.update("messageID", messageID);
      } 
    },
    getAllMessages: function() {
      var messages = [];
      var i;
      var messageID = localStorageService.get("messageID");
      var message;
      if (messageID) {
        for (i = 0; i < messageID.length; i++) {
          message = localStorageService.get("message_" + messageID[i].id);
          if(message){
            messages.push(message);
          }
        }
        dateService.handleMessageDate(messages);
      }
      return messages;
    },
    getMessageById: function(id){
      return localStorageService.get("message_" + id);
    },
    getAmountMessageById: function(num, id){
      var messages = [];
      var message = localStorageService.get("message_" + id).message;
      var length = 0;
      if(num <= 0 || !message) return;
      length = message.length;
      if(num < length){
        messages = message.splice(length - num, length); 
        return messages;  
      }else{
        return message;
      }
    },
    updateMessage: function(message) {
      if (message) {
        localStorageService.update("message_" + message.id, message);
      }
    },
    deleteMessageId: function(id){
      var messageId = localStorageService.get("messageID");
      var i = 0;
      if(!messageId){
        return null;
      }
      for(; i < messageId.length; i++){
        if(messageId[i].id === id){
          messageId.splice(i, 1);
          break;
        }
      }
      localStorageService.update("messageID", messageId);
    },
    clearMessage: function(message) {
      var id;
      if (message) {
        id = message.id;
        localStorageService.clear("message_" + id);
      }
    }
  }
}])
.factory('contactService',['localStorageService','_',function(localStorageService, _){
  return {
    needInit: function(){
      return !localStorageService.get('login.username');
    },
    init: function(contacts){
      var sorted = [];
      var i = 65; //Ascii code for letter A
      var currentLetter;

      if(localStorageService.get('login.username')) return;
      sortedUserNames = _.sortBy(_.map(contacts,'login.username'), function(o){return _.toUpper(o)});
      localStorageService.update("userNames", sortedUserNames);
      for(; i<65+26; i++){
        currentLetter = String.fromCharCode(i);
        localStorageService.update("user$"+currentLetter, 
                                  _.filter(contacts,
                                          function(o){return _.toUpper(o.login.username[0])==currentLetter}));
      }
    },
    getUserNames: function(){
      return localStorageService.get("userNames");
    },
    getContactsByFirstLetter: function(letter){
      return localStorageService.get('user$' + letter);
    },
    getValidContactsFirstLetterList: function(){
      var letterList = [], 
          i = 65;
      for(; i<65+26; i++){
        if(this.getContactsByFirstLetter(String.fromCharCode(i)).length>0){
          letterList.push(String.fromCharCode(i));
        }
      }
      //console.log(letterList);
      return letterList;
    },
  }
}])