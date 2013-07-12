
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

jotModule.controller('IndexController',function($scope,$location,valStorage){
	$scope.title = "Index Controller Title";
	
	$scope.forms = [];

	$scope.jot_logged_in = valStorage.get("jot_logged_in");

	$scope.jotform_connect = function(){
		JF.login(
				function(){
					$scope.jot_logged_in=valStorage.set("jot_logged_in",true);
					JF.getForms(function(response){
						for(var i=0; i<response.length; i++){
							//document.write( "<li> " + response[i].title);
						}
					});
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
jotModule.controller('BackupController',function($scope,jotservice){
	$scope.forms = [];
	jotservice.getForms().then(function(response){
		$scope.forms = response;
	});


});








