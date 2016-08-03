
// subscribe to publications in server.js

Meteor.subscribe('users.company', Meteor.userId());
/*
Meteor.subscribe('tags.mine');
Meteor.subscribe('items.mine');
Meteor.subscribe('times.mine');

//Meteor.subscribe('hierarchy.mine');
//Meteor.subscribe('attribs.mine');

// Tags, Items and Data from shared tags
Meteor.subscribe('data.others');

*/

//Meteor.subscribe('data.all');
Meteor.subscribe('data.my.items');
Meteor.subscribe('data.shared.tags');
Meteor.subscribe('data.shared.items');

//Deps.autorun(function() {
  // or
  // Meteor.subscribe("userData", Meteor.userId());
  // Meteor.subscribe("allUserData", Meteor.userId());
//}); 	

// TODO: remove DEBUG
SimpleSchema.debug = true;


counter = 0;


//////////// TRACKER ////////////

// see: http://stackoverflow.com/questions/25301149/momentjs-in-meteor-reactivity



// example
/*
Template.example.helpers({
  endtime: function () {
    return fromNowReactive(time.start);
  }
});
*/


//////////// GLOBALS ////////////

Template.registerHelper('currentTemplateName', function() {
	return Blaze.currentView.parentView.name.replace('Template.', '').replace('.', '-');
});

Template.registerHelper('currentRoute', function() {
	return Router.current().route.getName();
});

// TODO: does not work in side <head>
// see: https://atmospherejs.com/pip87/initial-iron-meta
Template.registerHelper('projectName', function() {
	return CNF.APPNAME;
});

Template.registerHelper('equals', function (a, b) {
	return a === b;
});

Template.registerHelper('or', function(cond1, cond2) {
	/*
	for (var i = 0; i < arguments.length; i++) {
		alert(arguments[i]);
	}*/
	alert(cond1);
	alert(cond2);
});

Template.registerHelper('ifsetelse', function (attrib, isSet, isNot) {
	if(attrib) {
		return isSet;
	} else if(isNot) {
		return isNot;
	} else {
		return '';
	}
});

Template.registerHelper('log', function(log) {
	console.log("// DEBUG in "+ Blaze.currentView.parentView.name.replace('Template.', '').replace('.', '-') + ': '+ log);	
});

// usage: {{var_dump variable}}
Template.registerHelper('var_dump', function(variable, variablename) {
	
	console.log("// DEBUG in "+ Blaze.currentView.parentView.name.replace('Template.', '').replace('.', '-'));
	
	if (typeof variable !== "undefined") {
		if (typeof variablename === "string") {
			console.log("var_dump( "+variablename+" ): ");
			console.log(variable);
			console.log("====================");
			
		} else {
			console.log("var_dump( variable ): ");
			console.log(variable);
			console.log("====================");
		}
	} else {
		if (typeof variablename === "string") {
			console.log("Warning: variable "+variablename+" not found");	
		} 
		console.log("var_dump(this): ");
		console.log(this);
		console.log("====================");
		
	}
});

// make Schema available in Templates (?)
// see: http://autoform.meteor.com/updateaf
Template.registerHelper("Schemas", Schemas);
Template.registerHelper("Collections", Collections);


//////////// SEARCH ///////////

AutoForm.hooks({
  formSearch: {
    onSubmit: function (doc) {
      
		
		console.log('AutoForm.hooks([formSearch]');
		console.log(doc);
		//console.log(updateDoc);
	//	console.log(currentDoc);
		
		Router.go(Router.path('time.create', {_id: insertDoc.searchItem}));
		
		this.done();
		return false;
    }
  }
});

/*
AutoForm.addHooks(['formSearch'],{
	onSubmit: function(insertDoc, updateDoc, currentDoc) {
		// You must call this.done()!
		//this.done(); // submitted successfully, call onSuccess
		//this.done(new Error('foo')); // failed to submit, call onError with the provided error
		//this.done(null, "foo"); // submitted successfully, call onSuccess with `result` arg set to "foo"
		
		console.log('AutoForm.addHooks([formSearch]');
		console.log(insertDoc);
		console.log(updateDoc);
		console.log(currentDoc);
		
		
		Router.go(Router.path('time.create', {_id: insertDoc.searchItem}));
		
		this.done();
		
		return false;
	}
    onSuccess: function(formType, result) {
        Router.go('page',{_id: this.docId});
		
		console.log('methods:openTimeWithItem : '+ itemid);
		
		
		//Router.go(Router.path('item.detail', {_id: itemid}));
		Router.go(Router.path('time.create', {_id: this.docId}));
    }
    
});
*/


//////////// ITEMS ////////////


Template.itemlist.helpers({
	items: function () {
		return Items.find({}, {sort: {createdAt: -1, updatedAt: -1}});
	}
});

Template.itemlistentry.helpers({
	item: function () {
		//return loadItem(this.item, {all: true}, null);
		if(this.item && !this.itemobj) {
			this.itemobj = loadItem(this.item, {all: true}, null);
		}
		
	// CHECK: is running in loadItem does not work reactive (when stopping time)
	// this helper will be loaded to many times :\
	// isRunning is done within #with item, therefor this._id = this.item._id
		this.itemobj.isRunning = Times.findOne({
				item: this.itemobj._id,
				createdBy: Meteor.userId(),
				end: {
					$not: {$ne: null}
				}
			}, {limit: 1, fields: {_id: 1}}) ? true : false;
			
		return this.itemobj;
	}
});

Template.itemform.helpers({
	currentuserid: function() {
		return Meteor.userId();
	}
});

Template.itemform.onRendered( function() {
	this.autorun(function(element) {
		Template.currentData();
		AutoForm.resetForm("formItem");
		AutoForm._forceResetFormValues("formItem");
	});
});

Template.itemform.events({
	'click .jsitemremove': function() {
		if(confirm("Are you sure?")) {
			Meteor.call("itemRemove", this._id);
		}
	},
	'click .fetchUrl.client': function() {
		// Error: 
		// No 'Access-Control-Allow-Origin' header is present on the requested resource. 
		// Origin 'https://timeapp.qnipp.com' is therefore not allowed access.
		
		console.log('direct client call: ');
		fetchUrl('https://jira.super-fi.net/browse/INGWEB-906');
	},
	
	'click .fetchUrl.server': function() {
		console.log('indirect server call: ');
		var result = Meteor.call("fetchUrl", 'https://jira.super-fi.net/rest/auth/1/session', false);
		
		console.log('result: ' + result);
		
		//Meteor.call("fetchUrl", 'https://jira.super-fi.net/browse/INGWEB-906');
	}
});

// TODO: search for url
/*
Template.itemform.events({
	'change input.tt-input[name="title"]': function(event) {
		console.log("fetching and parsing url: ");
		console.log(event);
		fetchUrl(event.currentTarget.value, parseUrlResponse);
	},
});
*/

Template.itemrecentlist.helpers({
	itemsrecent: function() {
		// show last 8 days
		var times = Times.find({
			start: { $gte: new Date((new Date() - 1000*60*60*24*8)) },
			createdBy: Meteor.userId()
		}, {fields: {item: 1}}); //.fetch(); // FIXED - check if this fetch is necessary - no
		
		if(times) {
			var items = times.map(function (time) {
				return time.item;
			});
			//items.reverse();
			// TODO: sort by last Times entry
			return Items.find({_id: {$in: items}}, {sort: {updatedAt: -1}});
			//return Items.find({_id: {$in: items}});
		} else {
			return null;
		}
	},
});

Template.itemrecentlistentry.helpers({
	item: function() {
		if(this.item && !this.itemobj) {
			this.itemobj = loadItem(this.item, {all: true}, null);
		}
		return this.itemobj;
	},
	
	// CHECK: is running in loadItem does not work reactive (when stopping time)
	// this helper will be loaded to many times :\
	// isRunning is done within #with item, therefor this._id = this.item._id
	isRunning: function() {
		//console.log('check if is running: '+ this._id);
		return Times.findOne({
				item: this._id,
				createdBy: Meteor.userId(),
				end: {
					$not: {$ne: null}
				}
			}, {limit: 1, fields: {_id: 1}}) ? true : false;
	}
});

Template.itemrecentlistentry.events({
	'click .jsitemstop': function() {
		Meteor.call("itemSetEnd", this._id);
	},
	'click .jsitemstart': function() {
		Meteor.call("itemSetStart", this._id);
	},
});

Template.itemlistentry.events({
	'click .jsitemstop': function() {
		Meteor.call("itemSetEnd", this._id);
	},
	'click .jsitemstart': function() {
		Meteor.call("itemSetStart", this._id);
	},
});

Template.itemreport.events({
	//'click .reactive-table tbody tr': function (event) {
	'click .jstimeload': function(event) {
		Router.go(Router.path('time.detail', {_id: this._id}));
	}
});

Template.itemreport.helpers({
	tableSettingsItems: function() {
		var settings = tableSettingsItems();
		settings.fields.splice(0, 1);
		settings.showFilter = false;
		settings.showNavigation = 'never';
		// remove on click handler
		settings.rowClass = null;
		
		return settings;
	},
	tableSettingsTimes: function() {
		var settings = tableSettingsTime();
		
		
		settings.fields.splice(0, 1);
		settings.showFilter = false;
		settings.showNavigation = 'never';
		// remove on click handler
		//settings.rowClass = null;
		
		
		return settings;
	},
	items: function() {
		//console.log('loading item: ');
		//console.log(this);
		return Items.find({_id: this._id});
	},
	times: function() {
		return Times.find({
			createdBy: Meteor.userId(), 
			item: this._id
		});
	},
	totalsUpdatedAt: function() {
		if(this.totalsUpdatedAt) {
			return moment(this.totalsUpdatedAt).format(CNF.FORMAT_DATETIME);
		} else {
			return "ever";
		}
	}
});



Template.itemrunninglist.helpers({
	timesrunning: function() {
		return Times.find({
			end: {$not: {$ne: null}}, 
			createdBy: Meteor.userId()
		});
	},
});

//////////// TIMES ////////////

Template.timelist.events({
	'click .reactive-table tbody tr': function (event) {
		
		console.log('click on row in reactive table: ');
		//console.log(event);
		//console.log(this);
		
		Router.go(Router.path('time.detail', {_id: this._id}));
	}
});

Template.timelist.helpers({
	tableSettingsTime: tableSettingsTime,
	
	times: function () {
		///return Times.find({},  {sort: {createdAt: -1}});
		return Times.find({createdBy: Meteor.userId()},  {sort: {start: -1, end: -1}});
		// show only times which have more than 10seconds duration
		// does only work with aggregate
		// aggregate only available on isServer
		/*
		return Times.find({
			$or: [
				{end: {
					$not: {$ne: null}
				}},
				{'$subtract': ['$end', '$start']}
				
					
					{$gt: 10}
				}
			]
		}, {sort: {createdAt: -1}});
	*/
		//db.times.aggregate([{ "$project": { "diff": { "$subtract": ["$end", "$start"] }}}])

	}
});

Template.timelistrunningentry.events({
	'click .jstimestop': function() {
		Meteor.call("timeSetEnd", this._id);
	},
});

Template.timelistrunningentry.helpers({
	time: function () {
		var time = this.time;
		
		//console.log("showing running time: " + time._id);
		//console.log(time);
		
		if(time.item && !time.itemobj) {
			time.itemobj = loadItem(time.item, false, null);
			
		} else if(!time.item) {
			console.warn("Time Entry " + time._id + " does not have an item set");
			console.log(time);
		}
		
		if(time.start) {
			//time.start_fmt = moment.utc(time.start).format(CNF.FORMAT_DATETIME);
			time.start_fmt = moment(time.start).format(CNF.FORMAT_DATETIME);
		}
		
		if(time.end) {
			time.duration_fmt = formatDuration(time.end - time.start);
		} else {
			//time.duration_fmt = formatDuration(new Date() - time.start);
			//time.duration_fmt = fromNowReactive(time.start);
			time.duration_fmt = formatDuration(reactiveDate() - time.start);
		}
		
		return time;
	}
});

Template.timelistentry.helpers({
	time: function () {
		var time = this.time;
		
		//console.log("showing time: " + time._id);
		
		if(time.item && !time.itemobj) {
			time.itemobj = loadItem(time.item, false, null);
			
		} else if(!time.item) {
			console.warn("Time Entry " + time._id + " does not have an item set");
			console.log(time);
		}
		
		if(time.start) {
			//time.start_fmt = moment.utc(time.start).format(CNF.FORMAT_DATETIME);
			time.start_fmt = moment(time.start).format(CNF.FORMAT_DATETIME);
		}
		if(time.end) {
			//time.end_fmt = moment.utc(time.end).format(CNF.FORMAT_DATETIME);
			time.end_fmt = moment(time.end).format(CNF.FORMAT_DATETIME);
		}
		
		if(time.end) {
			time.duration_fmt = formatDuration(time.end - time.start);
		} else {
			//time.duration_fmt = formatDuration(new Date() - time.start);
			time.duration_fmt = formatDuration(reactiveDate() - time.start);
		}
		
		return time;
	}
});

Template.timeform.events({
	'click .jstimeremove': function() {
		Meteor.call("timeRemove", this._id);
	},
	'click .jstimesetnow': function(event) {
		//console.log('clicked on label for input: ');
		//console.log(event.target.parentElement.htmlFor);
		
		var now = moment().format('YYYY-MM-DDTHH:mm');
		$('#'+event.target.parentElement.htmlFor).val(now);
	},
	'click .jstimesetlatest': function(event) {
		var latesttime = Times.findOne({
			createdBy: Meteor.userId(),
			start: {
				$lte: moment().endOf('day').toDate(),
				$gte: moment().startOf('day').toDate()
			}
		},{
			sort: {end: -1}, 
			fields: {end: 1},
			limit: 1
		});
		
		
		console.log("clicked on latest-time from element: ");
		console.log(latesttime);
		
		if(latesttime) {
			latesttime.end = moment(latesttime.end).format('YYYY-MM-DDTHH:mm');
			$('#'+event.target.parentElement.htmlFor).val(latesttime.end);
		} else {
			var now = moment().format('YYYY-MM-DDTHH:mm');
			$('#'+event.target.parentElement.htmlFor).val(now);
		}
		/*
		console.log('event: ');
		console.log(event);
		console.log('target: ');
		console.log(event.target);
		console.log('current time: ');
		console.log(new Date());
		*/
	},
});

/*
Template.timeform.helpers({
	// TODO: check if this is necessary, time should be set by route already
	// item is set through route as well
	time: function () {
		return Times.findOne({_id: this._id});
	},
});*/

Template.timeform.onRendered( function() {
	this.autorun(function(element) {
		Template.currentData();
		AutoForm.resetForm("formTime");
		AutoForm._forceResetFormValues("formTime");
	});
});


Template.timecommentlist.helpers({
	createdAt: function () {
		return  moment(this.createdAt).format(CNF.FORMAT_DATETIME);
	},
});

//////////// TAGS ////////////


Template.taglist.helpers({
	tagsforitems: function () {
		return Tags.find({type: "item-tag"}, {sort: {name: 1, value: 1}});
	},
	tagsfortimes: function () {
		return Tags.find({type: "time-tag"}, {sort: {name: 1, value: 1}});
	}
});

Template.tagform.events({
	'click .jstagremove': function() {
		Meteor.call("tagRemove", this._id);
	},
});

Template.tagform.helpers({
	currentuserid: function() {
		return Meteor.userId();
	}
});

Template.tagform.onRendered( function() {
	this.autorun(function(element) {
		Template.currentData();
		AutoForm.resetForm("formTag");
		AutoForm._forceResetFormValues("formTag");
	});
});

Template.taglistentry.helpers({
	// TODO: check if this is necessary, tag should be set by route already
	tag: function () {
		var tag;
		
		if(this.tag && this.tag._id) {
			tag = Tags.findOne({_id: this.tag._id});
			
			if(tag) {
				tag = loadTag(tag);
			}
		}
		
		return tag;
		// TODO: 
		// loadTag(this, null);
	},
});


Template.tagreport.events({
	//'click .reactive-table tbody tr': function (event) {
	'click .jsitemload': function(event) {
		Router.go(Router.path('item.detail', {_id: this._id}));
	}
});

Template.tagreport.helpers({
	//tableSettingsTags: tableSettingsTags,
	tableSettingsTags: function() {
		var settings = tableSettingsTags();
		//settings.fields.splice(0, 1);
		settings.fields[0].tmpl = null;
		//settings.fields[0].fn = function(value, tag, key) { return tag.name+ ': '+ tag.value; };
		settings.fields[0].fn = function(value, tag, key) { return 'Total'; };
		settings.fields[0].sortByValue = false;
		settings.fields[0].sortable = false;
		settings.showFilter = false;
		settings.showNavigation = 'never';

		return settings;
	},
	
	tableSettingsItems: function() {
		var settings = tableSettingsItems();
		//settings.fields.splice(0, 1);
		settings.fields[0].tmpl = null;
		settings.fields[0].fn = function(value, item, key) { 
			return new Spacebars.SafeString(
				'<span>'+ item.title +' </span>'+
				'<small>'+ item.description +'</small>');
		};
		settings.fields[0].sortByValue = false;
		settings.fields[0].sortable = false;
		
		settings.showFilter = false;
		settings.showNavigation = 'never';
		
		return settings;
	},
	
	items: function() {
		console.log('loading items from tag: ' + this._id);
		//console.log(this);
		
		return Items.find({tags: this._id}, {sort: {updatedAt: -1}});
	},

	tags: function() {
		console.log('loading tag: ' + this._id);
		//console.log(this);
		
		return Tags.find({_id: this._id});
	},
});

//////////// REPORT ////////////
Template.reportcontainer.helpers({
	tableSettingsTags: tableSettingsTags,
	tags: function () {
		//return Tags.find({type: "item-tag"}, {sort: {name: 1, value: 1}});
		return Tags.find({}, {sort: {name: 1, value: 1}});
	},
	// all items from current user
	itemsnotempty: function() {
		return [{ _id: Meteor.userId()}];
	},
	tableSettingsTotal: tableSettingsTotal,
	tableSettingsPerMonth: tableSettingsPerMonth,
	
});
