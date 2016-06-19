// ==UserScript==
// @name        Harim Shop Improvements
// @description Adds Read/Unread to the harim page listing and an ability to make items favorite
// @namespace   http://www.harim.co.il/Yad2/marketprodlist.asp
// @version     0.4
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
    //ad_rows

    items_table = jQ("#1itembody").closest("table");

    // hide the ads
    jQ(jQ("table[name=mainmenu]")[2]).css('display', 'none');

	// expand the tables
    jQ("td[width=758]").attr("width", "100%");
    main_table = jQ("table[width=894]");
    jQ("td[width=120]").remove();

    parents = jQ(".1reg").parents("table");
	for (i = 0; i < parents.length; i++) { jQ(parents[i]).attr("width", "100%"); }

    jQ(main_table).attr("width", "90%");
    jQ(main_table).attr("id", "main_table_element");

    jQ("#marq").closest("tr").remove();
};

var originalShowHideItem = ShowHideItem;
function ShowHideItem_hook(id) {
    readItem(id);

    originalShowHideItem(id);
}

ShowHideItem = ShowHideItem_hook;

function readItem(id) {
    key = getKeyName(id);
    view_count = GM_getValue(key, 0);
    GM_setValue(key, view_count + 1);

    GM_log('Setting ' + id + ' count to ' + GM_getValue(key, 0));
    markItemReadStyle(itemById(id));
}

function getKeyName(id) {
    return 'bike_' + id;
}

function wasItemRead(id) {
    key = getKeyName(id);
    GM_log('Viewcount for ' + id + ' is ' + GM_getValue(key, 0));
    return GM_getValue(key, 0) > 0;
}

function markItemReadStyle(elem) {
    elem.css('font-weight', 'normal');
}

function markItemUnread(elem) {
    elem.css('font-weight', 'bold');
}

function itemById(id) {
    return jQ(jQ("#TR"+id));
}

function markReadItems() {

    // add mark all read button
    jQ("#main_table_element").prepend("<input type=\"button\" value=\"Mark all read\" onClick=\"javascript:markAllRead()\">");

    items = jQ("[id^=TR]");
    for (i = 0; i < items.length; i++) {
        elem = jQ(items[i]);
        id = elem.attr('id').substring(2);

        has_image = jQ("img[src='/yad2/yad2_camera.gif']", elem);
        if (has_image.length !== 0) {
            elem.append('<td style="text-align: center"><img src="/yad2/GetResizeImage.asp?ID='+id+'"></td>');
        } else {
            elem.append('<td></td>');
        }

        // add favorites button
        elem.append("<td><input type=\"button\" value=\"F\" onClick=\"javascript:favoriteItem("+id+")\"></td>");

        if (wasItemRead(id)) {
            markItemReadStyle(elem);
        } else {
            markItemUnread(elem);
        }

        markItemFavorite(id);
    }
}

function markAllRead() {
    items = jQ("[id^=TR\0-9+]");
    for (i = 0; i < items.length; i++) {
        elem = jQ(items[i]);
        readItem(elem.attr('id').substring(2));
    }
}

function markItemFavorite(id) {
    elem = jQ("#TR" + id);
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
unsafeWindow.markAllRead = markAllRead;

// the guts of this userscript
function main() {
  // Note, jQ replaces $ to avoid conflicts.
  //alert("There are " + jQ('a').length + " links on this page.");

    // hide the ads
    hideElements();

    // read items
    markReadItems();
}

// load jQuery and execute the main function
addJQuery(main);
