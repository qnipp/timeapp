
// subscribe to publications in server.js

Meteor.subscribe('users.company', Meteor.userId());
Meteor.subscribe('tags.mine');
Meteor.subscribe('tags.others');
Meteor.subscribe('items.mine');
Meteor.subscribe('times.mine');
Meteor.subscribe('hierarchy.mine');
Meteor.subscribe('attribs.mine');

//Deps.autorun(function() {
  // or
  // Meteor.subscribe("userData", Meteor.userId());
  // Meteor.subscribe("allUserData", Meteor.userId());
//}); 	

// TODO: remove DEBUG
SimpleSchema.debug = true;


counter = 0;

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



//////////// ITEMS ////////////


Template.itemlist.helpers({
	items: function () {
		return Items.find({}, {sort: {createdAt: -1, updatedAt: -1}});
	}
});

Template.itemlistentry.helpers({
	item: function () {
		return loadItem(this.item, {all: true}, null);
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
	'change input.tt-input[name="title"]': function(event) {
		console.log("fetching and parsing url: ");
		console.log(event);
		fetchUrl(event.currentTarget.value, parseUrlResponse);
	},
});

Template.itemrecentlist.helpers({
	itemsrecent: function() {
		// show last 5 days
		var times = Times.find(
				{start: { $gte: new Date((new Date() - 1000*60*60*24*5)) }}, 
				{fields: {item: 1}}).fetch();
		if(times) {
			var items = times.map(function (time) {
				return time.item;
			});
			return Items.find({_id: {$in: items}}, {sort: {updatedAt: -1}});
		} else {
			return null;
		}
	},
});

Template.itemrecentlistentry.helpers({
	item: function() {
		return loadItem(this.item, {all: true}, null);
	},
});

Template.itemrecentlistentry.events({
	'click .jsitemstop': function() {
		Meteor.call("setItemEnd", this._id);
	},
	'click .jsitemstart': function() {
		Meteor.call("setItemStart", this._id);
	},
});


Template.itemreport.helpers({
	tableSettingsItems: function() {
		var settings = tableSettingsItems();
		settings.fields.splice(0, 1);
		settings.showFilter = false;
		settings.showNavigation = 'never';
		
		return settings;
	},
	items: function() {
		console.log('loading item: ');
		console.log(this);
		
		return Items.find({_id: this._id});
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
		return Times.find({},  {sort: {start: -1, end: -1}});
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

Template.timerunninglist.helpers({
	timesrunning: function() {
		return Times.find({end: {
				$not: {$ne: null}
			}});
	},
});


Template.timelistentry.events({
	'click .jstimestop': function() {
		Meteor.call("setTimeEnd", this._id);
	},
});

Template.timelistentry.helpers({
	time: function () {
		var time = this.time;
				
		time.item = loadItem(time.item, {all: true}, null);
		
		if(time.end) {
			time.duration_fmt = formatDuration(time.end - time.start);
		} else {
			time.duration_fmt = formatDuration(new Date() - time.start);
		}
		
		if(time.start) {
			//time.start_fmt = moment.utc(time.start).format(CNF.FORMAT_DATETIME);
			time.start_fmt = moment(time.start).format(CNF.FORMAT_DATETIME);
		}
		if(time.end) {
			//time.end_fmt = moment.utc(time.end).format(CNF.FORMAT_DATETIME);
			time.end_fmt = moment(time.end).format(CNF.FORMAT_DATETIME);
		}
		
		return time;
	}
});

Template.timeform.events({
	'click .jstimeremove': function() {
		Meteor.call("timeRemove", this._id);
	},
});
/*
Template.timeform.helpers({
	// TODO: check if this is necessary, time should be set by route already
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

/*
Template.tagform.helpers({
	// TODO: check if this is necessary, tag should be set by route already
	tag: function () {
		return Tags.findOne({_id: this._id});
	},
});*/

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
				/*
				tag.color = {};
				tag.color.bgname = '#'+intToRGB(hashCode( this.tag.name ) );
				tag.color.bgvalue = '#'+intToRGB(hashCode( this.tag.value ) );
				
				tag.color.fgname = invertCssColor( tag.color.bgname );
				tag.color.fgvalue = invertCssColor( tag.color.bgvalue );
				*/
			}
		}
		
		return tag;
		// TODO: 
		// loadTag(this, null);
	},
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
});
