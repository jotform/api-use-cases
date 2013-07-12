/*
	String length cutter
*/
jotModule.filter('cutit', function() {
	return function(input, count,append) {
		if(append === undefined){
			append = "";
		}
		var out = "";
		if(count > input.length){
			count = input.length;
		}

		for (var i = 0; i < count; i++) {
			out += input.charAt(i);
		}
		console.log(input,count,append);
		return out+append;
	}
});