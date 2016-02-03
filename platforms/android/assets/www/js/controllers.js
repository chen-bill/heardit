angular.module('starter.controllers', [])

.controller('AppCtrl', ['$scope', 'settingsFactory', '$ionicLoading', '$ionicPlatform', '$cordovaFile',
  function($scope, settingsFactory, $ionicLoading, $ionicPlatform, $cordovaFile) {

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
        alertPop('Message','Restart the app to save changes');
        $scope.settings = res.settings;
      });
    }
}])

.controller('MainCtrl', ['$scope','$rootScope', 'settingsFactory' ,'$ionicPopup', '$ionicPlatform' , '$timeout', '$http', '$ionicLoading', 
  function($scope, $rootScope, settingsFactory, $ionicPopup, $ionicPlatform, $timeout, $http, $ionicLoading){

    var settings = {};
    $scope.subreddits = [];
    $scope.subredditsChecked = [];
    $scope.isPlaying = false;
    $scope.isPaused = false;
    $scope.level = 'thread';

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
        //resets everything
        responsiveVoice.cancel();
        $scope.isPlaying = false;
        $scope.isPaused = false;
        $scope.level = 'thread';
        thread = [];
        threadId = '';
        currentSubreddit = '';
        comments = [];
        commentsIndex = 0;
        commentIndex = 0;
        commentCounter = 0;
        redditAfter = '';
        redditBefore = '';
      } else {
        if(verifyOneSelected()){
          $ionicLoading.show({
            template: "fetching from reddit..."
          })
          initiatePlayback('thread', null);
          $scope.isPlaying = !$scope.isPlaying;
        } else {
          alertPop('Error', 'At least one subreddit must be selected');
        }
      }
    }

    $scope.togglePause = function(){
      if(responsiveVoice.isPlaying()){
        $scope.isPaused = true;
        responsiveVoice.pause();
      } else {
        $scope.isPaused = false;
        responsiveVoice.resume();
      }
    }

    $scope.toggleLevel = function(){
      responsiveVoice.cancel();
      if($scope.level == 'comments'){
        $scope.level = 'thread';
        initiatePlayback($scope.level, 'after');    
      } else {
        $scope.level = 'comments';
        commentsIndex = 0;
        commentIndex = 0;
        voiceAnnotate('goToComments', function(){
          $ionicLoading.show({
            template: "fetching from reddit..."
          })
          initiatePlayback('comments', null);  
        })
      }
    }

    $scope.backward = function(){
      responsiveVoice.cancel();
      if($scope.level == 'comments'){
        if(commentsIndex == 0){
          alertPop('Message','First comment, cannot go back');
          commentIndex = 0;
          playMedia($scope.level);
        } else {
          voiceAnnotate('previousComment', function(){
            commentsIndex -= 2;
            commentIndex = 0;
            playMedia($scope.level);
          })
        }
      } else {
        voiceAnnotate('previousThread', function(){
          initiatePlayback($scope.level, 'before');  
        })
      }
    }

    $scope.forward = function(){
      responsiveVoice.cancel();
      if($scope.level == 'comments'){
        voiceAnnotate('nextComment', function(){
          commentsIndex++;
          commentIndex = 0;
          playMedia($scope.level);
        })
      } else {
        voiceAnnotate('nextThread', function(){
          initiatePlayback($scope.level, 'after');  
        })
      }
    }

    // Helper functions
    $scope.saveSubreddits = function(){
      settingsFactory.setData('subreddits', $scope.subreddits);
      settingsFactory.setData('subredditsChecked', $scope.subredditsChecked);
    }

    function verifyOneSelected(){
      for(var x = 0; x < $scope.subredditsChecked.length; x++){
        if($scope.subredditsChecked[x]){
          return true;
        }
      }
      return false;
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
    var threadId = '';
    var currentSubreddit = '';

    var comments = [];
    var commentsIndex = 0;
    var commentIndex = 0;
    var commentCounter = 0;
    var redditAfter = '';
    var redditBefore = '';
    var voiceParams = {};

    function initiatePlayback(type, pageControl){
      $scope.isPlaying = true;
      settingsFactory.getData(null, function(res){
        settings = res.settings;
        if(type == 'comments'){
          getComments(function(){
            if(comments.length == 0){
              voiceAnnotate('noMoreComments', function(){
                voiceAnnotate('nextThread', function(){
                  $scope.toggleLevel();
                })
              })
            } else {
              playMedia($scope.level);
            }
          })
        } else {
          getThread(pageControl, function(){
            playMedia($scope.level);
          });
        }
      });
    }

    //getting thread data
    function getThread(pageControl, callback){
      $http({
        method: 'GET',
        url: constructThreadUrl(pageControl)
      }).then(function successCallback(jsonData) {
        // alert(JSON.stringify(jsonData));
        var unformattedString = jsonData.data.data.children[0].data.title;
        if(settings.selfText == 'on' && jsonData.data.data.children[0].data.selftext.length > 0){
          unformattedString = unformattedString + '. ' + jsonData.data.data.children[0].data.selftext;
        }
        redditBefore = jsonData.data.data.before;
        redditAfter = jsonData.data.data.after;
        currentSubreddit = jsonData.data.data.children[0].data.subreddit;
        threadId = jsonData.data.data.children[0].data.id;

        formatString(unformattedString, function(){
          $ionicLoading.hide()
          callback();
        })
      }, function errorCallback(response) {
        $ionicLoading.hide()
        alert('failed' + response);
      });
    }

    function getComments(callback){
      comments = [];
      $http({
        method: 'GET',
        url: constructCommentUrl()
      }).then(function successCallback(jsonData) {
        for(index in jsonData.data[1].data.children){
          if(jsonData.data[1].data.children[index].data.body){
            comments.push(formatString(jsonData.data[1].data.children[index].data.body));
          }
        }
        $ionicLoading.hide()
        callback();
      }, function errorCallback(response) {
        $ionicLoading.hide()
        alert('failed' + response);
      });
    }

    function constructThreadUrl(pageControl){
      var url = 'https://www.reddit.com/r/';

      for(var x = 0; x < $scope.subreddits.length ; x++){
        if($scope.subredditsChecked[x]){
          url += $scope.subreddits[x] + '+';
        }
      }

      url = url.substring(0, url.length-1);

      if(settings.sort != 'default'){
        url = url + '/' + settings.sort;
      }

      url = url + '.json?limit=1&restrict_sr=on&raw_json=1';

      if(pageControl === 'before'){
        url = url + '&before=' + redditBefore;
      }
      if(pageControl === 'after'){
        url = url + '&after=' + redditAfter;
      }

      if(settings.sort == 'top'){
        url = url + '&t=' + settings.time;
      }
      return url;
    }

    function constructCommentUrl(){
      var url = 'https://www.reddit.com/r/' + currentSubreddit + '/comments/' + threadId + '.json?' + 'sort=' + settings.commentsSort;
      return url;
    }

    //format each thread to be more readable
    //input string
    //output array into the first element of the array
    function formatString(unformattedString,callback){
        //replacing certain characters with their respective terms
        var temp1 = unformattedString.replace(/\&/g,' and ');
        var temp2 = temp1.replace(/\//g,' slash ');
        var temp3 = temp2.replace(/\%/g,' percent ');
        var temp4 = temp3.replace(/\+/g,' plus ');
        var temp5 = temp4.replace(/\$/g,' dollar sign ');

        //white list for accepted characters
        var formattedString = temp5.replace(/[^a-z A-Z 0-9 ?!.,'"]/g,'');

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

        toRemove = ['..','.'];
        newStringArray = newStringArray.filter(function(x) { 
          return toRemove.indexOf(x) < 0 
        });
        if($scope.level == 'thread'){
          thread = newStringArray;
        } else {
          return (newStringArray);
        }
        callback();
    }

    function voiceAnnotate(command, callback){
      if(settings.annotations=='on'){
        voiceParams = {
          rate: settings.rate,
          pitch: settings.pitch,
          onstart: annotateStart,
          onend: annotateEnd
        };

        function annotateStart(){}

        function annotateEnd(){
          callback();
        }

        if(command == 'nextThread'){
          responsiveVoice.speak('Next thread', settings.voice, voiceParams);
        } else if(command == 'previousThread'){
          responsiveVoice.speak('Previous thread', settings.voice, voiceParams);
        } else if(command == 'nextComment'){
          responsiveVoice.speak('Next comment', settings.voice, voiceParams);
        } else if(command == 'previousComment'){
          responsiveVoice.speak('Previous comment', settings.voice, voiceParams);
        } else if(command == 'noMoreComments'){
          responsiveVoice.speak('No more comments', settings.voice, voiceParams);
        } else if(command == 'maxComments'){
          responsiveVoice.speak('Comment limit reached', settings.voice, voiceParams);
        } else if(command == 'goToComments'){
          responsiveVoice.speak('Going to comments', settings.voice, voiceParams);
        } else {
          callback();
        }
      } else {
        callback();
      }
    }

    //type can be comments or thread
    function playMedia(type){
      $scope.isPlaying = true;
      if(type === 'comments'){
          voiceParams = {
            rate: settings.rate,
            pitch: settings.pitch,
            onstart: commentsStart,
            onend: commentsEnd
          };
          responsiveVoice.speak(comments[commentsIndex][commentIndex], settings.voice, voiceParams);
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

    function commentsStart (){
    }

    function commentsEnd (){
      commentIndex++;
      if(commentCounter >= settings.maxComments && settings.alwaysComments=='on'){
        commentCounter = 0;
        voiceAnnotate('maxComments', function(){
          voiceAnnotate('nextThread', function(){
            $scope.toggleLevel();
          });
        });
      } else {
        if(comments[commentsIndex].length == commentIndex && comments.length != commentsIndex+1){
          commentsIndex++;
          commentIndex = 0;
          voiceAnnotate('nextComment', function(){
            commentCounter++;
            playMedia($scope.level);
          });
        } else if (comments.length == commentsIndex+1){
          alert('elseif');
          voiceAnnotate('noMoreComments', function(){
            voiceAnnotate('nextThread', function(){
              $scope.toggleLevel();  
            })
          })
        } else {
          playMedia($scope.level);
        }
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
          if(settings.alwaysComments=='on'){
            $scope.toggleLevel();
          } else {
              voiceAnnotate('nextThread', function(){
              initiatePlayback('thread', 'after');  
            });
          }
        }
      }
    }

    //comments https://www.reddit.com/r/showerthoughts/comments/42fx0k.json

}]);
