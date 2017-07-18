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

let OnBeforeRouteActions;

OnBeforeRouteActions = {
  loginRequired(pause) {
    // console.log("iron:router - OnBeforeRouteActions:loginRequired ");
    // if not loggedin - send to login page
    if (!Meteor.userId()) {
      Router.go('/');
      // this.next();
      // return pause();
    } else {
      // this.next();
    }
    this.next();
  },
  loginPrevented(pause) {
    // console.log("iron:router - OnBeforeRouteActions:loginPrevented ");
    // if already logged in - send to start page
    if (Meteor.userId()) {
      Router.go('/iamin');
      // return pause();
    } else {
      // this.next();
    }
    this.next();
  },
};
// redirect to login page
Router.onBeforeAction(OnBeforeRouteActions.loginRequired, {
  except: ['login', 'register', 'logout', 'forgot'],
});
// redirect to iamin page
Router.onBeforeAction(OnBeforeRouteActions.loginPrevented, {
  only: ['login'],
});

Router.after(function() {
  if (
    this.route.options.title &&
    typeof this.route.options.title === 'string'
  ) {
    document.title = `${CNF.APPNAME} - ${this.route.options.title}`;
  } else if (this.route.options.title) {
    document.title = `${CNF.APPNAME} - ${this.route.options.title()}`;
  }
});

// when logged in
Router.route(
  '/iamin',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    this.render('navbar', {
      to: 'header',
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('iamincontainer', {
      to: 'main',
    });
  },
  {
    name: 'home',
    // title: function() { return Accounts.user() ? "Welcome "+ Accounts.user().profile["full-name"] : '' },
    title: 'Home',
    waitOn() {
      // return one handle, a function, or an array
      // FIXME takes ages
      //	return Meteor.subscribe('data.shared.items');
    },
  }
);

// ////////// ITEMS ////////////

Router.route(
  '/item',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    this.render('navbar', {
      to: 'header',
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('itemcontainer', {
      to: 'main',
    });
  },
  {
    name: 'item.list',
    title: 'Items',
    // FIXME ich weiß - das sollte man hier nicht machen
    // aber ohne dem werden sub-dokumente von items nicht geladen!
    waitOn() {
      // return one handle, a function, or an array
      // FIXME takes ages
      // return Meteor.subscribe('data.shared.items');
    },
  }
);

Router.route(
  '/item/:_id',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let item;
    if (this.params._id != '' && this.params._id != '0') {
      item = Items.findOne({ _id: this.params._id });
      if (item && !item.ownedBy) item.ownedBy = Meteor.userId();
    }

    this.render('navbar', {
      to: 'header',
      data: item,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('itemcontainer', {
      to: 'main',
      data: item,
    });
  },
  {
    name: 'item.detail',
    title: 'Item detail',
  }
);

Router.route(
  '/item/:_id/create',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let item;
    if (this.params._id != '' && this.params._id != '0') {
      item = Items.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: item,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('itemcontainer', {
      to: 'main',
      data: item,
    });
  },
  {
    name: 'item.create',
    title: 'New Item',
    // FIXME ich weiß - das sollte man hier nicht machen
    // aber ohne dem werden sub-dokumente von items nicht geladen!
    waitOn() {
      // return one handle, a function, or an array
      // FIXME takes ages
      // return Meteor.subscribe('data.shared.items');
    },
  }
);

Router.route(
  '/item/:_id/import',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let item;
    if (this.params._id != '' && this.params._id != '0') {
      item = Items.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: item,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('itemcontainer', {
      to: 'main',
      data: item,
    });
  },
  {
    name: 'item.import',
    title: 'Import Items',
    // FIXME ich weiß - das sollte man hier nicht machen
    // aber ohne dem werden sub-dokumente von items nicht geladen!
    waitOn() {
      // return one handle, a function, or an array
      // FIXME takes ages
      // return Meteor.subscribe('data.shared.items');
    },
  }
);

// ////////// TIMES ////////////

Router.route(
  '/time',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    this.render('navbar', {
      to: 'header',
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('timecontainer', {
      to: 'main',
    });
  },
  {
    name: 'time.list',
    title: 'Times',
    waitOn() {
      // return one handle, a function, or an array
      // FIXME takes ages
      // return Meteor.subscribe('data.shared.items');
    },
  }
);

Router.route(
  '/time/:_id',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}] ${this.params._id}`
    );

    let time;
    if (this.params._id != '' && this.params._id != '0') {
      // does not work
      // time = Times.findOne({_id: this.params._id}, {sort: { "comments.$.createdAt": -1}});
      time = Times.findOne({ _id: this.params._id });

      // Times will be summed up and removed from standard publication
      // this will load a single Times entry
      const renderer = this;

      Meteor.call('findTime', this.params._id, function(error, result) {
        // console.log("route findTime:");
        // console.log(result);

        renderer.render('navbar', {
          to: 'header',
          data: result,
        });
        renderer.render('timecontainer', {
          to: 'main',
          data: result,
        });
      });
    }

    this.render('navbar', {
      to: 'header',
      data: time,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('timecontainer', {
      to: 'main',
      data: time,
    });
  },
  {
    name: 'time.detail',
    title: 'Time Detail',
  }
);

Router.route(
  '/time/:_id/create',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let item;
    if (this.params._id != '' && this.params._id != '0') {
      item = Items.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: { item },
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('timecontainer', {
      to: 'main',
      data: { item },
    });
  },
  {
    name: 'time.create',
    title: 'Add Time',
  }
);

Router.route(
  '/time/:_id/import',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let time;
    if (this.params._id != '' && this.params._id != '0') {
      // time = Times.findOne({_id: this.params._id}, {sort: { "comments.$.createdAt": -1}});
      time = Times.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: time,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('timecontainer', {
      to: 'main',
      data: time,
    });
  },
  {
    name: 'time.import',
    title: 'Import Times',
  }
);

// ////////// TAGS ////////////

Router.route(
  '/tag',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    this.render('navbar', {
      to: 'header',
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('tagcontainer', {
      to: 'main',
    });
  },
  {
    name: 'tag.list',
    title: 'Tags',
  }
);

Router.route(
  '/tag/:_id',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let tag;
    if (this.params._id != '' && this.params._id != '0') {
      tag = Tags.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: tag,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('tagcontainer', {
      to: 'main',
      data: tag,
    });
  },
  {
    name: 'tag.detail',
    title: 'Tag Detail',
  }
);

Router.route(
  '/tag/:_id/create',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let tag;
    if (this.params._id != '' && this.params._id != '0') {
      tag = Tags.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: tag,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('tagcontainer', {
      to: 'main',
      data: tag,
    });
  },
  {
    name: 'tag.create',
    title: 'Create Tag',
  }
);

// ////////// ATTRIBUTES ////////////

Router.route(
  '/attrib',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    this.render('navbar', {
      to: 'header',
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('attributecontainer', {
      to: 'main',
    });
  },
  {
    name: 'attribute.list',
    title: 'Attributes',
  }
);

Router.route(
  '/attrib/:_id',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let attribute;
    if (this.params._id != '' && this.params._id != '0') {
      attribute = Attributes.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: attribute,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('attributecontainer', {
      to: 'main',
      data: attribute,
    });
  },
  {
    name: 'attribute.detail',
    title: 'Attribute Detail',
  }
);

Router.route(
  '/attrib/:_id/create',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let attribute;
    if (this.params._id != '' && this.params._id != '0') {
      attribute = Attributes.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: attribute,
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('attributecontainer', {
      to: 'main',
      data: attribute,
    });
  },
  {
    name: 'attribute.create',
    title: 'Create Attribute',
  }
);

// ////////// REPORTS ////////////

Router.route(
  '/report',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    this.render('navbar', {
      to: 'header',
    });
    this.render('actionbar', {
      to: 'overmain',
    });
    this.render('reportcontainer', {
      to: 'main',
    });
  },
  {
    name: 'report.list',
    title: 'Reports',
  }
);

Router.route(
  '/report/:_id',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let user;
    if (this.params._id != '' && this.params._id != '0') {
      user = Meteor.users.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: user,
    });
    this.render('actionbar', {
      to: 'overmain',
      data: user,
    });
    this.render('reportcontainer', {
      to: 'main',
      data: user,
    });
  },
  {
    name: 'report.detail',
    title: 'Reports from User',
    // FIXME ich weiß - das sollte man hier nicht machen
    // aber ohne dem werden sub-dokumente von items nicht geladen!
    /*
	waitOn: function () {
		// return one handle, a function, or an array
		// FIXME takes ages 
		return Meteor.subscribe('users.company');
	},*/
  }
);

// timesheet
Router.route(
  '/timesheet',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let user;
    this.params._id = Meteor.userId();
    
    if (this.params._id != '' && this.params._id != '0') {
      user = Meteor.users.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: user,
    });
    this.render('actionbar', {
      to: 'overmain',
      data: user,
    });
    this.render('timesheetcontainer', {
      to: 'main',
      data: user,
    });
  },
  {
    name: 'timesheet.list',
    title: 'Timesheet',
  }
);


Router.route(
  '/timesheet/:_id',
  function() {
    console.log(
      `iron:router - route:${Router.current().route
        ._path} [${Router.current().route.getName()}]`
    );

    let user;
    if (this.params._id != '' && this.params._id != '0') {
      user = Meteor.users.findOne({ _id: this.params._id });
    }

    this.render('navbar', {
      to: 'header',
      data: user,
    });
    this.render('actionbar', {
      to: 'overmain',
      data: user,
    });
    this.render('timesheetcontainer', {
      to: 'main',
      data: user,
    });
  },
  {
    name: 'timesheet.detail',
    title: 'Timesheet from User',
    // FIXME ich weiß - das sollte man hier nicht machen
    // aber ohne dem werden sub-dokumente von items nicht geladen!
    /*
	waitOn: function () {
		// return one handle, a function, or an array
		// FIXME takes ages 
		return Meteor.subscribe('users.company');
	},*/
  }
);

// ////////// PROFILE ////////////

/*
Router.route('/profile', function() {
	console.log("iron:router - route:" + Router.current().route._path + " [" + Router.current().route.getName() + "]");

	this.render("navbar", {
		to: "header"
	});
	this.render("actionbar", {
		to: "overmain"
	});
	this.render("profilecontainer", {
		to: "main"
	});
}, {
	name: "profile.edit",
	title: "Your Profile",
});

*/

/* more routes
 * 
 * attrib + attrib/:_id
 * settings
 * iamout ?
 * logout
 *
 */
