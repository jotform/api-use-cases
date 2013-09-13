function openWufooImportWizard(){
    Utils.loadTemplate('/tpls/wufooImportWizard.html', function(source){
        var div = new Element('div');
        div.innerHTML = source;

        var WufooFHToJotformFormId = []; //this associative array will hold

        wizardWin = document.window({
            title: 'Migrate Your Wufoo account into JotForm!',
            width: 450,
            contentPadding: 0,
            content: div,
            dynamic: false,
            onClose: function(){

            },
            onInsert: function(w){
                window.wizard_holder = w;
              	console.log("ON Insert");
                   // document.getElementById("page1").style.display = "block";
                   //load jsprogressbar
                   //load progressbarhandlerjs file
                    var oHead = document.getElementsByTagName('HEAD').item(0);
                    var oScript= document.createElement("script");
                    oScript.type = "text/javascript";
                    oScript.src="/js/vendor/jsprogressbarhandler.js";
                    oHead.appendChild( oScript);


            },
            buttons: [{
                title: 'Continue',
                handler: function(){
                   
                    if(migration_task_handler.tasksCount == 0){
                        //add tasks here
                        /*
                            Task1, show wufoo credentials form and test credentials
                        */
                        migration_task_handler.addTask( {
                            taskName : "Checking Wufoo Credentials",
                            execute:function(){
                                var self = this;
                                //To show wufoo username and api-key form and check validity
                                migration_task_handler.renderPage("wufoo-credentials-form"); //pageid 1 is wufoo form
                                $("wcredentialscheck").observe("click",function(){
                                    migration_task_handler.showLoader("wcredentialscheck");
                                    new Ajax.Request('/backend.php', {
                                      method:"POST",
                                      parameters:{
                                        m:"checkWufooCredentials",
                                        wusername:$("wusername").value,
                                        wapikey:$("wapikey").value
                                      }, 
                                      onSuccess: function(response) {
                                        migration_task_handler.hideLoader("wcredentialscheck");
                                        var tmp = eval ("("+response.responseText+")");
                                        if(tmp.data === true){
                                            migration_task_handler.taskCompleted("success");
                                        }else{
                                            migration_task_handler.taskCompleted("fail");
                                        }
                                          
                                      }
                                    });
                                });
                                //migration_task_handler.taskCompleted("success",this.taskID);
                            },
                            success : function(){
                               $("wcerr").hide(); 
                               $("wcsuccess").show();
                               setTimeout(function(){
                                    migration_task_handler.executeNextTask();
                               },1500);
                            },
                            fail :function(){
                                $("wcerr").show();
                            }
                        });
                        //TASK1 Added
                        /*
                            Task 2, display form count and submissions count to user and wait for signal to start operation
                            if user clicks OK then fetch forms and add required tasks programmaticaly
                        */
                        migration_task_handler.addTask( {
                            taskName : "Calculating required tasks",
                            execute:function(){
                                 migration_task_handler.renderPage("wufoo-show-status-page"); //show status page first
                                 new Ajax.Request('/backend.php', {
                                      method:"POST",
                                      parameters:{
                                        m:"getWufooStatus",
                                        wusername:$("wusername").value,
                                        wapikey:$("wapikey").value
                                      }, 
                                      onSuccess: function(response) {
                                        var tmp = eval ("("+response.responseText+")");
                                        var original_tpl = $("wufoo-show-status-page-status").innerHTML;
                                        var textToWrite = original_tpl.replace("{{formCount}}",tmp.formCount).replace("{{submissionsCount}}",tmp.submissionsCount);
                                        $("wufoo-show-status-page-status").innerHTML = textToWrite;
                                        $("wufoo-show-status-page-status").show();
                                        $("wufoo-show-status-page-intro").hide();
                                        //assign event handler to wufoo-show-status-page-start-import button
                                        $("wufoo-show-status-page-start-import").observe("click",function(){
                                            //fetch form details and add operations
                                            //first show #wufoo-show-status-page-preparing div
                                            $("wufoo-show-status-page-status").hide();
                                            $("wufoo-show-status-page-preparing").show();
                                            new Ajax.Request('/backend.php', {
                                                  method:"POST",
                                                  parameters:{
                                                    m:"getWufooFormsWithCount",
                                                    wusername:$("wusername").value,
                                                    wapikey:$("wapikey").value
                                                  }, 
                                                  onSuccess: function(response) {
                                                    var tmp = eval ("("+response.responseText+")");
                                                    console.log(tmp);
                                                    for(var i in tmp){
                                                        if(tmp.hasOwnProperty(i)){//prevent prototype.js cluttering to take effect
                                                            var formHash = i;
                                                            var formSubmissionsCount = tmp[i];
                                                            //create and call anonymous function to pass correct values
                                                            (function(fh,fsc){
                                                                //add task to migrate form structure
                                                                migration_task_handler.addTask( {
                                                                    taskName : "Migrating structure of form "+fh+"",
                                                                    execute:function(){
                                                                        console.log("executing task migrate form with hash ",fh);
                                                                        new Ajax.Request('/backend.php', {
                                                                          method:"POST",
                                                                          parameters:{
                                                                            m:"migrateFormToJotForm",
                                                                            wusername:$("wusername").value,
                                                                            wapikey:$("wapikey").value,
                                                                            formHash:fh
                                                                          },
                                                                          onSuccess: function(response){
                                                                            var tmp = eval ("("+response.responseText+")");
                                                                            console.log(fh," migration request sent. response = ",tmp);
                                                                            console.log("change of ids ",tmp.oldId," to ",tmp.formId);
                                                                            //update all migrate submissions tasks from tmp.oldId to tmp.formId
                                                                            WufooFHToJotformFormId[tmp.oldId] = tmp.formId;
                                                                            migration_task_handler.taskCompleted("success");
                                                                          }
                                                                        });

                                                                    },
                                                                    success : function(){
                                                                        //update status bar
                                                                        migration_task_handler.executeNextTask();

                                                                    },
                                                                    fail :function(){
                                                                    }
                                                                });

                                                                //add task to migrate form submissions
                                                                if(fsc !== 0){
                                                                    //add task to migrate submissions for formHash=i
                                                                    //submissions must be added as using multiple tasks since WuFoo api only gives max 100 submissions per api call.
                                                                    var submissionsFetchPageSize = 100; //lets test this make it TODO: 100 later
                                                                    var submissionFetchTaskCount = Math.ceil(fsc/submissionsFetchPageSize); //for values lower than 100 this will be equal to 1
                                                                    
                                                                    for(var sti = 0; sti<submissionFetchTaskCount;sti++){
                                                                        //we are at page sti, should calculate pageStart parameter
                                                                        var pageStart = (sti*submissionsFetchPageSize); //for sti = 0 pageStart is 0, for sti = 1 pageStart is 100,
                                                                        migration_task_handler.addTask( {
                                                                            taskName : "Migrating submissions of form "+fh+": completed "+pageStart+" out of "+fsc,
                                                                            execute:function(){
                                                                                var newId = WufooFHToJotformFormId[fh]; //I hope this to work
                                                                                new Ajax.Request('/backend.php', {
                                                                                  method:"POST",
                                                                                  parameters:{
                                                                                    m:"migrateSubmissionsToJotForm",
                                                                                    wusername:$("wusername").value,
                                                                                    wapikey:$("wapikey").value,
                                                                                    pageStart:pageStart, //pass pageStart parameter to AJAX POST request
                                                                                    pageSize:submissionsFetchPageSize, // pass pageSize parameter
                                                                                    formHash:fh,
                                                                                    newFormId:newId
                                                                                  },
                                                                                  onSuccess: function(response){
                                                                                    var tmp = eval ("("+response.responseText+")");
                                                                                    console.log(fh," submissions migration request sent. response = ",tmp);
                                                                                    migration_task_handler.taskCompleted("success");
                                                                                  }
                                                                                });
                                                                            },
                                                                            success : function(){
                                                                                //update status bar
                                                                                migration_task_handler.executeNextTask();
                                                                            },
                                                                            fail :function(){
                                                                            }
                                                                        });
                                                                    }
                                                                }

                                                                //all tasks added

                                                            })(formHash,formSubmissionsCount);
                                                        }
                                                    }

                                                    //all tasks had been added execute next tast
                                                    migration_task_handler.taskCompleted("success");

                                                  }
                                            });


                                            
                                        });
                                      }
                                });

                            },
                            success : function(){
                                migration_task_handler.executeNextTask();
                                //
                                migration_task_handler.renderPage("wufoo-show-migration-status"); //pageid 1 is wufoo form
                            },
                            fail :function(){
                                
                            }
                        });
                        //Task 2 ended
                        //all tasks added

                    }
                    migration_task_handler.executeNextTask();

                    

                }
            }]
        });
    });
}

/*
    very simple task handler for migration wizard, it will hold a tasks array, 

    every task should have a execution function, success and fail callbacks

    every task shoud inform migration_task_handler object after a task completed,

    then migration_task_handler will call success or fail functions then it will proceed

    to new task. A task's main task ( :) ) will be rendering some HTML and wait user input

    or directly do some aync requests and wait it's result
*/

var migration_task_handler = {
    tasks : [],
    currentTaskIndex : 0,
    tasksCount : 0,
    addTask: function(task){
        this.logToConsole("addTask");
        task.taskID = this.tasksCount;
        this.tasks[this.tasksCount] = task;
        this.tasksCount++;
    },
    taskCompleted: function(result){
        this.logToConsole("taskCompleted with result = ("+result+")");
        this.updateTaskStatus(); //update task status
        if(this.currentTaskIndex >= this.tasks.length){
            console.log("entered false taskCompleted");
            return false;
        }
        
        taskID = this.currentTaskIndex;
        if(result == "success"){
            this.currentTaskIndex++;
            console.log("current task index increased to ",this.currentTaskIndex);
            this.tasks[taskID].success();
            //$("button-0").show();
        }else{
            this.tasks[taskID].fail();
        }
    },
    executeNextTask : function(){
        this.logToConsole("executeNextTask");
        if(this.currentTaskIndex >= this.tasks.length){
            this.allTasksCompleted();
            return false;
        }

        $("button-0").hide();
        console.log($("button-0"));
       
        this.tasks[this.currentTaskIndex].execute();
    },
    renderPage:function(pageid){
        //this.logToConsole("renderPage");
        $$(".import-gen-page").each(function(el){
                el.hide();
        });

        $(pageid).show();
    },
    showLoader:function(buttonId){
        $(buttonId).insert({
            after : "<img src='/images/ajax-loader.gif' id='loaderfor"+buttonId+"'/>"
        });
    },
    hideLoader:function(buttonId){
        $("loaderfor"+buttonId).remove();
    },
    logToConsole:function(caller){
        console.log(caller," Task Handler reporting currentTaskIndex = ",this.currentTaskIndex," and tasksCount = ",this.tasksCount);
    },
    allTasksCompleted:function(){
        myJsProgressBarHandler.setPercentage("element1",100);
        var newStatusText = "Account Migration completed!";
        $("current_operation").innerHTML = newStatusText+"<br/> ";
        this.tasks = [];
        this.currentTaskIndex = 0;
        this.tasksCount = 0;

        //inform RequestServer about this
        /*
        new Ajax.Request('/server.php', {
          method:"POST",
          parameters:{
            action:"wufooLog",
            log:$("wusername").value+" completed wufoo import. "
          },onSuccess: function(response){
            console.log("request server informed");
          }
        }); */

    },
    updateTaskStatus:function(){
        if(this.tasks.length <4){
            return false;
        }

        var curtask = this.tasks[this.currentTaskIndex];
        var newPercentage = Math.floor((this.currentTaskIndex+1)/(this.tasks.length) * 100);
        myJsProgressBarHandler.setPercentage("element1",newPercentage);
        var newStatusText = "Task : "+curtask.taskName+" ... completed!";
        $("current_operation").innerHTML = newStatusText;
    }





};

/*

*/
var example_task = {
    taskID : false,
    execute:function(){

        //To something

        migration_task_handler.taskCompleted("success");

    },
    success : function(){


    },
    fail :function(){

    }
};

function __kemal_fireEvent(element,event){
    if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return element.fireEvent('on'+event,evt)
    }
    else{
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}




