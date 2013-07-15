
jotModule.controller('NavigationController',function($scope){
	$scope.activeStates = {
		"index" : "active",
		"about" : "",
		"contact" : ""
	}

	$scope.changeState = function(target){
		for(var i in $scope.activeStates){
			$scope.activeStates[i] = ""
		}
		$scope.activeStates[target] = "active"
	}
});

jotModule.controller('IndexController',function($scope,$location,valStorage,$timeout){
	$scope.title = "Index Controller Title";
	
	$scope.forms = [];

	$scope.jot_logged_in = valStorage.get("jot_logged_in");

	$scope.jotform_connect = function(){
		JF.login(
				function(){
					$timeout(function(){
						$scope.jot_logged_in=valStorage.set("jot_logged_in",true);
					},1);
				},
				function(){
					window.alert("Could not authorize user");
				}
			); 
	}

	$scope.go = function ( ) {
		$location.path('/backup');
	};


});

jotModule.controller('AboutController',function($scope){
	$scope.title = "About Us";
});

jotModule.controller('ContactController',function($scope){
	$scope.title = "Index Controller Title";
});

/*
	Directly render list of forms and start migration progres, which means sending entire list of forms to backend

	and after receiving ACK message 
*/
jotModule.controller('BackupController',function($scope,jotservice,$timeout){
	$scope.forms = [];
	var service = jotservice;
	var promis = service.getForms();
	promis.then(function(response){
		$scope.forms = response;
	});

	$scope.startBackup = function(){
		//send scope.forms over http to server
		service.sendFormListToServer($scope.forms).then(function(){
			console.log("I am now here $scope.startBackup");
		});
	}
});








