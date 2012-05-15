Ext.define("RollingBuddy.view.TimePicker", {
    extend : "Ext.picker.Picker",
    xtype : "timepicker",

    config : {
        hourFrom : 1,
        hourTo : 23,
        minuteScale: 1, 
        hourText: 'Hours',
        minuteText: 'Minutes',
        slotOrder : ["hour", "minute"]
    },

    constructor : function() {

        this.callParent(arguments);

        var hoursFrom = this.config.hourFrom,
            hoursTo = this.config.hourTo,
            hours = [],
            minutes = [],
            ln, tmp, i, j;

        for (i = j = hoursFrom; i <= hoursTo; i++, j++) {
            j = (j+"").length > 1 ? j : "0"+j;
            hours.push({
                text: j,
                value: i
            });
        }

        for (i = j = 0; i <= 59; i = j = i + this.config.minuteScale) {
            j = (j+"").length > 1 ? j : "0"+j;
            minutes.push({
                text: j,
                value: i
            });
        }

        var slots = [];

        for(var k=0; k < this.config.slotOrder.length; k++){
            slots.push(this.createSlot(this.config.slotOrder[k], hours, minutes ));
        }

        //this.config.slots = slots;
        this.setSlots(slots);
    },


    createSlot : function(name, hours, minutes ){
        switch (name) {
            case 'hour':
                return {
                    name: name,
                    align: 'right',
                    data: hours,
                    title: this.config.useTitles ? this.config.hourText : false,
                    flex: 5
                };
            case 'minute':
                return {
                    name: name,
                    align: 'left',
                    data: minutes,
                    title: this.config.useTitles ? this.config.minuteText : false,
                    flex: 5
                };
        }
    }

});