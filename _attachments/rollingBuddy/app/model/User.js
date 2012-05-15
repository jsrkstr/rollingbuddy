/*
 * @class Twitter.model.User
 * @extends Ext.data.Model
 * 
 * The Search model uses localStorage to save the user's searches. As each Search consists of a number of Tweets, we
 * set up a hasMany association between this and the Tweet model. Even though the Tweet model uses a different proxy
 * (loading its data from twitter.com instead of localStorage), the hasMany association to Tweet still works. See the
 * 'show' action in app/controllers/search.js to see the assoociation in use.
 */
 
Ext.define('RollingBuddy.model.User', {
    extend: 'Ext.data.Model',

    fields: [
        "accessToken",
        {name : "id", type : "int"},
        "name",
        "first_name",
        "last_name",
        "link",
        "username",
        "birthday",
        "hometown",
        "location",
        "quotes",
        "work",
        "sports",
        "favorite_teams",
        "favorite_athletes",
        "inspirational_people",
        "education",
        "gender",
        "religion",
        "timezone",
        "locale",
        "languages",
        "verified",
        "updated_time",
    ],

    hasMany : { model : "RollingBuddy.model.Route", name : "routes", foreignKey : "user_id" },
    
    proxy: {
        type    : 'rest',
        url     : '/users'
    }
});