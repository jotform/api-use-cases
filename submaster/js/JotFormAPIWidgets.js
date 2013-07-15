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
    
    $.fn.JF_FormList = function(options) {
        var defaults = {
            sort: 'updated_at'
        }
        var settings = $.extend({}, defaults, options);
        return this.each(function() {
            var el = $(this);
            buildFormsList(el, settings.sort);
            el.find('.jf-form-list-item').click(function() {
                $('.jf-checkbox-icon.active', el).removeClass("active");
                $('.jf-checkbox-icon', this).addClass("active");
            });
        });
    }
    function buildFormsList(el, sort) {
        if( typeof JF === 'undefined' ) {
            console.error("JotFormJS is undefined");
            return;
        }
        var markup ='<div class="jf-form-list-wrapper">' +
            '<ul class="jf-form-list">';
        JF.getForms(function(resp) {
            switch(sort) {
                case 'new':
                    resp.sort(function(a, b) {
                        return parseInt(b['new']) - parseInt(a['new']);
                    });
                    break;
                case 'updated_at':
                    break;
                default: 
                    break;                    
            }
            for(var i=0; i<resp.length; i++) {
                var form = resp[i];
                form['unread'] = form['new'];
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
})(jQuery);