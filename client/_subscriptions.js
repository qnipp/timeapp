// subscribe to publications in server.js

var Subscriptions = {};

Subscriptions.users = Meteor.subscribe('users.company', Meteor.userId());
/*
Meteor.subscribe('tags.mine');
Meteor.subscribe('items.mine');
Meteor.subscribe('times.mine');

//Meteor.subscribe('hierarchy.mine');
//Meteor.subscribe('attribs.mine');

// Tags, Items and Data from shared tags
Meteor.subscribe('data.others');

*/

//Meteor.subscribe('data.all');
Subscriptions.myitems = Meteor.subscribe('data.my.items');
Subscriptions.sharedtags = Meteor.subscribe('data.shared.tags');
Subscriptions.shareditems = Meteor.subscribe('data.shared.items');
Subscriptions.myAttributes = Meteor.subscribe('data.my.attributes');

//Deps.autorun(function() {
  // or
  // Meteor.subscribe("userData", Meteor.userId());
  // Meteor.subscribe("allUserData", Meteor.userId());
//}); 	
