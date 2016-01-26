angular.module('starter.services', [])

.factory('settingsFactory', [ '$ionicPlatform', '$cordovaFile', 
	function($ionicPlatform, $cordovaFile) {

	var data = {
		subreddits: [],
		subredditsChecked: []
		// settings: {
		// 	time: 'month',
  //     		sort: 'new',
  //     		voice: 'UK English Female'
		// }
	}       

    function writeData(){
    	$cordovaFile.writeFile(cordova.file.dataDirectory, "data.txt", JSON.stringify(data))
	        .then(function (success) {
	        	alert("successfully wrote in file" +  JSON.stringify(success));
      		}, function (error) {
      			alert('Error writing to file: ' + JSON.stringify(error));
      		});
    }

    function readData(){
    	console.log(data);
    }

    $ionicPlatform.ready(function(){
        $cordovaFile.readAsText(cordova.file.dataDirectory, "data.txt")
      		.then(function (success) {	//when file is found
      			data = angular.fromJson(success);
      		}, function (error) {	//when no file is found
      			alert('Error loading data. Creating a new file');
      			$cordovaFile.writeFile(cordova.file.dataDirectory, "data.txt", JSON.stringify(data), true)
	        		.then(function (success) {
	        			// whatever, i dont need this
      				}, function (error) {
      					// alert('Error creating and writing to file: ' + JSON.stringify(error));
      				});
	       	});
    });

    settingsFunctionObject = {};

    settingsFunctionObject.getData = function(){
    	return data;
    }

    settingsFunctionObject.setData = function(newData){
    	data = newData;
    }

    settingsFunctionObject.getSettings = function(){
    	return data.settings;
    }

	settingsFunctionObject.setSetting = function(key, value){
		data.settings[key] = value;
	}

	settingsFunctionObject.getSubreddits = function(){
    	return data.subreddits;
    }

	settingsFunctionObject.setSubreddits = function(array){
		data.subreddits = array;
	}

	settingsFunctionObject.getSubredditsChecked = function(){
    	return data.subredditsChecked;
    }

	settingsFunctionObject.setSubredditsChecked = function(array){
		data.subredditsChecked = array;
	}

	settingsFunctionObject.refreshSettings = function(object){
		var allKeys = Object.keys(object)
		for(key in allKeys){
			data.settings[allKeys[key]] = object[allKeys[key]];
		}
	}

	settingsFunctionObject.readData = function(){
		readData();
	}

	return settingsFunctionObject;
}])
