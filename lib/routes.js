

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

/*
// login page
Router.route('/', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	this.render("logobar", {
		to: "header"
	});
	this.render("login", {
		to: "main"
	});
}, {
	name: "login"
});*/


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
	name: "home"
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
	name: "item.list"
});


Router.route('/item/:_id', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	var item = Items.findOne({_id: this.params._id});
	//var item = { title: "test", _id: "1232131" };

	/*
	this.render("navbar", {
		to: "header",
		data: function() {
			//return Items.findOne({_id: this.params._id});
			return {
				title: "test",
				_id: "1232131"
			};
		}
	});
	*/
	this.render("navbar", {
		to: "header",
		data: item
	});
	this.render("itemcontainer", {
		to: "main",
		data: item
	});
}, {
	name: "item.detail"
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
	name: "item.create"
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
	name: "time.list"
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
	name: "time.detail"
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
	name: "time.create"
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
	name: "tag.list"
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
	name: "tag.detail"
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
	name: "tag.create"
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

