//
// Client side activity detection for the session timeout
// - depends on jquery
//
// Meteor settings:
// - staleSessionHeartbeatInterval: interval (in ms) at which activity heartbeats are sent up to the server
// - staleSessionActivityEvents: the jquery events which are considered indicator of activity e.g. in an on() call.
//
var heartbeatInterval = Meteor.settings && Meteor.settings.public && Meteor.settings.public.staleSessionHeartbeatInterval || (3*60*1000); // 3mins
var timeoutInterval = Meteor.settings && Meteor.settings.public && Meteor.settings.public.staleSessionInactivityTimeout || (30*60*1000); // 30mins
var activityEvents = Meteor.settings && Meteor.settings.public && Meteor.settings.public.staleSessionActivityEvents || 'mousemove click keydown';

var activityDetected = false;
var inactvityStarted = new Date();

//
// periodically send a heartbeat if activity has been detected within the interval
//
Meteor.setInterval(function() {
    if (Meteor.userId() && activityDetected) {
        Meteor.call('heartbeat');
        activityDetected = false;
        inactvityStarted = new Date();
    }else{
        timeout = moment(inactvityStarted).add('milliseconds', timeoutInterval)
        if(timeout.isBefore(moment())){
            Meteor.logout();
            Router.go('entrySignIn');
        }
    }
}, heartbeatInterval);

//
// detect activity and mark it as detected on any of the following events
//
Meteor.startup(function() {
    $('body').on(activityEvents, function() {
       activityDetected = true;
    });
});
