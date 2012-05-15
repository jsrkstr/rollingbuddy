/*
 * @class Twitter.controller.Search
 * @extends Ext.app.Controller
 * 
 * This controller is the main, and only controller for this application. It handles all the views and functionality 
 * of this application.
 */


Ext.define('RollingBuddy.controller.X', {

    extend : "Ext.app.Controller",

    // config: {
    //     profile: Ext.os.deviceType.toLowerCase()
    // },

    models : ["Route", "User"],

    stores : ["Routes"],

    views : [
        "Main",
        "Home",
        "Profile",
        "RouteForm",
        "SearchBar",
        "GoogleMap",
        "TimePicker",
        "TimePickerField"
    ],

    refs : [
        {
            // mainview rendered when its referenced
            ref         : 'main',
            selector    : 'mainview',
            xtype       : 'mainview',
            autoCreate  : true
        },
        {
            ref         : "map",
            selector    : "googlemap"
        },
        {
            ref         : "routeForm",
            selector    : "routeform"
        },
        {
            ref         : "home",
            selector    : "homeview"
        }
    ],

    // config for fb api
    fbConfig : {
        scope : "&scope=offline_access,user_about_me,friends_about_me,user_activities,friends_activities,user_birthday,friends_birthday,user_education_history,friends_education_history,user_events,friends_events,user_groups,friends_groups,user_hometown,friends_hometown,user_interests,friends_interests,user_likes,friends_likes,user_location,friends_location",
        redirectUri : "&redirect_uri=" + document.location.href,
        clientId : "335954993099602", //fb app id
        baseUri : "https://www.facebook.com/dialog/oauth?&response_type=token&client_id="
    },


    // this.user
    // this.routes

    init : function() {
        console.log('controller initailized');

        var mainView = this.getMain();

        this.control({

            "searchbar searchfield" : {
                change : this.onLocationSearch,
                keyup: this.onSearchFieldKeyUp
            },

            "searchbar button" : {
                tap : this.onAddRouteTapped
            },

            "profileview toolbar button" : {
                tap : this.onMapButtonTap
            }

        });


        this.getMap().on({

            scope : this,

            maprender : function(extmap, googlemap){
                // center map over user's location
                this.setInitialMapCenter(extmap);

                // mark user routes on map
                var map = this.getMap().getMap();
                for(var i=0; i < this.routes.length; i++){
                    GoogleMap.getRouteFromJson(this.routes[i].getData(), function(directionsResult){
                        GoogleMap.markRoute(map, directionsResult);
                    });               
                }
            } 
            
        });

        // var myStore = this.getRoutesStore();

        this.authenticateUser();

    }, // init


    setInitialMapCenter : function(map) {

        var extMap = map;

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

        // set default center ( delhi )
        function error(e){                    
            extMap.setMapCenter({
                latitude : 28.632841,
                longitude : 77.219617
            });

        };  
    },


    onMapButtonTap : function() {
        this.getMain().setActiveItem(2);
    },


    onLocationSearch : function(component, value){
        // center the map to that position
        var address = value;
        if(address == "")
            return false;
        var googleMap = this.getMap().getMap();

        // get latlng of the search term and center map on it
        GoogleMap.codeAddress(address, function(results, status){
            if (status == google.maps.GeocoderStatus.OK) {
                GoogleMap.changeMapCenter(googleMap, results[0].geometry.location);
            } else {
                Ext.Msg.alert('Not Found','Geocode was not successful for the following reason: ' + status);
            }
        });
    },


    onSearchFieldKeyUp : function(field, e) {
        var key = e.browserEvent.keyCode;
        // blur field when user presses enter/search which will trigger a change if necessary.
        if (key === 13) {
            field.blur();
        }
    },


    onAddRouteTapped : function() {
        var googleMap = this.getMap().getMap();
        // TODO : find a replacement for jquery proxy
        // listen to click event on map
        google.maps.event.addListenerOnce(googleMap, 'click', $.proxy(this.onRouteSourceMarked, this));
        // TODO : show msg to user
    },


    /**
     * @param {Object} response The response containing latlng object
     */
    onRouteSourceMarked : function(response) {
        var googleMap = this.getMap().getMap();

        // store origin at a temp location
        this.tmp = {
            source : response.latLng
        };

        // place a marker at source
        this.tmp.sourceMarker = GoogleMap.placeMarker(googleMap, response.latLng);

        // listen for distination
        google.maps.event.addListenerOnce(googleMap, 'click', $.proxy(this.onRouteDestinationMarked, this));  
        // TODO : show msg to user
    },


    onRouteDestinationMarked : function(response) {
        // store destination at a temp location
        this.tmp['destination'] = response.latLng;

        // remove source marker
        this.tmp.sourceMarker.setMap(null);

        GoogleMap.getRoute(this.tmp.source, this.tmp.destination, $.proxy(function(response, status) {

                if (status != google.maps.DirectionsStatus.OK) {
                    Ext.Msg.alert('Error', 'Directions failed: ' + status);
                    return ;
                }

                var googleMap = this.getMap().getMap();
                var directionsResult = response;

                // mark route on map
                var directionsDisplay = GoogleMap.markRoute(googleMap, directionsResult); 

                // center the map on the route
                GoogleMap.changeMapCenter(googleMap, directionsResult.routes[0].legs[0].start_location);

                var model = this.createRouteModel(directionsResult);
                this.editRoute(model, true);// show and fill the edit form

                var listener = google.maps.event.addListener;
                // listen for changes in routes when user drags
                listener(directionsDisplay, 'directions_changed', $.proxy(onWayPointAdded, this));

                function onWayPointAdded(){
                    //computeTotalDistance(directionsDisplay.directions);
                    var directionsResult = directionsDisplay.getDirections();
                    var model = this.createRouteModel(directionsResult);
                    this.editRoute(model, true);
                }

            }, this)
        );
    },


    createRouteModel : function(directionsResult) {
        var directionsResultJson = GoogleMap.getJson(directionsResult);
        var uuid = this.user.get('id');

        var model = Ext.create("RollingBuddy.model.Route", {
            user_id        : uuid,
            start          : directionsResultJson.start,
            end            : directionsResultJson.end,
            startAddress   : directionsResult.routes[0].legs[0].start_address,
            endAddress     : directionsResult.routes[0].legs[0].end_address,
            createdAt      : new Date(),
            //startTime : Date.now(), // get from route form
            // startDate
            waypoints      : directionsResultJson.waypoints,
            distance       : directionsResult.routes[0].legs[0].distance,
            duration       : directionsResult.routes[0].legs[0].duration
        });  

        return model;
    },


    //  directions - directions result object
    // isNew : boolean 
    editRoute : function(model, isNew) {
        var routeModel = model;

        // fill and show route form
        var form = this.getRouteForm();
        form.setRecord(model);

        var title = isNew ? "New Route" : "Edit Route";
        form.getAt(0).setTitle(title); // change toolbar title

        form.show();

        // bind events on confirm button
        form.query("#confirm")[0].on({
            single : true,
            tap : function() {

                var values = form.getValues();

                routeModel.set({
                    startTime : values.startTime,
                    startDate : values.startDate
                });

                this.routes = this.routes || [];
                this.routes.push(routeModel);
                routeModel.save();

                form.hide(); // hide the form
            }
        });

        // bind events on cancel button
        form.query("#cancel")[0].on({
            single : true,
            tap : function() {
                form.hide();
                // TODO - remove the marked route on the map
            }
        });
    },


    authenticateUser : function(){

        console.log('authentcation');

        // get user credentials(access token) from localstorage
        if(localStorage.getItem("access_token") != null){

            var accessToken = localStorage.getItem("access_token");
            this.onUserAuthenticated(accessToken);
            return ;
        }


        // try get user credentials from url
        if(document.location.hash.indexOf("access_token") != -1){

            var accessToken = document.location.hash.split('&')[0].split('=')[1]
            localStorage.setItem("access_token", accessToken); // save token
            this.onUserAuthenticated(accessToken, true);

        } else {

            // show fb connect button
            var fbAuthUrl = this.fbConfig.baseUri + this.fbConfig.clientId + this.fbConfig.redirectUri + this.fbConfig.scope;

            var link = Ext.get('fbconnect-url').set({ href : fbAuthUrl});
            link.first().set({src : 'resources/images/fb_connect.gif'});

            Ext.get('status-text').setHtml("Connect With Facebook")
            link.addListener('click', function(){ // wait on click
                Ext.get('status-text').setHtml("Connecting with facebook");
                this.first().set({src : 'resources/images/spinner_big.gif'});
            });
        } 

    },


    onUserAuthenticated : function(accessToken, isNew) {
        console.log('userAuthenticated');

        if(isNew){
            this.createNewUser(accessToken);
        } else {            
            //get the current User model from cloud
            var user = Ext.ModelManager.getModel('RollingBuddy.model.User');
            var userId = localStorage.getItem("user_id");

            user.load(userId, {
                scope : this,
                success: this.setCurrentUser
            });
        }
    },


    createNewUser : function(accessToken) {
        var accessToken = accessToken;

        // get user's profile from fb
        var url = "https://graph.facebook.com/me?access_token=" + accessToken;
        $.ajax({
            url : url,
            dataType : "jsonp",
            context : this,
            success : success
        });

        function success(response) {

            // add more properties
            response.accessToken = accessToken;

            var userModel = Ext.create("RollingBuddy.model.User", response);
            userModel.save();

            // save user's id in localstore
            localStorage.setItem("user_id", response.id);
            localStorage.setItem("access_token", accessToken);

            this.setCurrentUser(userModel);
        }
    },


    // accepts : user model
    setCurrentUser : function(userModel) {
        this.user = userModel; // set user valiable for other functions to use
        this.loadUserRoutes(userModel.get('id'));
        this.onUserReady(userModel);
    },


    // called when whole auth process is completed
    onUserReady : function(userModel) {
        model = userModel;
        this.getMain().setActiveItem(1); // show profile card
        this.getMain().getAt(1).setHtml("howdy, " + userModel.get("first_name"));
    },


    loadUserRoutes : function(userId) {
        //  TODO - find a way to do this using stores and proxies

        $.ajax({
            url : "/routes/_design/routes/_view/by_user?key=" + userId,
            dataType : "json",
            success : parseResponse,
            context : this
        });

        function parseResponse(response){
            if(!response.rows || response.rows.length == 0)
                return ;
            
            this.routes = []; // new property to hold all user routes

            for(var i = 0; i < response.rows.length; i++) {
                var routeJson = response.rows[i].value;
                var routeModel = Ext.create("RollingBuddy.model.Route", routeJson);
                this.routes.push(routeModel); // add to store
            }
        }

    }



});







// Google map utils
var GoogleMap = {
    
    // accepts : geocoder service results, status
    changeMapCenter : function(map, location) {
        map.setCenter(location);
    },

    // accepts : address(string), callback function
    // returns results(array), status
    codeAddress : function(address, callback) {
        var geocoder = new google.maps.Geocoder();
        // get latlng of the search term and center map on it
        geocoder.geocode( { 'address': address}, callback);
    },


    placeMarker : function(map, latlng) {
        var marker = new google.maps.Marker({
            map: map,
            position: latlng
            //title : 'hello world'
        });          
        return marker;  
    },


    getRoute : function(origin, destination, callback){
        var directionsService =  new google.maps.DirectionsService();

        var request = {
            origin : origin,
            destination : destination,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(request, callback);
    },


    // accepts : response of google direstions result object
    markRoute : function(map, directionsResult) {
       
        var directionsDisplay = new google.maps.DirectionsRenderer({
            map: map,
            preserveViewport: true,
            draggable: true
        }); 
        directionsDisplay.setDirections(directionsResult);

        return directionsDisplay;
    },


    // accepts directionsResultJson {start : [], end : [], waypoints : []}
    // returns "DirectionsResult" object in callback
    getRouteFromJson : function(directionsResultJson, callback) {
        var directionsService = new google.maps.DirectionsService();
        var data = directionsResultJson;
        var wp = [];

        for(var i=0;i<data.waypoints.length;i++){
            wp[i] = {
                'location': new google.maps.LatLng(data.waypoints[i][0], data.waypoints[i][1]),
                'stopover':false 
            };
        }
            
        directionsService.route({
            'origin' : new google.maps.LatLng(data.start[0], data.start[1]),
            'destination' : new google.maps.LatLng(data.end[0], data.end[1]),
            'waypoints': wp,
            'travelMode': google.maps.DirectionsTravelMode.DRIVING
            },
            callback
        );
    },


    // converts directionsResult object into json
    // data = {start : [], end : [], waypoints : []}
    getJson : function(directionsResult) {
        var w=[],wp,data={};
        var rleg = directionsResult.routes[0].legs[0];
        data.start = [rleg.start_location.lat(), rleg.start_location.lng()];
        data.end = [rleg.end_location.lat(), rleg.end_location.lng()];
        var wp = rleg.via_waypoints; 
        for(var i=0; i < wp.length; i++){
            w[i] = [ wp[i].lat(), wp[i].lng() ];
        }
        data.waypoints = w;
        return data;
    }

}