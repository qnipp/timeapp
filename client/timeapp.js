
// subscribe to publications in server.js
Meteor.subscribe(
	'items.mine',
	'hierarchy.mine',
	'times.mine',
	'times.mine.sum',
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


//////////// ITEMS ////////////


Template.itemtree.helpers({
	items: function () {
		return Items.find({});
	}
});

Template.leafform.helpers({
	item: function () {
		return Items.findOne({_id: this._id});
	}
});


Template.itemrecentlist.helpers({
	recentitems: function() {
		var items = Items.find({});
			
		items.forEach(function(item) {
			item.timeelapsed = Times.find({item: item._id, date: "2016-03-12"}, {fields: {timeelapsed: 1} } );
		});
		
		return items;
	},
});

//////////// TIMES ////////////

Template.timelist.helpers({
	times: function () {
		return Times.find({}, {orderBy: {createdAt: -1}});
	}
});

Template.timeform.helpers({
	time: function () {
		return Times.findOne({_id: this._id});
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