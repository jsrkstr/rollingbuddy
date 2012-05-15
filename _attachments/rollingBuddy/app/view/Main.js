/*
 * @class Twitter.view.Main
 * @extends Ext.Container
 *
 * The viewport is the application's shell - the parts of the UI that don't change. In the Twitter app, we only ever
 * render a single view at a time, so we use a fullscreen card layout here. The other part of the UI is the search list
 * on the left, which we add as a docked item.
 */
Ext.define('RollingBuddy.view.Main', {
    extend: 'Ext.Container',
    xtype : "mainview",

    // requires: [
    //     'RollingBuddy.view.Home',
    //     'RollingBuddy.view.SearchBar',
    //     'RollingBuddy.view.GoogleMap',
    //     'RollingBuddy.view.RouteForm',
    //     "RollingBuddy.view.TimePicker", // should nt be here
    //     "RollingBuddy.view.TimePickerField" // should nt be here
    // ],

    config: {
        fullscreen: true,
        layout: 'card',
        activeItem: 0,
        items: [
            // Home card
            {
                xtype : "homeview"
            },
            // Profile Card
            {
                xtype : "profileview"
            },
            // Map card
            {
                layout: 'vbox',
                items: [
                    {
                        docked: 'top',
                        xtype : 'searchbar'
                    },
                    {
                        xtype: 'googlemap',
                        flex : 1
                    },
                    {
                        // TODO - make this float over the map
                        xtype : "routeform",
                        flex : 1
                    }
                ]
            }
        ]
    }
});