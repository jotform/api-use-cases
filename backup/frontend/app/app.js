/*
	General Jot Module to define app
*/
var jotModule = angular.module('jot', []);

jotModule.config(function($routeProvider){
	$routeProvider.when('/index',{
		templateUrl : '/app/views/index.tpl.html',
		controller : 'IndexController'
	});

	$routeProvider.when('/about',{
		templateUrl : '/app/views/about.tpl.html',
		controller : 'AboutController'
	});

	$routeProvider.when('/contact',{
		templateUrl : '/app/views/contact.tpl.html',
		controller : 'ContactController'
	});

	$routeProvider.when('/backup',{
		templateUrl : '/app/views/backup.tpl.html',
		controller : 'BackupController'
	});

	$routeProvider.otherwise({
		redirectTo : '/index'
	});


});