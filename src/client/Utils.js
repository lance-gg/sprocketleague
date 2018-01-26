let Utils = {};

let queryString = null;
Utils.getUrlVars = function() {
    if (!queryString) {
        queryString = {};
        let query = window.location.search.substring(1).toLowerCase();
        let vars = query.split('&');
        for (let i=0; i<vars.length; i++) {
            let pair = vars[i].split('=');
            // If first entry with this name
            if (typeof queryString[pair[0]] === 'undefined') {
                queryString[pair[0]] = pair[1] !== undefined ? pair[1] : true;
                // If second entry with this name
            } else if (typeof queryString[pair[0]] === 'string') {
                let arr = [queryString[pair[0]], pair[1]];
                queryString[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                if (Array.isArray(queryString[pair[0]])) {
                    queryString[pair[0]].push(pair[1]);
                }
            }
        }
    }

    return queryString;
};

Utils.isTouchDevice = function() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

module.exports = Utils;
