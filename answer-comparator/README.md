Answer Comparator
================================

*View the [answer-comparator source](https://github.com/jotform/api-use-cases/tree/master/answer-comparator).*

Answer Comparator compares the current form entries to those that have already been submitted.

Steps to use the script:

1. [Download](http://www.jotform.com/help/104-How-to-Download-a-Source-Code-of-your-Form) the source for your form.

2. Drop in the following files at the bottom:
```javascript
<script type="text/javascript" src="js/md5-min.js"></script>
<script src="http://js.jotform.com/JotForm.js"></script>
<script src="js/answerComparator.js"></script>
```

3. Include these files in the directory with your downloaded form. md5.js is used for hashing emails so they can not be scraped on the front end.  It can be downloaded [here](https://code.google.com/p/crypto-js/downloads/detail?name=2.3.0-md5-min.js&can=4&q=).

4. Include the JotForm API PHP file in your directory

5. Include your API key and FORM key in answerComparator.php.

You are all set!
