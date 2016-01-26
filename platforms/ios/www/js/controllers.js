angular.module('starter.controllers', [])

.controller('AppCtrl', ['$scope', 'settingsFactory', '$ionicLoading', '$ionicPlatform',
  function($scope, settingsFactory, $ionicLoading, $ionicPlatform ) {

    //files
    $scope.download = function(){
      $ionicLoading.show({
        template: "Loading..."
      });
    }

    // $ionicPlatform.ready(function(){
    //   console.log('device is ready');
    //   window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem){
    //     fileSystem.root.getDirectory(
    //       "ExampleProject",
    //       {
    //         create: true,   //if directory doesnt exist, create it
    //       }, function(dirEntry){
    //         console.log('functionDirEntry');
    //         dirEntry.getFile(
    //           "Test.png",
    //           {
    //             create: true,
    //             exclusive: false
    //           },
    //           function gotFileEntry(fileEntry){
    //             console.log('gotFileEntry');
    //             var p = fileEntry.toURL();
    //             fe.remove();
    //             ft = new FileTransfer();
    //             ft.download(
    //               encodeURI("http://ionicframework.com/img/ionic-logo-blog.png"),
    //               p,
    //               function(entry){
    //                 $ionicLoading.hide();
    //                 $scope.imgFile = entry.toURL();
    //               },
    //               function(error){
    //                 $ionicLoading.hide();
    //                 alert("failed to download");
    //               },
    //               false,
    //               null
    //             );
    //           },
    //           function(){
    //             $ionicLoading.hide();
    //             alert('Failed to load file');
    //           }
    //         );
    //       }
    //     );
    //   }, function(err){
    //     console.log("Error: " + err);
    //   });
    // }, false);

  	$scope.shouldShowDelete = false;

    $scope.settings = settingsFactory.getSettings();
    $scope.voiceList = responsiveVoice.getVoices();

    $scope.toggleShowList = function(){
		  $scope.shouldShowDelete = !$scope.shouldShowDelete;
    }

    $scope.debug = function(){
      console.log('debug');
      $scope.download();
    }

    $scope.$watch(function(){
      settingsFactory.refreshSettings($scope.settings);
    });

}])

.controller('MainCtrl', ['$scope','$rootScope', 'settingsFactory' ,'$ionicPopup' , '$timeout', '$http', 
  function($scope, $rootScope, settingsFactory, $ionicPopup, $timeout, $http){

    var playCount = 0;
    var playQueue = []; //strings of all subreddits
    

    $scope.isPlaying = false;
    $scope.subreddits = ['showerthoughts','ama','top','til'];

    $scope.subredditsChecked = [true, true, true, true];

    $scope.addSubreddit = function(value){
      verifySubreddit(value, function(exists){
        if (exists && $scope.subreddits.indexOf(value) == -1) {
          $scope.subreddits.push(value.toLowerCase());
          $scope.subredditsChecked.push(true);
        } else if ($scope.subreddits.indexOf(value) != -1){
          alertPop('Error', 'Subreddit already in list');
        } else {
          alertPop('Error', 'Subreddit does not exist');
        }
      })
    }

    $scope.toggleMedia = function(){
      if($scope.isPlaying){

      } else {
      }
      $scope.isPlaying = !$scope.isPlaying;
    }

    // Helper functions
    function getFeed(){
      var settings = settingsFactory.getSettings();


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

    function playMedia (feedArray){
      responsiveVoice.speak(feedArray[0], settingsFactory.selectedVoice, {onstart: StartCallback, onend: EndCallback});
      feedArray.shift();
    }

    function StartCallback (){
      console.log("media starting");
    }

    function EndCallback (){
      playMedia (feedArray);
      console.log("media ended");
    }

    function stopMedia (){
      responsiveVoice.cancel();
    }

    function pauseMedia(){
      responsiveVoice.pause();
    }

    function resumeMedia(){
      responsiveVoice.resume();
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

    $scope.debug = function(){
      console.log($scope.subreddits);
      console.log($scope.subredditsChecked);
    }
}])
