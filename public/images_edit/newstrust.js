function openPopup(mylink, windowname, width, height, attrib)
{
	if (! window.focus) return true;
	var href;
	var w;
	if (windowname=="NewsTrust" || width=='restore') {		// use cookies to restore width/height
		width=getCookie('NewsTrustWinW');
		height=getCookie('NewsTrustWinH');
	}
	if (!attrib) attrib=',scrollbars=yes,resizable=yes';
	if (!width) width=540;
	if (!height) height=480;
	if (typeof(mylink) == 'string') {
		href=mylink;
	} else {
		href=mylink.href;
	}
//	alert(width+','+height);
	w=window.open(href, windowname, 'width='+width+',height='+height+attrib);
	w.focus();
	return false;
}

/**
* really should reuse all that nice code in ReviewPaneWindowManager
* rather than this janky method. Consider
*/
function openSubmitBookmarklet(url)
{
  w = window.open(url,
  	'newstrust',
    'dependent=no,scrollbars=yes,resizable=yes,alwaysRaised=yes,status=yes,directories=yes,location=yes,menubar=yes,toolbar=yes,'
    + 'width=540,height=800,modal=no');
}


function openSearchPopup(mylink, windowname, attrib)
{
	if (! window.focus) return true;
	var href;
	var w;
	width=getCookie('NewsTrustWin2W');
	height=getCookie('NewsTrustWin2H');
	x=getCookie('NewsTrustWin2X');
	if (!attrib) attrib=',scrollbars=yes,resizable=yes';
	if (!width) width=640;
	if (!height) height=480;
	if (typeof(mylink) == 'string') {
		href=mylink;
	} else {
		href=mylink.href;
	}
//	alert(width+','+height+','+x);
	if (x) {
		w=window.open(href, windowname, 'width='+width+',height='+height+',left='+x+',top=40,'+attrib);
	} else {
		w=window.open(href, windowname, 'width='+width+',height='+height+attrib);
	}
	w.focus();
	return false;
}



function detectexist(obj){
	return (typeof obj !="undefined")
}

/*
   name - name of the cookie
   value - value of the cookie
   [expires] - expiration date of the cookie
     (defaults to end of current session)
   [path] - path for which the cookie is valid
     (defaults to path of calling document)
   [domain] - domain for which the cookie is valid
     (defaults to domain of calling document)
   [secure] - Boolean value indicating if the cookie transmission requires
     a secure transmission
   * an argument defaults when it is assigned null as a placeholder
   * a null placeholder is not required for trailing omitted arguments
*/
function setCookie(name, value, expires, path, domain, secure) {
  var curCookie = name + "=" + escape(value) +
      ((expires) ? "; expires=" + expires.toGMTString() : "") +
      ((path) ? "; path=" + path : "") +
      ((domain) ? "; domain=" + domain : "") +
      ((secure) ? "; secure" : "");
  document.cookie = curCookie;
}


/*
  name - name of the desired cookie
  return string containing value of specified cookie or null
  if cookie does not exist
*/
function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else
    begin += 2;
  var end = document.cookie.indexOf(";", begin);
  if (end == -1)
    end = dc.length;
  return unescape(dc.substring(begin + prefix.length, end));
}


/*
   name - name of the cookie
   [path] - path of the cookie (must be same as path used to create cookie)
   [domain] - domain of the cookie (must be same as domain used to
     create cookie)
   path and domain default if assigned null or omitted if no explicit
     argument proceeds
*/
function deleteCookie(name, path, domain) {
  if (getCookie(name)) {
    document.cookie = name + "=" +
    ((path) ? "; path=" + path : "") +
    ((domain) ? "; domain=" + domain : "") +
    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
  }
}

// date - any instance of the Date object
// * hand all instances of the Date object to this function for "repairs"
function fixDate(date) {
  var base = new Date(0);
  var skew = base.getTime();
  if (skew > 0)
    date.setTime(date.getTime() - skew);
}

// modified to handle both formmail and multiple email addresses
function noSpam() {
	var link = noSpam.arguments[0]; // text for the link
	var subject = noSpam.arguments[1]; // if there's a subject line to the message

	var myat = String.fromCharCode(64);   // @
	var mydot = String.fromCharCode(46);  // .
	var addr = '';

	// starting from the third argument,
	// read the segments and build the address:
	var i;
	var position = 0; // used to check progress to add @ dot comma
	for (i = 2; i < noSpam.arguments.length; i++) {
		if (position == 3) { // must be another email address so reset this and add comma
			position = 0;
			addr += ',';
		}
		if (position) {
			// check whether this element (any but the first)
			// comes after the @ or a dot:
			addr += (position == 1) ? myat : mydot;
		}
		addr += noSpam.arguments[i];
		position++;
	}

	var str = '';
	if (link) {
		if (link== 'formmail') {
			// you could break this down further so that
			// the 'recipient' is less apparent:
			str = '<INPUT TYPE=hidden NAME="recipient" VALUE="';
			
			str += addr;
			str += '">';
		} else if (link == 'navbar') {
			str = '<td class="navbar" nowrap onclick="window.location=\'mailto:' + addr;
			
			if (subject) {
				// code to display the subject
				str += '?subject=' + subject;
			}
			str += '\'" style="cursor:pointer">';
			
		} else {
			// you could break this down further so that
			// the 'mailto' is less apparent:
			str = '<a href="mailto:' + addr;
			
			if (subject) {
				// code to display the subject
				str += '?subject=' + subject;
			}
			
			str += '">';
	
			// if the first argument was literally 'addr', the text for the link
			// is the address itself, otherwise it's the text of the argument:
			str += (link == 'addr') ? addr : link;
			
			str += '<\/a>';  // close the tag
		}
	}
	else {
		// if the first argument is '' just print the address
		// without making it a link at all:
		str = addr;
	}

	document.write (str);
}
