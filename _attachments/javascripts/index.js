Ext.application({
    name: 'Rolling Buddy',

    launch: function() {


        // main container
        var mainPanel = Ext.create('Ext.Panel', {
            fullscreen : true,
            layout : 'card',
            activeItem : 0,
            diabled : true,

            userAuthenticated : function(data){
                console.log(data.accessToken);
                this.setActiveItem(1); // show tabPanelCard
            },

            // event bindings
            listeners : {

                single : true, 
                scope : mainPanel,
                
                disabledchange : function(d){
                    // initiallize
                    this.getAt(0).fireEvent('authenticateUser');
                }

            }

        });// main container

        var authDelay = 5000; // fake delay for authentication
        mainPanel.on("userauthenticated", mainPanel.userAuthenticated, mainPanel, {single : true, delay : authDelay});




        // query helper 
        //query = new Ext.dom.Query();

        // card displayed when app is started
        var homeCard = new Ext.Panel({

            //hidden : true,

            // config for fb api
            fbConfig : {
                scope : "&scope=offline_access,user_about_me,friends_about_me,user_activities,friends_activities,user_birthday,friends_birthday,user_education_history,friends_education_history,user_events,friends_events,user_groups,friends_groups,user_hometown,friends_hometown,user_interests,friends_interests,user_likes,friends_likes,user_location,friends_location",
                redirectUri : "&redirect_uri=" + document.location.href,
                clientId : "335954993099602", //fb app id
                baseUri : "https://www.facebook.com/dialog/oauth?&response_type=token&client_id="
            },


            //bubbleEvents : ["userauthenticated", "painted"], bubbling not taking place :(

            html : ['<div id="welcome">',
                        '<center>',
                            '<div id="logo">',
                                'Rolling Buddy',
                            '</div>',
                            '<div id="about" class="description">',
                                'Bored of travelling alone?<br><br>Lets get you rolling with your best buddies!',
                            '</div>',
                            '<div id="fbconnect" class="description">',
                                '<a href="#" id="fbconnect-url"><img src="images/spinner_big.gif"><a><br>',
                                '<span id="status-text">Please Wait</span>',
                            '</div>',
                        '</center>',
                    '</div>'].join(''),

            // event binding for home card
            listeners : {

                single : true,

                scope : homeCard,

                userauthenticated : function(data) {
                    // TODO user authenticaed event should be automatically bubbled up to the mainPanel
                    // instead of doing this here..
                    mainPanel.fireEvent('userauthenticated', data);
                },

                authenticateUser : function(homeCard){
                    console.log('homeCard painted');
                    // painted event is triggered twice.. whyy??

                    // get user credentials(access token) from localstorage
                    if(localStorage.getItem("access_token") != null){

                        var accessToken = localStorage.getItem("access_token");
                        this.fireEvent("userauthenticated", {accessToken : accessToken}); // fire event
                        return ;
                    }


                    // try get user credentials from url
                    if(document.location.hash.indexOf("access_token") != -1){

                        var accessToken = document.location.hash.split('&')[0].split('=')[1]
                        localStorage.setItem("access_token", accessToken); // save token
                        this.fireEvent("userauthenticated", {accessToken : accessToken}); // fire event

                    } else {

                        // show fb connect button
                        var fbAuthUrl = this.fbConfig.baseUri + this.fbConfig.clientId + this.fbConfig.redirectUri + this.fbConfig.scope;
                        //query.select("a#fbconnect-url")[0].src = fbAuthUrl;
                        var link = Ext.get('fbconnect-url').set({ href : fbAuthUrl});
                        link.first().set({src : 'images/fb_connect.gif'});

                        Ext.get('status-text').setHtml("Connect With Facebook")
                        link.addListener('click', function(){ // wait on click
                            Ext.get('status-text').setHtml("Connecting with facebook");
                            this.first().set({src : 'images/spinner_big.gif'});
                        });

                    } 

                }

            }// listeners

        }); // home card

        // add homeCard to mainPanel
        mainPanel.add(homeCard);











        // card displayed when user is logged in or is trying
        var tabPanelCard = new Ext.Panel({

            layout: 'card',

            activeItem : 1,

            items: [
                // toolbar docked on top
                {
                    xtype : 'toolbar',
                    //layout : 'hbox',
                    docked: 'top',
                    //title: 'My Toolbar',
                    items : [
                        {
                            xtype: 'searchfield',
                            placeHolder: 'Search...',

                            listeners : {

                                change: function(comp, value){

                                    // center the map to that position
                                    var address = value;

                                    if(address == "")
                                        return false;

                                    codeAddress(address);

                                },

                                keyup: function(field, e) {
                                    var key = e.browserEvent.keyCode;
                                    
                                    // blur field when user presses enter/search which will trigger a change if necessary.
                                    if (key === 13) {
                                        field.blur();
                                    }
                                },

                                scope : this
                            }
                        },

                        {
                            xtype : 'button',
                            iconCls: 'add',
                            iconMask: true,
                            right : 5,
                            ui : 'action',
                            handler : function(button, e){
                                // allow user to select origin of route

                                var origin, destination, originMarker; 

                                var takeEndPoints = function(response) {

                                    // set origin if not set
                                    if(origin == undefined){

                                        origin = response.latLng;

                                        // dirty global function!!!
                                        // place a marker where user click
                                        originMarker = placeMarker(map, response.latLng);
                                        
                                        // listen for desitnation point
                                        google.maps.event.addListenerOnce(map, 'click', takeEndPoints);

                                    } else if(destination == undefined){

                                        // set destination and render the route
                                        destination = response.latLng;

                                        // remove marker
                                        originMarker.setMap(null);

                                        // dirty global function!!!
                                        markRoute(map, origin, destination);

                                    }
                                };

                                // listen to click event on map
                                google.maps.event.addListenerOnce(map, 'click', takeEndPoints);
                            }
                        }
                    ]
                },

                // item 0 user home
                {
                    xtype : 'panel',
                    title : 'Home',
                    iconCls : 'home',
                    html : 'Here the users home screen will be shown',
                    style : ''
                }, // item 0

                // item 1 google map
                {
                    xtype: 'map',
                    title : 'Map',
                    iconCls : 'maps',
                    useCurrentLocation : false,
                    mapOptions : {
                        zoom : 14
                    },

                    // event bindings for map
                    listeners : {

                        maprender : function(extMap, googleMap){

                            // for dev mode only
                            map = googleMap;

                            // check if geolocation is available
                            if(navigator != undefined)
                                navigator.geolocation.getCurrentPosition(success, error);

                            //get map center to user's location
                            function success(position){
                                extMap.setMapCenter({
                                    latitude : position.coords.latitude,
                                    longitude : position.coords.longitude
                                });
                            };

                            // set default center
                            function error(e){                    
                                extMap.setMapCenter({
                                    latitude : 28.632841,
                                    longitude : 77.219617
                                });

                            };


                        } // maprender

                    } // listeners

                }// item 1
            ]

        });// tabpanel card

        // add tabPanelCard to mainPanel
        mainPanel.add(tabPanelCard);





        // init....
        mainPanel.setDisabled(false);

        // only for dev mode
        mp = mainPanel;
        hc = homeCard;
        tpc = tabPanelCard;


        // dirtyyyy...
        // global function
        codeAddress = function(address) {
            var geocoder = new google.maps.Geocoder();



            // get latlng of the search term and center map on it
            geocoder.geocode( { 'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    // dirty programming... 
                    // using global map object
                    // instead a controller should handle the interaction btw map and toolbar
                    map.setCenter(results[0].geometry.location);

                } else {
                    Ext.Msg.alert('Not Found','Geocode was not successful for the following reason: ' + status);
                }
            });
        }; // function

        // dirty...
        // global function
        codeLatLng = function(latlng) {

            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        marker = new google.maps.Marker({
                            position: latlng,
                            map: map
                        });
                        infowindow.setContent(results[1].formatted_address);
                        infowindow.open(map, marker);
                    }
                } else {
                    Ext.Msg.alert('Error',"Geocoder failed due to: " + status);
              }
            });
        };


        // dirty..
        placeMarker = function(map, latlng){
            var marker = new google.maps.Marker({
                map: map,
                position: latlng
                //title : 'hello world'
            });          
            
            return marker;  
        };

        
        // dirty...
        markRoute = function(map, origin, destination){

            var directionsService =  new google.maps.DirectionsService();
            
            var directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                preserveViewport: true,
                draggable: true
            });

            var request = {
                origin : origin,
                destination : destination,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            };

            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    
                    directionsDisplay.setDirections(response);

                } else {

                   Ext.Msg.alert('Error', 'Directions failed: ' + dirStatus);
                }
            });
        }


     
    }
});
