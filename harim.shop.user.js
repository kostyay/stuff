// ==UserScript==
// @name        Harim Shop Improvements
// @description Adds Read/Unread to the harim page listing and an ability to make items favorite
// @namespace   http://www.harim.co.il/Yad2/marketprodlist.asp
// @version     0.3
// @updateURL   https://github.com/kostyay/stuff/raw/master/harim.shop.user.js
// @match       http://www.harim.co.il/Yad2/*
// @match       http://www.harim.co.il/yad2/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_log
// @copyright   2014, Kostya Yegorov
// ==/UserScript==


// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

unsafeWindow.hideElements = function() {

    items_table = jQ("#1itembody").closest("table")
    
    // hide the ads
    jQ(jQ("table[name=mainmenu]")[2]).css('display', 'none');

	// expand the tables    
    jQ("td[width=758]").attr("width", "100%")
    main_table = jQ("table[width=894]")
    jQ("td[width=120]").remove()
    
    parents = jQ(".1reg").parents("table")
	for (i = 0; i < parents.length; i++) { jQ(parents[i]).attr("width", "100%"); }    
    
    jQ(main_table).attr("width", "90%")
    
    jQ("#marq").closest("tr").remove()

    //jQ("td[colspan=13]").closest("tr").remove()
    //jQ(jQ("img[alt=099503332]").closest("tr")).remove()
    
	// remove the "edit" column
    //alert("going to hide")
	//jQ(items_table).find("td:nth-child(12)").hide()
    //jQ(items_table).find("td:nth-child(11)").hide()
}

var originalShowHideItem = ShowHideItem
function ShowHideItem_hook(id) {
    key = getKeyName(id);
    view_count = GM_getValue(key, 0);
    GM_setValue(key, view_count + 1);
    markItemRead(itemById(id));
    
    
    originalShowHideItem(id)
}
ShowHideItem = ShowHideItem_hook

function getKeyName(id) {
    return 'bike_' + id;
}

function wasItemRead(id) {
    return GM_getValue(getKeyName(id), 0) > 0;
}

function markItemRead(elem) {
    elem.css('font-weight', 'normal')
}

function markItemUnread(elem) {
    elem.css('font-weight', 'bold')
}

function itemById(id) {
    return jQ(jQ("#TR"+id));
}

function markReadItems() {
    items = jQ("[id^=TR\0-9+]");
    for (i = 0; i < items.length; i++) {
        elem = jQ(items[i]);
        id = elem.attr('id').substring(2);
        
        // add favorites button
        elem.append("<td><input type=\"button\" value=\"F\" onClick=\"javascript:favoriteItem("+id+")\"></td>");
        
        if (wasItemRead(id)) {
            markItemRead(elem);
        } else {
            markItemUnread(elem);
        }
        
        markItemFavorite(id);
    }
}

function markItemFavorite(id) {
    elem = jQ("#TR" + id)
    if (isFavoriteItem(id)) {
    	elem.css('color', 'green');
    	elem.css('font-size', '14px');        
    } else {
    	elem.css('color', 'black');        
        elem.css('font-size', '12px');        
    }
}

function favoriteItem(id) {
    key = 'fav_' + id;
    GM_setValue(key, !isFavoriteItem(id));
    
	markItemFavorite(id);
}

function isFavoriteItem(id) {
    key = 'fav_' + id;
    return GM_getValue(key, false);
}

unsafeWindow.markReadItems = markReadItems;
unsafeWindow.favoriteItem = favoriteItem;

// the guts of this userscript
function main() {
  // Note, jQ replaces $ to avoid conflicts.
  //alert("There are " + jQ('a').length + " links on this page.");
    
    // hide the ads
    hideElements()    
    
    // read items
    markReadItems()
}

// load jQuery and execute the main function
addJQuery(main);