
Meteor.subscribe(
	'items.mine',
	'hierarchy.mine',
	'times.mine',
	'attribs.mine',
	'users',
	);


Template.registerHelper('currentTemplateName', function() {
	var currentTemplateName = Blaze.currentView.parentView.name;
	//console.log(currentTemplateName);
	currentTemplateName = currentTemplateName.replace('Template.', '').replace('.', '-');
	return currentTemplateName;
});

Template.registerHelper('currentRoute', function() {
	return Router.current().route.getName();
});

Template.registerHelper('projectName', function() {
	return "timeapp";
});

Template.registerHelper('equals', function (a, b) {
	return a === b;
});


Template.itemtree.helpers({
	items: function () {
		//return [{ title: "test", _id: "1232131" },{ title: "test2", _id: "2424232" }];
		return Items.find({});
	}
});

Template.leafform.helpers({
	item: function () {
		//return [{ title: "test", _id: "1232131" },{ title: "test2", _id: "2424232" }];
		return Items.findOne({_id: this._id});
	}
});






/*
Template.hello.helpers({
counter: function () {
	return Session.get('counter');
}
});

Template.hello.events({
'click button': function () {
	// increment the counter when button is clicked
	Session.set('counter', Session.get('counter') + 1);
}
});

*/