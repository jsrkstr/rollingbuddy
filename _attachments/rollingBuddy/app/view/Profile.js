Ext.define("RollingBuddy.view.Profile", {
	extend : "Ext.Container",
	xtype : "profileview",

	config : {
		//fullscreen : true,
		//layout : "card",
		items : [
			{
				xtype : "toolbar",
				items : [
					{
						xtype : "button",
						iconCls : "maps",
						iconMask : true,
						right : 5
					}
				]
			}
		]
	}
});