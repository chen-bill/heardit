angular.module('starter.services', [])
.factory('settingsFactory', [ '$ionicPlatform', '$cordovaFile', 
	function($ionicPlatform, $cordovaFile) {

	var defaultData = {
		subreddits: ['showerthoughts', 'iama', 'todayilearned', 'jokes', 'news', 'lifeprotips'],
		subredditsChecked: [true, true, true, true, true, true],
		settings: {
			selfText: 'on',
			minUpvotes: '1000',
			secBetween: '10',
			alwaysComments: 'on',
			maxComments: '5',
			time: 'all',
			sort: 'default',
			commentsSort: 'confidence',
			voice: 'UK English Female',
			annotations: 'on',
			pitch: '0.8',
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
	        	callback(data);
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
}]);