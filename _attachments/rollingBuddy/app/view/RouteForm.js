/*
 * @class RollingBuddy.view.SearchBar
 * @extends Ext.Toolbar
 * 
 * Contains the textfield required to perform twitter searchs.
 */
Ext.define('RollingBuddy.view.RouteForm', {
    extend: 'Ext.form.Panel',
    xtype : 'routeform',
    //require : ["RollingBuddy.view.TimePicker"],

    config: {
		// TODO - make this from float over the map

        //height : 100,
        //width : 300,
        //right : 100,
        //top : 100,
        //bottom : 100,
        //modal : true,
        hidden : true,
        items : [
            {
                xtype : "toolbar",
                title : "Source - Destination",
                items : [
                    {
                        xtype : "button",
                        itemId : "confirm",
                        ui : "confirm",
                        text : "Done",
                        right : 5
                        //top : 5
                    },
                    {
                        xtype : "button",
                        itemId : "cancel",
                        ui : "decline",
                        text : "Cancel",
                        left : 5
                    }
                ]
            },
            {
                xtype : "textfield",
                name : "startAddress",
                label : "Source",
                disabled : true  
            },
            {
                xtype : "textfield",
                name : "endAddress",
                label : "Destination",
                disabled : true  
            },
            {
                xtype : "timepickerfield",
                name : "startTime",
                label : "Start Time"
            },
            {   //
                xtype : "datepickerfield",
                name : "startDate",
                label : "Start Date",
                picker : {
                    yearFrom : new Date().getUTCFullYear(),
                    yearTo : new Date().getUTCFullYear()
                },
                value : new Date()
            }
        ]
    }
});