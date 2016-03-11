Meteor.startup(function () {
    // code to run on server at startup
}); 


// publish read access to collections
Meteor.publish("items.mine", function() {
	return Items.find({
		createdBy: this.userId
	});
});

Meteor.publish("hierarchy.mine", function() {
	return Hierarchy.find({
		createdBy: this.userId
	});
});


Meteor.publish("times.mine", function() {
	return Times.find({
		createdBy: this.userId
	});
});

Meteor.publish("attribs.mine", function() {
	return Attributes.find({
		createdBy: this.userId
	});
});


// coments on docs
Meteor.publish("users", function() {
	// TODO: only list users from group
	// TODO: add group to users collection
	return Users.find({});
});