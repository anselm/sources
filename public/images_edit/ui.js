/**
* CSS-based tab switcher.
* 
* This code makes a few assumptions:
* - there are the same number of tabs as tabbedContent blocks, and they are in the same order
* - tab elements alike belong to no classes by default
* - the selected state class is 'sel'
*
* sample arguments to set one up:
*   TabEventHandler.initTabSet("ul#tabs li", "div#tabbedContent div")
* probably should do this in the HTML right after the necessary classes are defined,
* although the event handlers won't actually be registered until onload.
*/

var processing = false // experimenting with global var here

var TabEventHandler = 
{
  /**
  * register event handlers for tabs & select one of them.
  * useHrefs is a boolean: if true, we don't switch the content pane, we just follow the link
  * (normally useHrefs is true and the links are just "#")
  */
  initTabSet: function(tabsCssQuery, tabbedContentCssQuery, selectIndex, useHrefs)
  {
    var tabEls = cssQuery(tabsCssQuery)
    var tabbedContentEls = cssQuery(tabbedContentCssQuery)
    
    Behavior.register(
      tabsCssQuery,
      function(element) {
        // note that the 'this' here refers to the element acted upon. pass it in as a param for clarity's sake
        element.onclick = function()
        {
          if (!useHrefs)
          {
            TabEventHandler.click(tabEls, tabbedContentEls, this)
            return false
          }
          else return !TabEventHandler.tabIsSelected(this)
        }
      })
      
    // and select the requested tab
    if (!selectIndex) selectIndex = 0
    TabEventHandler.toggleTabSelection(tabEls[selectIndex], tabbedContentEls[selectIndex], true)
    
    Behavior.apply() // force application before page load. we can't wait!!!
  },
  
  /**
  * event handler
  */
  click: function(tabEls, tabbedContentEls, thisTabEl)
  {
    for (i in tabEls) TabEventHandler.toggleTabSelection(tabEls[i], tabbedContentEls[i], (tabEls[i]==thisTabEl))
  },
  
  /**
  * Internal CSS workings. factored out so initTabSet can call it, too.
  */
  toggleTabSelection: function(tabEl, tabbedContentEl, on)
  {
    // NOTE: assumes tab has no other class
    tabEl.className = (on)?"sel":""
    
    // on story overview page, we have tabs without corresponding tabbedContentEls (tabs used as links)
    if (tabbedContentEl)
    {
      if (on) tabbedContentEl.className += " sel"
      else tabbedContentEl.className = tabbedContentEl.className.replace(/[ ]?sel/g, "")
    }
  },
  tabIsSelected: function(tabEl)
  {
    return (tabEl.className=="sel")
  }
}


/**
* Event handler for nice star buttons on review form
*/

var StarEventHandler =
{
  /**
  * register event handlers for stars
  */
  init: function(baseCssQuery, formInput, selectIndex, footnoteMessages, dontCalculateAverageRating)
  {
    /* we're now letting the JS know more about the DOM. */
    var starsCssQuery = baseCssQuery + " div.starselect span"
    var clearCssQuery = baseCssQuery + " a.clear"
    var footnoteCssQuery = baseCssQuery + " div.starFootnote"
    
    var starEls = cssQuery(starsCssQuery)
    var footnoteEls = cssQuery(footnoteCssQuery)

    Behavior.register(
      starsCssQuery,
      function(element) {
        element.onmouseover = function() { StarEventHandler.mouseover(starEls, this, footnoteMessages, footnoteEls[0]); return false }
        element.onmouseout = function() { StarEventHandler.mouseout(starEls, formInput, footnoteEls[0]); return false }
        element.onclick = function() { StarEventHandler.click(starEls, this, formInput, dontCalculateAverageRating); return false }
      })
    
    Behavior.register(
      clearCssQuery,
      function(element) {
        element.onclick = function() { StarEventHandler.clear(starEls, formInput, dontCalculateAverageRating); return false }
      })
    
    StarEventHandler.selectStars(starEls, formInput, selectIndex)
    
    Behavior.apply() // force application before page load. we can't wait!!!
  },
  
  /**
  * event handlers
  */
  mouseover: function(starEls, thisStarEl, footnoteMessages, footNoteEl)
  {
    var selectedIndex = 0
    while (starEls[selectedIndex] != thisStarEl) selectedIndex++
    var stopSelecting = false
    for (i in starEls)
    {
      StarEventHandler.toggleSelection(starEls[i], !stopSelecting)
      if (i == selectedIndex) stopSelecting = true
    }
    footNoteEl.innerHTML = footnoteMessages[selectedIndex];
  },
  mouseout: function(starEls, formInput, footNoteEl)
  {
    StarEventHandler.selectStars(starEls, formInput, formInput.value)
    footNoteEl.innerHTML = "";
  },
  click: function(starEls, thisStarEl, formInput, dontCalculateAverageRating)
  {
    var selectedIndex = 0
    while (starEls[selectedIndex] != thisStarEl) selectedIndex++
    formInput.value = selectedIndex + 1
    if (!dontCalculateAverageRating) StarEventHandler.calculateAverageRating()
  },
  
  clear: function(starEls, formInput, dontCalculateAverageRating)
  {
    StarEventHandler.selectStars(starEls, formInput, 0)
    if (!dontCalculateAverageRating) StarEventHandler.calculateAverageRating()
  },
  selectStars: function(starEls, formInput, selectIndex)
  {
    // set the form input value if necessary--this might be redundant in cases
    formInput.value = (selectIndex!=0)?selectIndex:""
    // in case this is the initial set, we might see the "n" (for "n/a"), too--don't display it!
    if (selectIndex=="n") selectIndex = 0
    for (i in starEls) StarEventHandler.toggleSelection(starEls[i], (i<selectIndex))
  },
  toggleSelection: function(starEl, on)
  {
    // NOTE: assumes tab has no other class
    starEl.className = (on)?"sel":""
  },
  /**
  * kind of a freaky function: digs through all the <input>s and applies data directly to DOM
  */
  calculateAverageRating: function()
  {
    var numRatings = 0
    var sumRatings = 0
    var averageRating = 0
    var formInputEls = cssQuery("input.starValueAvg")
    var answerDesc = 'answers'
    for (i in formInputEls)
    {
      if (formInputEls[i].value != "") // need to check for empty strings, too?
      {
        numRatings++
        sumRatings += parseInt(formInputEls[i].value)
      }
    }
    if (sumRatings>0) averageRating = sumRatings / numRatings
    if (numRatings == 1) answerDesc = 'answer'
    document.getElementById("averageRating").innerHTML = averageRating.toFixed(1)
    document.getElementById("numRatings").innerHTML = numRatings + ' ' + answerDesc
    // and the image
    var averageRatingPointFives = Math.round(averageRating*2) / 2
    var averageStarsImgFilename = "/Images/newstrust/stars/red-small/stars-" + averageRatingPointFives.toFixed(1).replace(/\./, '-') + ".gif"
    document.getElementById("averageStarsImg").src = averageStarsImgFilename
  }
}

/**
* Event handler for 'Rate this Review' bullets
*/
var BulletEventHandler =
{
  /**
  * register event handlers for stars
  */
  init: function(bulletCssQuery, selectIndex, submitBaseUrl)
  {
    var bulletEls = cssQuery(bulletCssQuery)
    if (selectIndex=="none") selectIndex = 0
    
    Behavior.register(
      bulletCssQuery,
      function(element) {
        element.onmouseover = function() { BulletEventHandler.mouseover(bulletEls, this); return false }
        element.onmouseout = function() { BulletEventHandler.mouseout(bulletEls, selectIndex); return false }
        element.onclick = function() { BulletEventHandler.click(bulletEls, submitBaseUrl, this); return false }
      })
    
    BulletEventHandler.selectBullets(bulletEls, selectIndex)
    
    Behavior.apply() // force application before page load. we can't wait!!!
  },
  
  /**
  * event handlers
  */
  mouseover: function(starEls, thisStarEl)
  {
    selectedIndex = 0
    while (starEls[selectedIndex] != thisStarEl) selectedIndex++
    BulletEventHandler.selectBullets(starEls, selectedIndex+1)
  },
  mouseout: function(starEls, selectIndex)
  {
    if (!processing) BulletEventHandler.selectBullets(starEls, selectIndex)
  },
  click: function(starEls, submitBaseUrl, thisStarEl)
  {
    selectedIndex = 0
    while (starEls[selectedIndex] != thisStarEl) selectedIndex++
    // submit form for processing! and some seriously janky UI updates for the user.
    thisStarEl.parentNode.parentNode.innerHTML += '<span class="alert">Submitting rating...</span>'
    processing = true
    document.location = submitBaseUrl + (selectedIndex+1)
  },
  
  selectBullets: function(starEls, selectIndex)
  {
    for (i in starEls) StarEventHandler.toggleSelection(starEls[i], (i<selectIndex))
  },
  toggleSelection: function(starEl, on)
  {
    // NOTE: assumes tab has no other class
    starEl.className = (on)?"sel":""
  }
}


/**
* For the disclosure triangles on the review form
*/
var PaneEventHandler =
{
  /**
  * register event handlers for stars
  */
  init: function(headerCssQuery, wholePanelCssQuery, on)
  {
    // TODO: should check to see if these queries worked out...
    var headerEls = cssQuery(headerCssQuery)
    var wholePanelEls = cssQuery(wholePanelCssQuery)
    
    Behavior.register(
      headerCssQuery,
      function(element) {
        element.onclick = function() { PaneEventHandler.click(headerEls[0], wholePanelEls[0]); return false }
      })
    
    PaneEventHandler.toggleSelection(headerEls[0], wholePanelEls[0], on)
    
    Behavior.apply() // force application before page load. we can't wait!!!
  },

  /**
  * event handler
  */
  click: function(headerEl, wholePanelEl)
  {
    PaneEventHandler.toggleSelection(headerEl, wholePanelEl, !PaneEventHandler.isSelected(wholePanelEl))
  },

  /**
  * Internal CSS workings. little janky how we deduce selection state from the DOM but ehhh.
  */
  toggleSelection: function(headerEl, wholePanelEl, on)
  {
    if (on) wholePanelEl.className += " sel"
    else wholePanelEl.className = wholePanelEl.className.replace(/[ ]?sel/g, "")
  },
  isSelected: function(wholePanelEl)
  {
    return (wholePanelEl.className.match(/[ ]?sel/) != null)
  }
}

/**
* For the disclosure triangles on the review form
*/
var MoreContentEventHandler =
{
  init: function(moreLinkCssQuery, lessLinkCssQuery, wholePanelCssQuery, on)
  {
    // TODO: should check to see if these queries worked out...
    var wholePanelEls = cssQuery(wholePanelCssQuery)
    
    Behavior.register(
      moreLinkCssQuery,
      function(element) {
        element.onclick = function() { MoreContentEventHandler.click(wholePanelEls[0], true); return false }
      })
    
    Behavior.register(
      lessLinkCssQuery,
      function(element) {
        element.onclick = function() { MoreContentEventHandler.click(wholePanelEls[0], false); return false }
      })
    
    MoreContentEventHandler.toggleSelection(wholePanelEls[0], on)
    
    Behavior.apply() // force application before page load. we can't wait!!!
  },
  click: function(wholePanelEl, on)
  {
    MoreContentEventHandler.toggleSelection(wholePanelEl, on)
  },
  toggleSelection: function(wholePanelEl, on)
  {
    var selectedClass = " show"
    if (on) wholePanelEl.className += selectedClass
    else wholePanelEl.className = wholePanelEl.className.replace(selectedClass, "")
  },
  isSelected: function(wholePanelEl)
  {
    return (wholePanelEl.className.match("show"))
  }
}

/**
* For just URL field on the submit form (for now)...
*/
var TextPromptEventHandler =
{
  init: function(inputCssQuery, promptText)
  {
    // TODO: should check to see if these queries worked out...
    var inputEls = cssQuery(inputCssQuery)
    
    Behavior.register(
      inputEls,
      function(element) {
        element.onfocus = function() { TextPromptEventHandler.togglePrompt(inputEls[0], false, promptText); return false }
        element.onblur = function() { TextPromptEventHandler.togglePrompt(inputEls[0], true, promptText); return false }
      })
    
    TextPromptEventHandler.togglePrompt(inputEls[0], true, promptText)
    
    Behavior.apply() // force application before page load. we can't wait!!!
  },
  
  togglePrompt: function(el, on, promptText)
	{
		if (on && el.value == "")
		{
			el.value = promptText
			el.className = "prompt"
		}
		else if (!on && el.value == promptText)
		{
			el.value = ""
			el.className = ""
		}
	}
}


/**
* lookup publication names via AJAX
* Note that this event handler is built not as faux-class Object (like the others),
* but as a class with prototype function definitions. This is the correct way to do this.
* Also, we're not using modified behavior here, because FireFox doesn't recognize window.event
* so event handlers MUST be assigned in the HTML.
*/
TypeAheadEventHandler = function(inputId, foundMatchInputId, outputId, moreInfoFormId,
  publicationFieldPrefix, repressUnlistedPublicationField)
{
  this.selectedIndex = 0
  
  this.inputEl = document.getElementById(inputId)
	this.outputEl = document.getElementById(outputId)
	this.outputHackMaskEl = document.getElementById(outputId + "ie6hackmask") // grr ie6 only
	this.foundMatchInputEl = document.getElementById(foundMatchInputId)
	this.showMoreInfoForm = (repressUnlistedPublicationField != "1")
	this.publicationFieldPrefix = publicationFieldPrefix
	this.moreInfoFormEl = document.getElementById(moreInfoFormId)
}
TypeAheadEventHandler.prototype.keydown = function(e)
{
  var returnVal = false
  var keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode // ?
  switch (keyCode)
  {
    case 9: // tab
      returnVal = true
      // NOTE: don't break--treat just like enter
    case 13: // enter
    case 3:
      var selectedLinkEl = this.getSelectedLink()
      if (selectedLinkEl) this.select(selectedLinkEl)
      //else this.blur()
      break
    case 27: // escape
      this.blur()
      break
    case 38: // up
      if (this.selectedIndex>1) this.selectedIndex--
      this.hover(this.getSelectedLink())
      break
    case 40: // down
      if (this.selectedIndex<this.getNumOptions()) this.selectedIndex++
      this.hover(this.getSelectedLink())
      break
    default:
      this.lookup()
      returnVal = true
  }
  return returnVal
}
TypeAheadEventHandler.prototype.lookup = function()
{
  this.selectedIndex = 1 // reset. first option will be preselected if there is one (see logic below if none are avail)
  var thisHandler = this
  setTimeout(function() // can't remember why this has to be a timeout!
    {
      // TODO: limit by timing?
    	if (thisHandler.inputEl.value.length) // need min 1 letter!
    	{
    	  thisHandler.setFoundMatch(false)
    		thisHandler.toggleMenuVisibility(true)
        loadXMLDoc("/ajaxLookupPubName!q="+thisHandler.inputEl.value+"&prefix="+thisHandler.publicationFieldPrefix,
          thisHandler.outputEl.id)
    	}
    	else thisHandler.toggleMenuVisibility(false)
    }, 1)
}
TypeAheadEventHandler.prototype.blur = function()
{
  var thisHandler = this
  // timeout gives a chance for select() to be called if the user did in fact select something
  setTimeout(function()
    {
      // if nothing has been selected (user has tabbed out and wants to enter unlisted source)
      if (!thisHandler.getFoundMatch())
      {
        thisHandler.toggleMenuVisibility(false)
        thisHandler.toggleMoreInfoFormVisibility(true)
      }
    }, 200)
  return true
}
TypeAheadEventHandler.prototype.focus = function()
{
	//this.lookup() // do something?
	return false
}
TypeAheadEventHandler.prototype.hover = function(selectLinkEl)
{
  var linkEls = this.outputEl.getElementsByTagName('li')
  for (var i=0; i<linkEls.length; i++)
  {
    if (!linkEls[i].className.match(/noMatches/)) // important: can't select the 'no available options' option!
    {
      linkEls[i].className = (linkEls[i]==selectLinkEl)?"sel":""
    }
  }
}
TypeAheadEventHandler.prototype.select = function(linkEl)
{
  if (!linkEl.className.match(/noMatches/) && // I don't think we need to do this check anymore... see hover()
    (this.outputEl.style.display == "block")) // a little corny, but don't do selection if menu is hidden!
  {
    this.inputEl.value = linkEl.getAttribute("pubname")
  	this.toggleMenuVisibility(false)
  	this.setFoundMatch(true)
  	this.toggleMoreInfoFormVisibility(false) // just in case.
  }
  else this.blur()
	return false
}
TypeAheadEventHandler.prototype.getSelectedLink = function()
{
  var options = this.outputEl.getElementsByTagName('li')
  return options[this.selectedIndex-1]
}
TypeAheadEventHandler.prototype.getNumOptions = function()
{
  var options = this.outputEl.getElementsByTagName('li')
  return (options) ? (options[options.length-1].className != "noMatches" ? options.length : options.length-1) : 0
}
TypeAheadEventHandler.prototype.toggleMenuVisibility = function(show)
{
	this.outputEl.style.display = (show)?"block":"none"
	// and evil IE6 hack.
	if (navigator.userAgent.match(/MSIE 6/)) this.outputHackMaskEl.style.display = (show)?"block":"none"
}
TypeAheadEventHandler.prototype.toggleMoreInfoFormVisibility = function(show)
{
  if (this.showMoreInfoForm) this.moreInfoFormEl.style.display = (show)?"block":"none"
}
TypeAheadEventHandler.prototype.setFoundMatch = function(foundMatch)
{
  this.foundMatchInputEl.value = (foundMatch)?"1":""
}
TypeAheadEventHandler.prototype.getFoundMatch = function()
{
  return (this.foundMatchInputEl.value == "1")
}


/**
* 
*/
var TabBarEventHandler =
{
  locationToTabIndexMap:
  {
    ".f0c0ecc": 0,
    ".efb6ba8": 1,
    ".efb6bb7": 2,
    ".efb6bb9": 3,
    ".efb6bbb": 4,
    ".efb6bbd": 5,
    ".efe385b": 6,
    ".efe385c": 7,
    ".eed9be7": 8
  },
  
  /**
  * called from top of every page.
  * if we recognize location from above table, select tab. otherwise, do nothing.
  */
  select: function(tabsCssQuery, locaction)
  {
    var tabIndex = this.locationToTabIndexMap[locaction]
    if (tabIndex != undefined)
    {
      var tabBarEls = cssQuery(tabsCssQuery)
      tabBarEls[tabIndex].className = "sel"
    }
  }
}
