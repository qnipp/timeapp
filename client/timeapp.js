

var OnBeforeRouteActions;

OnBeforeRouteActions = {
	loginRequired: function(pause) {
		//console.log("iron:router - OnBeforeRouteActions:loginRequired ");
		// if not loggedin - send to login page
		if (!Meteor.userId()) {
			Router.go('/');
			//this.next();
			//return pause();
		} else {
			//this.next();
		}
		this.next();
	},
	loginPrevented: function(pause) {
		//console.log("iron:router - OnBeforeRouteActions:loginPrevented ");
		// if already logged in - send to start page
		if (Meteor.userId()) {
			Router.go('/iamin');
			//return pause();
		} else {
			//this.next();
		}
		this.next();
	}
};
// redirect to login page 
Router.onBeforeAction(OnBeforeRouteActions.loginRequired, {
	except: ['login', 'logout']
});
// redirect to iamin page
Router.onBeforeAction(OnBeforeRouteActions.loginPrevented, {
	only: ['login']
});


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