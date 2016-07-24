// ==UserScript==
// @name        Facebook Post Seen Count
// @description Add seen count to facebook group posts
// @namespace   http://www.harim.co.il/Yad2/marketprodlist.asp
// @version     0.1
// @match       https://www.facebook.com/groups/*
// @updateURL   https://github.com/kostyay/stuff/raw/master/facebook.post_seen_count.user.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_log
// @copyright   2016, Kostya Yegorov
// @require http://code.jquery.com/jquery-latest.js
// @require https://greasyfork.org/scripts/19857-node-creation-observer/code/node-creation-observer.js?version=126895
// ==/UserScript==

var DEBUG = false;
function log(s) {
    if (DEBUG && window.console) {
        window.console.log('*FBPostSeenCount* '+s);
    }
}

function itemKey(qid) {
    return 'fb_item_' + qid;
}

function isRelevantElem(elem) {
    if (!elem.attributes || !elem.attributes['data-ft']) {
        return false;
    }
    
    if (!elem.querySelector('.userContentWrapper')) {
        return false;
    }
    
    if (elem.querySelector('.fbViewCount')) {
        return false;
    }
    
    return true;
}

function processViewCount(elem) {
    if (!isRelevantElem(elem)) {
        return false;
    }
    
    var qid = $(elem).data('ft').mf_story_key;
    
    var contentElem = elem.querySelector('.userContent');
    var viewCount = GM_getValue(itemKey(qid), 0);
    GM_setValue(itemKey(qid), viewCount + 1);
    log('QID: ' + qid + ', oldCount=' + viewCount + '; newCount = ' + (viewCount + 1));
    contentElem.insertAdjacentHTML('beforebegin', '<strong class="fbViewCount">View Count: '+viewCount+'</strong>');
}

function hookExisting() {
    var elems = document.querySelectorAll('div.mbm[data-ft]');
    for (i = 0; i < elems.length; i++) {
        processViewCount(elems[i]);
    }
}

// the guts of this userscript
function main() {
  log('== Facebook View Count ==');
  hookExisting();
    
   NodeCreationObserver.onCreation('div.mbm[data-ft]', function (element) {
      processViewCount(element);
  });
}

// load jQuery and execute the main function
$(main);
