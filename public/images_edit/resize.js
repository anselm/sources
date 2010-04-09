	IE4=(document.all)?1:0;
	NS4=(document.layers)?1:0;
	DOM=(document.getElementById)?1:0;
	NS6=((DOM)&&(!IE4));
	ver4=((IE4)||(NS6)||(NS4))?1:0;
	nav=navigator.appVersion;
	nav=nav.toLowerCase();
	useragent=navigator.userAgent;
	useragent=useragent.toLowerCase();
	isMozilla=(useragent.indexOf("mozilla")!=-1)?1:0;
	isFirefox=(useragent.indexOf("firefox")!=-1)?1:0;
	isNetscape=(useragent.indexOf("netscape")!=-1)?1:0;
	isMac=(nav.indexOf("mac")!=-1)?1:0;
	isSafari=(nav.indexOf("safari")!=-1)?1:0;
	isIEmac=((document.all)&&(isMac))?1:0;
	genericMozilla=(isMozilla && !isSafari && !isFirefox && !isNetscape && !isIEmac)?1:0;


/**
* DEPRECATED. new code should use ReviewPaneWindowManager.open()!!!
* (note. Calls to resize() are always preceded by saveScreenDimensions())
*/
function resize(s,w,secondWin,sURL) {

	var max_win1_w = 500;
	var max_win2_w = 800;
	if (isMac && isIEmac) max_win1_w = 520;
	var screen_w = screen.availWidth;
	var win1_h = screen.availHeight;
	var win1_w = screen_w / 2;
	var win1_x = 0;
	var win1_y = 0;
	var win2_h = win1_h;
	if (win1_w > max_win1_w) win1_w = max_win1_w;
	var win2_w = screen_w - win1_w;
	if (win2_w > max_win2_w) win2_w = max_win2_w;	
	var win2_x = win1_w;
	
	
	if (isMac) {		// Mac browsers
	   if (isIEmac) {
			win1_h -= 72;
			win2_h = win1_h - 16;
			win2_w -= 17;
			if (event.screenX<0) {
				win1_x = -screen_w;
				win2_x = win1_x + win1_w - 1;
			}
		} else if (isNetscape) {
			win1_h -= 22;
			win2_h = win1_h;
			if (w.screenX<0) {
				win1_x = -screen_w;
			} else if (screen.availLeft > 0) {
				win1_x += screen.availLeft;
				win2_x += screen.availLeft;
			}
			//document.write(win1_x);

		} else if (genericMozilla) {
			win1_h -= 22;
			win2_h = win1_h-25;
			if (w.screenX<0) {		// on the left monitor, so position properly
				win1_x = -screen_w;
				win2_x = win1_x+win1_w;
			} else if (screen.availLeft > 0) {
				win1_x += screen.availLeft;
				win2_x += screen.availLeft;
			}
		} else if (isFirefox) {
			win1_h -= screen.availTop;
			if (w.screenX<0) {		// on the left monitor, so position properly
				win1_x = -screen_w;
				win2_x = win1_x + win1_w;
			} else if (screen.availLeft > 0) {
				win2_x += screen.availLeft;
			}
		}   	
	} else if (IE4) {		// Windows browsers
//		win2_w -= 12;
//		win2_h = win1_h - 31;
	} else if (isFirefox) {
		win1_w -= 3;
		win2_w -= 3;
		win2_x += 3;
	}
	if ((isNetscape || genericMozilla) && isMac && (w.screenX<0 || screen.availLeft > 0)) {	// two-screen bug in Mac Netscape 7.2 and Mozilla
		s.moveTo(win1_x,win1_y);
	} else {		
		s.moveTo(win1_x,win1_y);
		s.resizeTo(win1_w,win1_h);
	}
	//	alert("press ok to continue");
	
	if (secondWin && sURL) {
		win2=window.open(sURL,"win2","height=" + win2_h + ",width=" + win2_w +",left=" + win2_x + ",top=0,scrollbars=yes,resizable=yes,status=yes,directories=yes,location=yes,menubar=yes,toolbar=yes");
		if (window.focus) {win2.focus()}
		setCookie("NewsTrustWin2W",win2_w-20,"","/");
		setCookie("NewsTrustWin2H",win2_h-120,"","/");
		setCookie("NewsTrustWin2X",win2_x+20,"","/");
		win2.moveTo(win2_x,0);
	}
}

/**
* This is always called before resize();
* This browser-compatibility code should eventually be rolled into ReviewPaneWindowManager,
* which currently calls it from open(), for now.
*/
function saveScreenDimensions() {
	w=(detectexist(window.outerWidth))? window.outerWidth : (detectexist(window.innerWidth))? window.innerWidth : (detectexist(document.documentElement.clientWidth))? document.documentElement.clientWidth :800;
	h=(detectexist(window.outerHeight))? window.outerHeight : (detectexist(window.innerHeight))? window.innerHeight : (detectexist(document.documentElement.clientHeight))? document.documentElement.clientHeight :600;
  
	setCookie("NewsTrustWinW",w,"","/");
	setCookie("NewsTrustWinH",h,"","/");
}

/**
* DEPRECATED. dev version
*/
function saveScreenDimensions2() {		// test version, with alerts
  alert("deprecated function call!")
  saveScreenDimensions()
}

/**
* This is generally called by links from review pane pages,
* but sometimes also from subsequent onloads, as in story_overview.auto
* Really shouldn't call this from onloads; better to do the resizing before page load.
*/
function restoreScreenDimensions(s,URL) {
  ReviewPaneWindowManager.expand()
  
  // weird legacy thing
  if (URL) location.replace(URL)
}

/**
* DEPRECATED. dev version
*/
function restoreScreenDimensions2(s,URL) {		// test version, with alerts
  alert("deprecated function call!")
  restoreScreenDimensions()
}


var ReviewPaneWindowManager =
{
  // constants
  reviewPaneWidth: 540,
  reviewPaneHeight: 800,
  useCookies: true,
  fullWindowWidth: 880,
  fullWindowHeight: 800,
  
  /**
  * New review pane popup to eventually phase out resize() etc. above...
  * this should be called from the onclick of a link, to get around popup blockers.
  * To consider: save user's initial screen dimensions in cookies like before? to be dug out by expand()?
  */
  open: function(reviewPaneUrl)
  {
    // just use the old function here. this is because we're not rewriting restoreScreenDimensions() just yet.
    saveScreenDimensions()
    
    // assign these to local vars because of lingering browser incompatibilities. 
  	var windowLeft = this.getWindowLeft()
  	var windowWidth = this.getWindowWidth()
  	var screenWidth = this.getScreenWidth()
    
  	// calculate the popup review pane's X
  	var reviewPaneX = windowLeft + windowWidth; // have it sit alongside if possible
  	if (reviewPaneX+this.reviewPaneWidth > screenWidth) // otherwise, stick it where it will fit
  		reviewPaneX = screenWidth - this.reviewPaneWidth
    
    // cook up a unique-ish window ID using the story ID. do we want this to ALWAYS be unique?
    // this code is a bit fragile as it depends on the URL structure...
    var storyIdMatches = new RegExp(/.*storyid=[.](.*)/).exec(reviewPaneUrl)
    var storyId = (((storyIdMatches) && (storyIdMatches.length>1))?(storyIdMatches[1]):"")
    var reviewPaneName = "newsTrustReviewPane_" + storyId
    if (reviewPaneName==window.name) reviewPaneName += "_" // cheapo deduping
    
  	// open the popup
  	var storyReviewPane = window.open(reviewPaneUrl, reviewPaneName,
  		"width="+this.reviewPaneWidth+"," +
  		"height="+this.reviewPaneHeight+"," +
  		"left="+reviewPaneX+"," +
  		//"top=0," +
  		"scrollbars=yes,resizable=yes,status=yes,directories=yes,location=yes,menubar=yes,toolbar=yes")
  		// hope the user likes those settings!
  },

  /**
  * once review is submitted, blow up pane (current window) to a more typical window size.
  */
  expand: function()
  {
    // try to get from cookie, just in case. If it's not there, use our default values.
    if (this.useCookies)
    {
      fullWindowWidth = getCookie("NewsTrustWinW")
    	fullWindowHeight = getCookie("NewsTrustWinH")
    }
    
    if (!fullWindowWidth || fullWindowWidth==0) fullWindowWidth = this.fullWindowWidth
    if (!fullWindowHeight || fullWindowHeight==0) fullWindowHeight = this.fullWindowHeight
    // self.outerHeight doesn't work in IE6
    
    if (this.getWindowLeft() + fullWindowWidth > this.getScreenWidth())
      self.moveTo(this.getScreenWidth()-fullWindowWidth, 0)
    self.resizeTo(fullWindowWidth, fullWindowHeight)
  },
  
  /**
  * utility functions for hiding browser incompatibility crap
  */
  getWindowLeft: function()
  {
    return (window.screenLeft)?(window.screenLeft):(window.screenX) // screenX is for FF
  },
  getWindowWidth: function()
  {
    return document.body.clientWidth; //self.innerWidth (not in IE6) // document.documentElement.clientWidth?
  },
  getScreenWidth: function()
  {
    return self.screen.width // screen.availWidth?
  }
}

// TEMP
showLinkLoading = function(linkEl, append)
{
  var loadingUiMessage = "<span class='alert'>" + ((append)?" - ":"") + "Loading...</span>"
  if (append) linkEl.innerHTML += loadingUiMessage
  else linkEl.innerHTML = loadingUiMessage
  
  // HACK. this forces Firefox 2 to reload the DOM if user subsequently hits 'back' button; weird, I know.
	//window.location = window.location
}
