
if(!window.console) { window.console = { log : function() {} }; }

window.parseDate = function(input, format) {
    var a=input.split(" ");
    var d=a[0].split("-");
    var t=a[1].split(":");
    return new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);
};

$(document).ready(function(){

    var self = window.app = this;

    if( JF.getAPIKey() === null){
        JF.login(function(){
            initializeApp();
        });
    } else {
        initializeApp();
    }

    function initializeApp(){
        
        var SM = Backbone.Model.extend({});
        window.app.stateModel = new SM();

        

        JF.getUser(function(user){
            $("#username").html(user.name);
            $("#avatar").attr("src", user.avatarUrl);
            window.app.user = user;
            JF.getForms(function(forms){
                //typeahead text box
                $(".form-list").show();
                if (typeof user.avatarURL !== 'undefined') {
                    user.avatarUrl = user.avatarURL;
                } else if (typeof user.avatarUrl !== 'undefined') {
                    user.avatarURL = user.avatarUrl;
                }

                JF.getUsage(function(usage){
                    window.app.usagesView= new UsagesKnobView({
                        usage: usage,
                        el: document.getElementById("usage-knobs")
                    });
                });
                
                window.app.formsCollection = new FormsCollection(forms);
                window.app.submissionsCollection = new SubmissionsCollection();
                window.app.sidebarView = new SidebarView();

                var Router = Backbone.Router.extend({
                    routes: {
                        "": "initializeHomeView",
                        ":formID": "initializeFormView"
                    },
                    initializeHomeView : function(){
                        createTypeAhead(forms);
                        window.app.sidebarView.showTab("home");
                        if(window.app.stateModel.get("home")){
                            return;
                        }
                        window.app.homeView = new HomeView();
                    },
                    initializeFormView : function(formID){
                        createTypeAhead(forms);                        
                        var form = window.app.formsCollection.get(formID);
                        window.app.sidebarView.addTab({
                            id: formID,
                            value: form.get("title")
                        });                                      
                    }
                });

                self.router = new Router();
                Backbone.history.start({pushState: false});

            });
        });

        //define router
    };

    function createTypeAhead(forms) {
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
            window.app.router.navigate(data.id, { trigger: true });
            t.val("");
        });        
    }    

});


