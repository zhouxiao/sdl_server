'use strict';

/**
 */
angular.module('SDL.Demos', []).controller('DemosCtrl', ['$scope', '$state', 'Restangular', 'DataTableService', 'ErrorService', 'SubNavService', function($scope, $state, Restangular, DataTable, Error, SubNav) {
	var tableName = "devTable",
			restangularUrl = "demos";

	

   // Create the data table and populate it with data.
  DataTable.createAndPopulate(tableName, restangularUrl);
	
	/*
	$scope.units = [
		{name: "192.168.1.100", description: "Android OS", allowable: true, online:true},
		{name: "192.168.1.105", description: "Apple OS", allowable:false, online:true}
	];
	*/
		
	// Create and show the sub navigation.
	SubNav.show(SubNav.create(
		SubNav.createBtn("Add", false, function() { $state.transitionTo("functionalGroupCreate"); }),
		SubNav.createBtn("Search", false, function() { DataTable.clearFilters(tableName); $scope.show_filter = ! $scope.show_filter;}),
		// Create Delete button to toggle the display of a DataTable's delete functionality.
		SubNav.createBtn("Delete", false, function() { DataTable.enableSelected(tableName, undefined, true); })
	));
	
	// Expose the Select Item method for the data table.
	$scope.selectItem = function(value) {
		DataTable.selectItem(tableName, value);
	};

	// Expose the Select All Items method for the data table.
	$scope.selectAllItems = function(value) {
		DataTable.selectAllItems(tableName, value);
	};

	// Expose the DataTable delete all selected items method for the table view.
	$scope.deleteSelected = function() {
		DataTable.deleteAllSelectedItems(tableName);
		SubNav.toggleRightBtn();
	}	
	
	Date.prototype.today = function () {
		return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
	};

	Date.prototype.timeNow = function () {
		return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
	};

	$scope.copy = function(item) {
		//var name = item.name + " (Copied on" + new Date().today() + " " + new Date().timeNow() + ")";
		var name = item.name + " (Copy)";
		
	}
	
	$scope.updateDeviceStatus = function(devId, allowable){
		Restangular.one(restangularUrl, devId).get().then(function(data){
			
			data.allowable = allowable;
			data.post();
		});
		
	}

}]);
