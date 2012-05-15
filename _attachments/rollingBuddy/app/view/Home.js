Ext.define("RollingBuddy.view.Home", {

	extend : "Ext.Panel",

    xtype : "homeview",

    config : {
        html : ['<div id="welcome">',
                '<center>',
                    '<div id="logo">',
                        'Rolling Buddy',
                    '</div>',
                    '<div id="about" class="description">',
                        'Bored of travelling alone?<br><br>Lets get you rolling with your best buddies!',
                    '</div>',
                    '<div id="fbconnect" class="description">',
                        '<a href="#" id="fbconnect-url"><img src="resources/images/spinner_big.gif"><a><br>',
                        '<span id="status-text">Please Wait</span>',
                    '</div>',
                '</center>',
            '</div>'].join('')
    }
});