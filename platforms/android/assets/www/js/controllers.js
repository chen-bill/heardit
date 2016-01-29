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

.controller('MainCtrl', ['$scope','$rootScope', 'settingsFactory' ,'$ionicPopup', '$ionicPlatform' , '$timeout', '$http', 'subredditsFactory', 
  function($scope, $rootScope, settingsFactory, $ionicPopup, $ionicPlatform, $timeout, $http, subredditsFactory){

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
        stopPlayback();
      } else {
        initiatePlayback();
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

    function initiatePlayback(){
      playMedia();
    }

    function playMedia (){
      settingsFactory.getData(null, function(res){
        settings = res.settings;
        var voiceParams = { rate: Number(settings.rate), pitch: Number(settings.pitch)};
        alert(JSON.stringify(voiceParams));
        // voiceParams = {
        //   rate: 1,
        //   pitch: 1
        // }
        responsiveVoice.speak("hello world, my name is bill chen and I'm the best", settings.voice, voiceParams);
      });
    };

    function stopPlayback(){
        responsiveVoice.cancel();
    }

    function getFeed(){
      var url = 'https://www.reddit.com/r/' + subreddit + '/about.json';
      $http({
        method: 'GET',
        url: url
      }).then(function successCallback(response) {
        callback(true);
      }, function errorCallback(response) {
        callback(false);
      });
    };



}])
