angular.module('starter.controllers', [])

.controller('AppCtrl', ['$scope', 'settingsFactory', '$ionicLoading', '$ionicPlatform', '$cordovaFile',
  function($scope, settingsFactory, $ionicLoading, $ionicPlatform, $cordovaFile ) {

    $scope.settings = {};
    $scope.shouldShowDelete = false;
    $scope.voiceList = responsiveVoice.getVoices();   //getting voice list from api

    $ionicPlatform.ready(function(){
        settingsFactory.init(function(res){
          settingsFactory.getData('settings', function(data){
            $scope.settings = data;
          });
        });
    });

    
    $scope.toggleShowList = function(){
		  $scope.shouldShowDelete = !$scope.shouldShowDelete;
    }

    $scope.saveSettings = function(){
      settingsFactory.setData('settings', $scope.settings);
    }

    $scope.debug = function(){
      alert(JSON.stringify($scope.settings));
    }

    $scope.restoreDefault = function(){
      settingsFactory.resetData(function(res){
        $scope.settings = data;
      });
    }
}])

.controller('MainCtrl', ['$scope','$rootScope', 'settingsFactory' ,'$ionicPopup', '$ionicPlatform' , '$timeout', '$http', '$ionicLoading', 
  function($scope, $rootScope, settingsFactory, $ionicPopup, $ionicPlatform, $timeout, $http, $ionicLoading){

    var settings = {};
    $scope.subreddits = [];
    $scope.subredditsChecked = [];
    $scope.isPlaying = false;

    $ionicPlatform.ready(function(){
        settingsFactory.init(function(res){
          settingsFactory.getData(null, function(res){
            settings = res.settings;
            $scope.subreddits = res.subreddits;
            $scope.subredditsChecked = res.subredditsChecked;
          });
        });
    });

    $scope.addSubreddit = function(value){
      verifySubreddit(value, function(exists){
        if (exists && $scope.subreddits.indexOf(value.toLowerCase()) == -1) {
          $scope.subreddits.push(value.toLowerCase());
          $scope.subredditsChecked.push(true);
          $scope.saveSubreddits();
        } else if ($scope.subreddits.indexOf(value.toLowerCase()) != -1){
          alertPop('Error', 'Subreddit already in list');
        } else {
          alertPop('Error', 'Subreddit does not exist');
        }
      })
    }

    $scope.removeSubreddit = function(index){
      $scope.subreddits.splice(index, 1);
      $scope.subredditsChecked.splice(index, 1);
      $scope.saveSubreddits();
    }

    $scope.toggleMedia = function(){
      if($scope.isPlaying){
        responsiveVoice.cancel();
      } else {
        $ionicLoading.show({
          template: "fetching from reddit..."
        })
        initiatePlayback('thread', null);
      }
      $scope.isPlaying = !$scope.isPlaying;
    }

    // Helper functions
    $scope.saveSubreddits = function(){
      settingsFactory.setData('subreddits', $scope.subreddits);
      settingsFactory.setData('subredditsChecked', $scope.subredditsChecked);
    }

    function verifySubreddit(subreddit, callback){
      var url = 'https://www.reddit.com/r/' + subreddit + '/about.json';
      $http({
        method: 'GET',
        url: url
      }).then(function successCallback(response) {
        callback(true);
      }, function errorCallback(response) {
        callback(false);
      });
    }


    function alertPop(title, description){
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: description
      });
    }


    // ---------------------------- Playing Sounds and stuff -----------------------------

    var thread = [];
    var redditAfter = '';
    var redditBefore = '';
    var voiceParams = {};

    function initiatePlayback(type, pageControl){
      settingsFactory.getData(null, function(res){
        settings = res.settings;
        if(type == 'comment'){
          //comments later
        } else {
          getThread(pageControl, function(){
            playMedia(type);
          });
        }
      });
    }

    //getting thread data
    function getThread(pageControl, callback){
      $http({
        method: 'GET',
        url: constructUrl(pageControl)
      }).then(function successCallback(jsonData) {
        var unformattedString = jsonData.data.data.children[0].data.title;
        if(settings.selfText == 'on'){
          unformattedString = unformattedString + ' ' + jsonData.data.data.children[0].data.selftext;
        }
        redditBefore = jsonData.data.data.before;
        redditAfter = jsonData.data.data.after;
        formatString(unformattedString, function(){
          loadingTimeout = setTimeout($ionicLoading.hide(), 2000);
          callback();
        })
      }, function errorCallback(response) {
        alert('failed' + response);
      });
    }

    function constructUrl(pageControl){
      var url = 'https://www.reddit.com/r/'

      for(var x = 0; x < $scope.subreddits.length ; x++){
        if($scope.subredditsChecked[x]){
          url += $scope.subreddits[x] + '+';
        }
      }

      url = url.substring(0, url.length-1);

      url = url + '/search.json?restrict_sr=on&raw_json=1' +
            '&t=' + settings.time + 
                '&sort=' + settings.sort + 
                '&limit=1';

        if(pageControl === 'before'){
          url = url + '&before=' + redditBefore;
        }
        if(pageControl === 'after'){
          url = url + '&after=' + redditAfter;
        }
        return url;
    }

    //format each thread to be more readable
    //input string
    //output array into the first element of the array
    function formatString(unformattedString,callback){

        //replacing certain characters with their respective terms
        var temp1 = unformattedString.replace(/&/g,'and');
        var temp2 = temp1.replace(/\//g,' slash ');

        //white list for accepted characters
        var formattedString = temp2.replace(/[^a-z A-Z 0-9 ?!.,'"]+/g,'');

        //the word is broken down to an array of sentences
        var newStringArray = [];

        //loops through and does some magic
        for(var character = 0; character < formattedString.length; character++){
          if(formattedString[character] == '.' || formattedString[character] == '?'){
            newStringArray.push(formattedString.substring(0,character+1));
            formattedString = formattedString.slice(character + 1, formattedString.length);
            character = 0;
          } else if (character == formattedString.length - 1){
            newStringArray.push(formattedString.substring(0));
          }
        }

        thread = newStringArray;
        callback();
    }

    //type can be comments or thread
    function playMedia(type){
      if(type === 'comments'){
        voiceParams = {
          rate: settings.rate,
          pitch: settings.pitch,
          onstart: commentsStart,
          onend: commentsEnd
        };
        // responsiveVoice.speak(, "UK English Male", params);
      } else {
        voiceParams = {
          rate: settings.rate,
          pitch: settings.pitch,
          onstart: threadStart,
          onend: threadEnd
        };
        responsiveVoice.speak(thread[0], settings.voice, voiceParams);
      }
    }

    function threadStart (){
      thread.shift();
    }

    function threadEnd (){ 
      if($scope.isPlaying){
        if(thread.length > 0){
          playMedia('thread');
        } else {
          threadTimeout = setTimeout(initiatePlayback('thread', 'after'), settings.secBetween * 1000);
        }
      }
    }

    //comments https://www.reddit.com/r/showerthoughts/comments/42fx0k.json

}]);
