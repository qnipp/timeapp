
Template.registerHelper('currentTemplateName', function() {
	var currentTemplateName = Blaze.currentView.parentView.name;
	//console.log(currentTemplateName);
	currentTemplateName = currentTemplateName.replace('Template.', '').replace('.', '-');
	return 'template: ' + currentTemplateName;
});

Template.registerHelper('projectName', function() {
	return "timeapp";
});

Template.itemtree.helpers({
	items: function () {
		return [{ title: "test", _id: "1232131" },{ title: "test2", _id: "2424232" }];
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