/**
 * @class RollingBuddy.view.GoogleMap
 * @extends Ext.Map
 *
 * This shows all of the Searches that the user has saved. It's {@link #defaultType} is searchlistitem.
 *
 * The configured store loads the Search model instances using Search's default proxy (see app/models/Search.js).
 */
Ext.define('RollingBuddy.view.GoogleMap', {
    extend: 'Ext.Map',
    xtype : 'googlemap',

    config: {
        title : 'Map',
        iconCls : 'maps',
        useCurrentLocation : false,
        mapOptions : {
            zoom : 14
        }
    }
});
