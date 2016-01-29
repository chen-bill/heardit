angular.module('starter.services', [])
.factory('settingsFactory', [ '$ionicPlatform', '$cordovaFile', 
	function($ionicPlatform, $cordovaFile) {

	var defaultData = {
		subreddits: ['showerthoughts', 'ama', 'til', 'dinosaurs'],
		subredditsChecked: [true, true, true],
		settings: {
			cycle: '5',
			minUpvotes: '1000',
			secBetween: '10',
			time: 'week',
			sort: 'hot',
			voice: 'UK English Female',
			pitch: '1',
			rate: '1'
		}
	};   

	var data = {
		subreddits: [],
		subredditsChecked: [],
		settings: {}
	};       

    function writeData(){
    	$cordovaFile.writeFile(cordova.file.dataDirectory, "data.txt", JSON.stringify(data), true)
	        .then(function (success) {
	        	// alert("successfully wrote in file" +  JSON.stringify(success));
      		}, function (error) {
      			// alert('Error writing to file: ' + JSON.stringify(error));
      		});
    };

    function readDataFromFile(callback){
    	$cordovaFile.readAsText(cordova.file.dataDirectory, "data.txt")
	      	.then(function (success) {	//when file is found
	      		alert('read Data: ' + success);
	      		data = angular.fromJson(success);
	      		callback(success);
	      	}, function (error) {	//when no file is found
	      		alert('Error loading data. Creating a new file');
	      		$cordovaFile.writeFile(cordova.file.dataDirectory, "data.txt", JSON.stringify(defaultData), true)
		        	.then(function (success) {
		        		alert('success writing new file');
		        		callback(success);
	      			}, function (error) {
	      				alert('error writing to file');
	      			});
		    });
    };

    settingsFunctionObject = {};

    settingsFunctionObject.resetData = function(callback) {
    	$cordovaFile.writeFile(cordova.file.dataDirectory, "data.txt", JSON.stringify(defaultData), true)
	        .then(function (success) {
	        	alert('Set data back to default');
	        	callback(true);
      		}, function (error) {
      			alert('Error setting back data to default');
      		});
    };

    settingsFunctionObject.init = function(callback){
    	readDataFromFile(callback);
	};

    settingsFunctionObject.getData = function(key, callback){
		if (key =='settings'){
			callback(data.settings);
		} else if (key == 'subreddits'){
			callback(data.subreddits);
		} else if (key == 'subredditsChecked'){
			callback(data.subredditsChecked);
		} else {
			callback(data);
		}
    };

    settingsFunctionObject.setData = function(key, value){
    	if (key ==='settings'){
    		data.settings = value;
		} else if (key === 'subreddits'){
			data.subreddits = value;
		} else if (key === 'subredditsChecked'){
			data.subredditsChecked  = value;
		} else {
			data = value;
		}
		writeData();
    };

    settingsFunctionObject.setDataDebug = function(data){
    	alert(JSON.stringify(data));
    };

	return settingsFunctionObject;
}])



// ---------------------------------Making subreddits less shitty to read ---------------------



.factory('subredditsFactory', ['settingsFactory', function(settingsFactory){

	var settings = {};
	var unformattedPostsArray = [];
	var formattedPostArray = [];

	//get settings
	function getSettings(callback){
		settingsFactory.getData(null, function(data){
			callback(data);
		})
	};

	function getRedditPosts(userSettings){
		//gets # number of posts from users that match the filter criterias
		//appends all posts into an array
	}

	function formatPost(){
		for(post in unformattedPostsArray){
			// for(var i = 0; i < unformattedPostsArray[post].length; i++){
				//remove "
				//split every period
				//remove forbidden characters
				// if unformattedPostsArray[post].charAt(i);
		};
	};
	//get json
	//format each title string into an array of arrays
    //start querying 1 by 1
    //remove subreddits from array when finished playing


    function StartCallback (){
      console.log("media starting");
    };

    function EndCallback (){
      playMedia (feedArray);
      console.log("media ended");
    };

    function stopMedia (){
    };

    function pauseMedia(){
    };

    function resumeMedia(){
    };

	subredditPlaybackObject = {};

	subredditPlaybackObject.play = function(){
		alert('servie play');
		getSettings(function(data){
			settings = data.settings;
			playMedia();
		});
	}

	return subredditPlaybackObject;
}])
