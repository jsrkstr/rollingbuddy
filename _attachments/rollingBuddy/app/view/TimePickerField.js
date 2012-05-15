Ext.define("RollingBuddy.view.TimePickerField", {
	extend : "Ext.field.Text",
	require : "RollingBuddy.view.TimePicker",
	xtype : "timepickerfield",
	config : {
		ui: 'select',
        component: {
            useMask: true
        },
        value : new Date().getHours() + " : " + new Date().getMinutes() // default value
	},

	initialize : function() {
        this.callParent();

        this.getComponent().on({
            scope: this,

            masktap: 'onMaskTap'
        });
	},

	onMaskTap : function() {
        if (this.getDisabled()) {
            return false;
        }
        var picker = Ext.create("RollingBuddy.view.TimePicker", {
        	// TODO - implement start time default value,  also for default value
        });
        
        picker.on({
        	scope : this,
        	change : this.onChange
        });

        picker.show();

        return false;
	},


    onChange : function(picker, values) {
        this.setValue(values.hour + " : " + values.minute);
    }
});