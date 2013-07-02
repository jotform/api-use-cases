
if(!window.console) { window.console = { log : function() {} }; }

window.parseDate = function(input, format) {
    var a=input.split(" ");
    var d=a[0].split("-");
    var t=a[1].split(":");
    return new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);
};

$(document).ready(function(){

    var self = window.app = this;

    function initializeApp(userModelObject){


        JF.getUser(function(r){

            JF.getForms(function(r){
                $(".form-list").show();

                window.app.user = r;
                window.app.formsCollection = new FormsCollection(r);
                window.app.sidebarView = new SidebarView();

                var t = new UsageView({
                    el: document.getElementById("usage")
                });

                window.app.homeView = new HomeView();
                
                var formNames = [];
                for(var i=0; i<r.length; i++){
                    formNames.push(r[i].title);
                }
                $(".form-list .typeahead").typeahead({
                    name: "forms",
                    local: formNames
                });
            });

            $(".login-button").remove();
            $(".account").html('<a class="account-info">'+
                    '<span>' + r.username + '</span>' +
                    '<img src="'+r.avatarUrl+'"/>' +
                '</a>');
        });


        $(".login-button").click(function(){
            // JF.login(function(){
            //     console.log("user logged in");
            //     JF.getUser(function(r){
            //         console.log("user is ", r);
            //     })
            // })
        });
        
        //define router
        var Router = Backbone.Router.extend({
            // routes: {
            //     "": "showProfile",
            //     "profile": "showProfile",
            //     "users": "showUsers",
            //     "settings": "showSettings",
            //     "billing": "showBilling",
            //     "api": "showApi",
            //     "history": "showHistory",
            //     "usage": "showUsage",
            //     "getMore": "showGetMore"
            // },

            // showProfile :   function(){ self.stateModel.set("currentTabId", "profile");  if(window.app.needRefresh){ window.location.reload(); } },
            // showUsers:      function(){ self.stateModel.set("currentTabId", "users"); if(window.app.needRefresh){ window.location.reload(); } },
            // showSettings:   function(){ self.stateModel.set("currentTabId", "settings"); if(window.app.needRefresh){ window.location.reload(); } },
            // showBilling:    function(){ self.stateModel.set("currentTabId", "billing"); if(window.app.needRefresh){ window.location.reload(); } },
            // showApi:        function(){ self.stateModel.set("currentTabId", "api"); if(window.app.needRefresh){ window.location.reload(); } },
            // showHistory:    function(){ self.stateModel.set("currentTabId", "history"); if(window.app.needRefresh){ window.location.reload(); } },
            // showUsage:      function(){ self.stateModel.set("currentTabId", "usage"); if(window.app.needRefresh){ window.location.reload(); } },
            // showGetMore:    function(){ self.stateModel.set("currentTabId", "getMore"); if(window.app.needRefresh){ window.location.reload(); } }
        });
        //and initialize
        // self.router = new Router();
        // Backbone.history.start({pushState: true, root: "/myaccount/"});


    };

    if( JF.getAPIKey() === null){
        JF.login(function(){
            initializeApp();
        })
    } else {
        initializeApp();
    }
    //because it is asynchronous we need to initialize main view after successfull response of user object from API
    //also this way we show nothing to loggedOut users
    
    // JotformAPI.getUserDetail({

    //     success : function(res){
    //         if (res.message == "success"){
    //             var userDetails = res.content;
    //             initializeApp(userDetails);
    //         }
    //     },

    //     error: function(){

    //         loginModalBoxBuilder({
    //             onSuccessfullLogin: function(res){
    //                 initializeApp(res.content);
    //             }
    //         });

    //     }
    // });
});


