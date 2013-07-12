/**
 * JotFormAPIWidgets.js 0.1.0
 *
 *  (c) 2013 JotForm Easiest Form Builder
 *
 * JotFormAPIWidgets.js may be freely distributed under the MIT license.
 * For all details and documentation:
 * http://api.jotform.com
 */

/*
 * INITIAL SETUP
 * =============
 *
 * Include jQuery script to your page
 * 
 * Include JotForm.js script to your page
 * __<script src="http://js.jotform.com/JotForm.js"></script>__
 *   
 * Include JotFormAPIWidgets.js script to your page
 * __<script src="http://js.jotform.com/JotForm.js"></script>__
 *
 * Include JotFormAPIWidgets.css to your page
 * __<link href="http://js.jotform.com/JotForm.js"></script>__
 * 
 */

(function( $ ) { 
    
    $.fn.JF_FormList = function() {
        return this.each(function() {
            buildFormsList($(this));
        });
    }
    function buildFormsList(el) {
        if( typeof JF === 'undefined' ) {
            console.error("JotFormJS is undefined");
            return;
        }
        var markup ='<div class="jf-form-list-wrapper">' +
            '<ul class="jf-form-list">';
        JF.getForms(function(resp) {
            for(var i=0; i<resp.length; i++) {
                var form = resp[i];
                form['unread'] = form['new'];
                //form['update_date'] = prettyDate(form['updated_at']);
                // var item = '<li class="jf-form-list-item">' + 
                //     '<div>'+
                //         '<img src="./images/blank.gif" class="jf-checkbox-icon" />' +
                //     '</div>' +
                //     '<div>' +
                //         '<img src="./images/blank.gif" class="jf-form-icon" />' +
                //         form["new"] > 0 ? '<span class="jf-unread">' + form["new"] + '</span>' : "" +
                //     '</div>' +
                //     form.title + 
                //     '</li>';
                var item = tmpl(template, form);
                markup = markup + item;
            }
            markup = markup + '</ul>' + '</div>';
            el.html(markup);
        });
    }
    function getWindowDimensions() {
        var viewportwidth;
        var viewportheight;
         // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
        if (typeof window.innerWidth != 'undefined')
        {
              viewportwidth = window.innerWidth,
              viewportheight = window.innerHeight
        }
        // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
        else if (typeof document.documentElement != 'undefined'
             && typeof document.documentElement.clientWidth !=
             'undefined' && document.documentElement.clientWidth != 0)
        {
               viewportwidth = document.documentElement.clientWidth,
               viewportheight = document.documentElement.clientHeight
        }
         // older versions of IE
        else
        {
            viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
            viewportheight = document.getElementsByTagName('body')[0].clientHeight
        }
        return {
            width: viewportwidth,
            height: viewportheight
        }
    }
    function customEllipsis(str, crop) {
        if( !str ) {
            return;
        }
        if( str.length>crop ) {
            var b = str.substring(0,crop-30);
            var e = str.substring(str.length-10, str.length);
            return b + ". . . . . " + e;
        } else {
            return str;
        }
    }
    function shortenUnreadNumber(unreadText) {
        if( !unreadText ) {
            return;
        }
        unreadText = unreadText+"";
        if( unreadText.length<4 ) {
            return unreadText;
        } else {
            return unreadText.substring(0,unreadText.length-3) + "k";
        }
    }

    var cache = {};
    var template = '<li class="jf-form-list-item">' + 
            '<div>'+
                '<img src="./images/blank.gif" class="jf-checkbox-icon" />' +
            '</div>' +
            '<div>' +
                '<img src="./images/blank.gif" class="jf-form-icon" />' +
                '<span style="display: <%=unread > 0 ? "block" : "none"%> "class="jf-unread"><%=unread%></span>' +
            '</div>' +
            '<div title="<%=title%>" class="jf-form-title">' +
                '<%=title%>' +
            '</div>' +
            '<div class="jf-form-info">' +
                '<span><b><%=count%></b> Submissions.</span>' +
                '<span>Modified on <%=updated_at%></span>' +
            '</div>' +
        '</li>';
    function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :
         
          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
        new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
           
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
           
            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");
       
        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
    /*
     * JavaScript Pretty Date
     * Copyright (c) 2011 John Resig (ejohn.org)
     * Licensed under the MIT and GPL licenses.
     */

    // Takes an ISO time and returns a string representing how
    // long ago the date represents.
    this.prettyDate = function(time) {  
        var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
            diff = (((new Date()).getTime() - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400);
        console.log(date, diff, day_diff);
        if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
            return;
                
        return day_diff == 0 && (
                diff < 60 && "just now" ||
                diff < 120 && "1 minute ago" ||
                diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
                diff < 7200 && "1 hour ago" ||
                diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
            day_diff == 1 && "Yesterday" ||
            day_diff < 7 && day_diff + " days ago" ||
            day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
    }

    // If jQuery is included in the page, adds a jQuery plugin to handle it as well
    if ( typeof jQuery != "undefined" )
        jQuery.fn.prettyDate = function(){
            return this.each(function(){
                var date = prettyDate(this.title);
                if ( date )
                    jQuery(this).text( date );
            });
        };    
})(jQuery);