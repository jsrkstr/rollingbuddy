/**
 * @class RollingBuddy.model.Route
 * @extends Ext.data.Model
 * 
 * The Tweet model uses a custom Twitter proxy (defined in lib/TwitterProxy.js as it is not part of a particular app).
 * The Twitter application doesn't use this model directly very much, relying instead on the hasMany association with
 * the Search model to load the Tweets for a given Search.
 * 
 */
Ext.define('RollingBuddy.model.Route', {
    extend: 'Ext.data.Model',

    fields: [
        "id",
        { name : "user_id", type : "int"},
        "start",
        "end",
        "waypoints",
        "startTime",
        "startDate",
        "createdAt",
        "distance",
        "duration"
    ],

    // associations: [
    //     { type: 'belongsTo', model: 'RollingBuddy.model.User', primaryKey: 'id', foreignKey: 'user_id' }
    // ],

    // TODO - validations

    proxy : {
        type : "rest",
        url : "/routes"
    }
});
