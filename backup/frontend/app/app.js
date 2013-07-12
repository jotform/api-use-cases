/*
	General Jot Module to define app
*/
var jotModule = angular.module('jot', []);

jotModule.config(function($routeProvider){
	$routeProvider.when('/index',{
		templateUrl : '/app/views/index.tpl.html',
		controller : 'IndexController'
	});

	$routeProvider.otherwise({
		redirectTo : '/index'
	});
});