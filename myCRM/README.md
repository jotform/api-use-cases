This subproject is a very simple CRM application in which users can register account, only have contacts list, view/delete/add/list contacts.

Contacts has pre defined fields such as: first_name last_name email tel adress,

This subproject also has 2 special files, my_canvas_url.php and webhook_callback.php, the first one is a integration app canvas url and the second one is the webhook callback.

my_canvas_url.php file does the following operations on insertion by iframe to jotform.com:

1. authenticate user by showing a login form to mycrm
2. show field matcher plugin to let user match the fields of their choice
3. on user completing field matcher tool, store the formId,matches,apiKey and username(both myCRM and Jotform) to a special table called, integrations 
4. create a webhook to given formId and to file webhook_callback.php
5. call JF.complete(); javascript method to inform parent jotform window about the completion of the proccess. Then jotform will show a success message and all is done!

webhook_callback.php does this:
1. If it is called, receive formId and look-up integrations table to see that it is a pre-defined integration with jotform,
2. fetch matches, read jotform submissions, then insert them to contacts table using matches,
3. done. integration now working as intended, our 3rd party app myCRM now successfully integrated to jotform.


All files mentioned here are in jotform_integration folder