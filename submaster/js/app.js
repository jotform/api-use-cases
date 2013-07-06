
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


        JF.getUser(function(user){

            JF.getForms(function(forms){
                $(".form-list").show();
                
                if (typeof user.avatarURL !== 'undefined') {
                    user.avatarUrl = user.avatarURL;
                } else if (typeof user.avatarUrl !== 'undefined') {
                    user.avatarURL = user.avatarUrl;
                }
                window.app.user = user;
                window.app.formsCollection = new FormsCollection(forms);
                window.app.submissionsCollection = new SubmissionsCollection();
                
                window.app.sidebarView = new SidebarView();

                window.app.homeView = new HomeView();

                window.app.cache = {};
                // window.app.mainTabView = new MainTabView();
                
                var formNames = [];
                for(var i=0; i<forms.length; i++){
                    formNames.push(forms[i].title);
                }

                var datums = [];
                for(var i=0; i<forms.length; i++){
                    datums.push({
                        value: forms[i].title,
                        tokens: [forms[i].title], 
                        id: forms[i].id
                    });
                }                

                var t = $(".form-list .typeahead").typeahead({
                    name: "forms",
                    local: datums,
                    template: '<p><strong>{{value}}</strong></p>',
                    engine: Hogan
                });

                t.on("typeahead:selected", function(evt, data){
                    app.sidebarView.addTab(data);
                });

                var date = new Date();
                var d = date.getDate();
                var m = date.getMonth();
                var y = date.getFullYear();
                
                $('#calendar').fullCalendar({
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month,basicWeek,basicDay'
                    },
                    editable: true,
                    events: [
                        {
                            title: 'All Day Event',
                            start: new Date(y, m, 1)
                        },
                        {
                            title: 'Long Event',
                            start: new Date(y, m, d-5),
                            end: new Date(y, m, d-2)
                        },
                        {
                            id: 999,
                            title: 'Repeating Event',
                            start: new Date(y, m, d-3, 16, 0),
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'Repeating Event',
                            start: new Date(y, m, d+4, 16, 0),
                            allDay: false
                        },
                        {
                            title: 'Meeting',
                            start: new Date(y, m, d, 10, 30),
                            allDay: false
                        },
                        {
                            title: 'Lunch',
                            start: new Date(y, m, d, 12, 0),
                            end: new Date(y, m, d, 14, 0),
                            allDay: false
                        },
                        {
                            title: 'Birthday Party',
                            start: new Date(y, m, d+1, 19, 0),
                            end: new Date(y, m, d+1, 22, 30),
                            allDay: false
                        },
                        {
                            title: 'Click for Google',
                            start: new Date(y, m, 28),
                            end: new Date(y, m, 29),
                            url: 'http://google.com/'
                        }
                    ]
                });

            });

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


