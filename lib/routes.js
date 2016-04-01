

/*
Router.map(function() {
    this.route('home', {
        path: '/',
    });

    this.route('private');
});

Router.plugin('ensureSignedIn', {
  only: ['private']
});
*/



// set up the iron router
Router.configure({
	layoutTemplate: 'ApplicationLayout',
	/*
	loadingTemplate: 'loading',
    notFoundTemplate: 'pageNotFound',
	*/
});


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
	except: ['login','register','logout']
});
// redirect to iamin page
Router.onBeforeAction(OnBeforeRouteActions.loginPrevented, {
	only: ['login']
});

Router.after(function(){
    if (this.route.options.title && typeof this.route.options.title == "string") {
        document.title = this.route.options.title +' - '+ CNF.APPNAME;
	} else if (this.route.options.title) {
		document.title = this.route.options.title() +' - '+ CNF.APPNAME;
	}
});


// when logged in 
Router.route('/iamin', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	this.render("navbar", {
		to: "header"
	});
	this.render("iamincontainer", {
		to: "main"
	});
}, {
	name: "home",
	//title: function() { return Accounts.user() ? "Welcome "+ Accounts.user().profile["full-name"] : '' },
	title: "Welcome back",
});


//////////// ITEMS ////////////

Router.route('/item', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	this.render("navbar", {
		to: "header"
	});
	this.render("itemcontainer", {
		to: "main"
	});
}, {
	name: "item.list",
	title: "Your Items",
});


Router.route('/item/:_id', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var item = Items.findOne({_id: this.params._id});

	this.render("navbar", {
		to: "header",
		data: item
	});
	this.render("itemcontainer", {
		to: "main",
		data: item
	});
}, {
	name: "item.detail",
	title: "Item detail",
});


Router.route('/item/:_id/create', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var item;
	
	if(this.params._id != '') {
		item = Items.findOne({_id: this.params._id});
	}
	
	this.render("navbar", {
		to: "header",
		data: item
	});
	this.render("itemcontainer", {
		to: "main",
		data: item
	});
}, {
	name: "item.create",
	title: "New Item",
});

Router.route('/item/:_id/import', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var item;
	
	if(this.params._id != '') {
		item = Items.findOne({_id: this.params._id});
	}
	
	this.render("navbar", {
		to: "header",
		data: item
	});
	this.render("itemcontainer", {
		to: "main",
		data: item
	});
}, {
	name: "item.import",
	title: "Import Items",
});


//////////// TIMES ////////////



Router.route('/time', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	this.render("navbar", {
		to: "header"
	});
	this.render("timecontainer", {
		to: "main"
	});
}, {
	name: "time.list",
	title: "Your Time Entries",
});


Router.route('/time/:_id', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var time = Times.findOne({_id: this.params._id});
	
	this.render("navbar", {
		to: "header",
		data: time
	});
	this.render("timecontainer", {
		to: "main",
		data: time
	});
}, {
	name: "time.detail",
	title: "Time Detail",
});


Router.route('/time/:_id/create', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var time;
	
	if(this.params._id != '') {
		time = Times.findOne({_id: this.params._id});
	}
	
	this.render("navbar", {
		to: "header",
		data: time
	});
	this.render("timecontainer", {
		to: "main",
		data: time
	});
}, {
	name: "time.create",
	title: "Add Time Entry",
});

Router.route('/time/:_id/import', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var time;
	
	if(this.params._id != '') {
		time = Times.findOne({_id: this.params._id});
	}
	
	this.render("navbar", {
		to: "header",
		data: time
	});
	this.render("timecontainer", {
		to: "main",
		data: time
	});
}, {
	name: "time.import",
	title: "Import Time Entries",
});


//////////// TAGS ////////////



Router.route('/tag', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	this.render("navbar", {
		to: "header"
	});
	this.render("tagcontainer", {
		to: "main"
	});
}, {
	name: "tag.list",
	title: "Your Tags",
});


Router.route('/tag/:_id', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var tag = Tags.findOne({_id: this.params._id});
	
	this.render("navbar", {
		to: "header",
		data: tag
	});
	this.render("tagcontainer", {
		to: "main",
		data: tag
	});
}, {
	name: "tag.detail",
	title: "Tag Detail",
});


Router.route('/tag/:_id/create', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var tag;
	
	if(this.params._id != '') {
		tag = Tags.findOne({_id: this.params._id});
	}
	
	this.render("navbar", {
		to: "header",
		data: tag
	});
	this.render("tagcontainer", {
		to: "main",
		data: tag
	});
}, {
	name: "tag.create",
	title: "Create Tag",
});



/* more routes
 * 
 * attrib + attrib/:_id
 * report + report/:_id
 * settings
 * iamout ?
 * logout
 *
 */

