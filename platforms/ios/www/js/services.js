angular.module('starter.services', [])

.factory('settingsFactory', function() {

	function getFileSystem(){
		alert(fileSystem.name);
		alert(fileSystem.root.name)
	}

	function generalFail(err){
		alert("Failed in file system: " + err);
	}


	var settings = {
      time: 'week',
      sort: 'hot',
      voice: 'UK English Female'
    }

    settingsFunctionObject = {};

    settingsFunctionObject.getSettings = function(){
    	return settings;
    }

	settingsFunctionObject.getSetting = function(key, callback){
		callback(settings);
	}

	settingsFunctionObject.setSetting = function(key, value){
		settings[key] = value;
	}

	settingsFunctionObject.refreshSettings = function(object){
		var allKeys = Object.keys(object)
		for(key in allKeys){
			settings[allKeys[key]] = object[allKeys[key]];
		}
	}
	return settingsFunctionObject;
})
