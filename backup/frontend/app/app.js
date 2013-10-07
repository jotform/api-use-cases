/*
	global in memory storage object, worse than angularjs value service
	better than using window object itself and pollute namespace altogether
*/
var gs = {};

/*
General Jot Module to define app
*/
var jotModule = angular.module('jot', []);

jotModule.config(['$routeProvider',function($routeProvider){
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

	$routeProvider.when('/backups',{
		templateUrl : '/app/views/backups.tpl.html',
		controller  : 'BackupListController'
	});

	$routeProvider.when('/backup',{
		templateUrl : '/app/views/backup.tpl.html',
		controller : 'BackupController'
	});

	$routeProvider.when('/backup/status/:jobHash',{
		templateUrl : '/app/views/backupStatus.tpl.html',
		controller : 'BackupStatusController'
	});

	$routeProvider.otherwise({
		redirectTo : '/index'
	});
}]);
