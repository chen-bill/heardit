angular.module('starter.controllers', [])

.controller('AppCtrl', ['$scope', 'settingsFactory', function($scope, settingsFactory) {
  console.log("settings Controller");

}])

.controller('SettingsCtrl', ['$scope', 'settingsFactory', function($scope, settingsFactory){
  console.log("settings Controller");

}])

.controller('MyCtrl', ['$scope', 'settingsFactory', function($scope, settingsFactory){
  console.log("settings Controller");
  $scope.items = {
    item1:{
      title: "Bill",
      description: "Cool"
    }
  }
}]);