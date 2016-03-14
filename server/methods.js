Meteor.methods({
	/*
	addTask: function (text) {
		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
		throw new Meteor.Error("not-authorized");
		}
	
		Tasks.insert({
		text: text,
		createdAt: new Date(),
		owner: Meteor.userId(),
		username: Meteor.user().username
		});
	},
	deleteTask: function (taskId) {
		Tasks.remove(taskId);
	},
	setChecked: function (taskId, setChecked) {
		Tasks.update(taskId, { $set: { checked: setChecked} });
	},
	*/
	
	itemInsert: function (item) {
		console.log('methods:itemInsert - '+ item.title);
		// basic checks
		// rate limiting
		// properties checks
		return Items.insert(item);
	},
	itemUpdate: function (item) {
		console.log('methods:itemUpdate - #'+ item._id +' - '+item.title);
		return Items.update(item._id, item.modifier);
	},
});