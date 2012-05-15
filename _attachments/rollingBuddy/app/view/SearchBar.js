/*
 * @class RollingBuddy.view.SearchBar
 * @extends Ext.Toolbar
 * 
 * Contains the textfield required to perform twitter searchs.
 */
Ext.define('RollingBuddy.view.SearchBar', {
    extend: 'Ext.Toolbar',
    xtype : 'searchbar',
    requires: ['Ext.field.Text'],

    config: {
        // ui: 'searchbar',
        // layout: 'hbox',

        items: [
            {
                xtype: 'searchfield',
                placeHolder: 'Search...'
            },
            {
                xtype : 'button',
                iconCls: 'add',
                iconMask: true,
                right : 5,
                ui : 'action'
            }
        ]
    }
});
