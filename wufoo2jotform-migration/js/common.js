/*
	initilalize
*/
function init(){
	openWufooImportWizard();
}

//put shims
if(!("Utils" in window)){
	window.Utils = {};
}

if(Utils.loadTemplate === undefined){
	Utils.loadTemplate = function(url,callback){
		new Ajax.Request(url, {
              method:"GET",
              evalJS:false,
              evalJSON:false,
              onSuccess: function(response) {
              	  callback(response.responseText);
              }
        });
	}
}

