

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

/*
// login page
Router.route('/', function() {
	console.log("iron:router - route:" + Router.current().route.path() + " [" + Router.current().route.getName() + "]");

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
	console.log("iron:router - route:" + Router.current().route.path() + " [" + Router.current().route.getName() + "]");

	this.render("navbar", {
		to: "header"
	});
	this.render("iamincontainer", {
		to: "main"
	});
}, {
	name: "home"
});



Router.route('/item', function() {
	console.log("iron:router - route:" + Router.current().route.path() + " [" + Router.current().route.getName() + "]");

	this.render("navbar", {
		to: "header"
	});
	this.render("itemcontainer", {
		to: "main"
	});
}, {
	name: "item"
});


Router.route('/item/:_id', function() {
	console.log("iron:router - route:" + Router.current().route.path() + " [" + Router.current().route.getName() + "]");

	//var item = Items.findOne({_id: this.params._id});
	var item = { title: "test", _id: "1232131" };

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



/* more routes
 * 
 * time + time/:_id
 * attrib + attrib/:_id
 * report + report/:_id
 * settings
 * iamout ?
 * logout
 *
 */

