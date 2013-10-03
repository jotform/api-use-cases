
if(!window.console) { window.console = { log : function() {} }; }

window.parseDate = function(input, format) {
    var a=input.split(" ");
    var d=a[0].split("-");
    var t=a[1].split(":");
    return new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);
};

Date.prototype.addDays = function (n) {
    this.setDate(this.getDate() + n);
    this.tempDate = this.getDate();
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

        // var w = window.innerWidth-$("#sidebar").width();
        // $("#container").width(w-20);

        // window.onresize = function(){
        //     var w = window.innerWidth-$("#sidebar").width();
        //     $("#container").width(w-20);            
        // }

        JF.getUser(function(user){
            //user info successfully obtained
            window.app.user = user;

            JF.getForms({limit: 1000},function(forms){
                //typeahead text box
                $(".form-list").show();
                if (typeof user.avatarURL !== 'undefined') {
                    user.avatarUrl = user.avatarURL;
                } else if (typeof user.avatarUrl !== 'undefined') {
                    user.avatarURL = user.avatarUrl;
                }

                $.get("http://api.jotform.com/user/usage?apiKey=" + JF.getAPIKey(), function(r){
                    window.app.usage = r.content;
                });
                
                window.app.formsCollection = new FormsCollection(forms);
                window.app.submissionsCollection = new SubmissionsCollection();
                window.app.formSubmissionsCollection = new FormSubmissionsCollection();
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
                            return;x
                        }
                        window.app.homeView = new HomeView();
                    },
                    initializeFormView : function(formID){
                        createTypeAhead(forms);                        
                        var form = window.app.formsCollection.get(formID);
                        
                        window.app.sidebarView.addTab({
                            id: formID,
                            value: form.get("title"),
                            data : form
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


