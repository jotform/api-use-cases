Import Submissions
================================

*View the [import-submissions source](https://github.com/jotform/api-use-cases/tree/master/import-submissions).*

Import Submissions imports data from .CSV and Microsft Excel files and submits them to JotForm via the PHP API.

You can see the script in action [here](http://www.jotform.com/import-submissions).  

Import Submissions makes use of the JotForm FormPicker widget to choose which form to submit data to.

###Dependencies:
#####Functional:
[PHP-ExcelReader](http://sourceforge.net/projects/phpexcelreader/) - read the Excel files and get contents to send to API.  
[JotForm PHP API](https://github.com/jotform/jotform-api-php).
#####Prettification:
[Bootstrap](http://bootstrapdocs.com/v2.2.2/docs/getting-started.html) style to make things look pretty.  
[Bootstrap FileUpload](http://jasny.github.io/bootstrap/javascript.html#fileupload)  for a nice upload button.

