/*
 * We store Search model instances locally using localStorage. This makes it easy to have a single Store containing
 * all of the Searches and loading automatically. We use this to populate the list on the left, as well as in helping
 * boot the application up (see the 'first' action in app/controllers/searches.js).
 */
Ext.define('RollingBuddy.store.Routes', {
    extend  : 'Ext.data.Store',
    model   : 'RollingBuddy.model.Route',
    //requires: ['RollingBuddy.model.Route'],

    proxy : {
    	type : "rest",
    	url : "/routes"
    }
});