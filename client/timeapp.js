
// subscribe to publications in server.js
Meteor.subscribe('items.mine');
Meteor.subscribe('times.mine');
Meteor.subscribe('hierarchy.mine');
Meteor.subscribe('attribs.mine');
Meteor.subscribe('tags.mine');
//Meteor.subscribe('users');


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
		return Items.find();
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
		var times = Times.find({start: { $gte: new Date((new Date() - 1000*60*60*24*5)) }}, {fields: {item: 1}}).fetch();
		if(times) {
			var items = times.map(function (time) {
				return time.item;
			});
			return Items.find({_id: {$in: items}});
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
	tableSettingsTime: function () {
		return {
			//collection: times,
			/*
			collection: function() {
				console.log('tableSettingsTime - access to collection.find.');
				return Times.find({},  {sort: {createdAt: -1}});
			},*/
			rowsPerPage: 20,
			showFilter: true,
			showNavigation: 'auto',
			//fields: ['item', 'start', 'end', 'duration'],
			rowClass: function(item) {
				return item.id == this.id ? 'info' : '';
			},
			fields: [
				{ 
					key: 'item', 
					label: 'Item', 
					
					//tmpl: Template.timelistentryItem,
					
					fn: function(value, time, key) {
						var item = loadItem(time.item, false, null);
						return item.title;
					},
					sortByValue: true,
					sortable: false,
				},
				{ 
					key: 'start', 
					label: 'Start', 
					
					//tmpl: Template.timelistentryStart,
					
					fn: function(value, time, key) {
						if(time.start) {
							//time.start_fmt = moment.utc(time.start).format(CNF.FORMAT_DATETIME);
							time.start_fmt = moment(time.start).format(CNF.FORMAT_DATETIME);
						}
						return time.start_fmt;
					},
					sortByValue: true,
					sortOrder: 1, 
					sortDirection: 'descending',
				},
				{ 
					key: 'end', 
					label: 'End', 
					//tmpl: Template.timelistentryEnd,
					
					fn: function(value, time, key) {
						if(time.end) {
							//time.end_fmt = moment.utc(time.end).format(CNF.FORMAT_DATETIME);
							time.end_fmt = moment(time.end).format(CNF.FORMAT_DATETIME);
						} else {
							time.end_fmt = '';
						}
						return time.end_fmt;
					},
					sortByValue: true,
					
					sortOrder: 2, 
					sortDirection: 'descending', 
				},
				{ 
					key: 'duration', 
					label: 'duration', 
					//tmpl: Template.timelistentryDuration,
					
					fn: function(value, time, key) {
						if(time.end) {
							time.duration_fmt = formatDuration(time.end - time.start);
						} else {
							time.duration_fmt = formatDuration(new Date() - time.start);
						}
						return time.duration_fmt;
					},
					
					//sortByValue: true,
					sortable: false,
				},
				{ 
					key: 'createdAt', 
					label: 'Created At', 
					hidden: true,
					sortOrder: 0, 
					sortDirection: 'descending',
				},
			],
		};
	},
	
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
				tag.color = {};
				tag.color.bgname = '#'+intToRGB(hashCode( this.tag.name ) );
				tag.color.bgvalue = '#'+intToRGB(hashCode( this.tag.value ) );
				
				tag.color.fgname = invertCssColor( tag.color.bgname );
				tag.color.fgvalue = invertCssColor( tag.color.bgvalue );
			}
		}
		
		return tag;
		// TODO: 
		// loadTag(this, null);
	},
});


//////////// REPORT ////////////
Template.reportcontainer.helpers({
	tableSettingsTags: function () {
		return {
			//collection: times,
			/*
			collection: function() {
				console.log('tableSettingsTime - access to collection.find.');
				return Times.find({},  {sort: {createdAt: -1}});
			},*/
			rowsPerPage: 100,
			showFilter: true,
			showNavigation: 'auto',
			//fields: ['item', 'start', 'end', 'duration'],
			rowClass: function(tag) {
				return tag.id == this.id ? 'info' : '';
			},
			fields: [
			/*
				{ 
					key: 'name', 
					label: 'Tag Name', 
					hidden: false,
					sortOrder: 0, 
					sortDirection: 'ascending',
				},
				{ 
					key: 'value', 
					label: 'Tag Value', 
					hidden: false,
					sortOrder: 0, 
					sortDirection: 'ascending',
				},*/
				{ 
					key: 'name', 
					label: 'Tag', 
					
					tmpl: Template.taglistentryItem,
					
					fn: function(value, tag, key) {
						//var item = loadItem(time.item, false, null);
						return tag;
					},
					sortByValue: true,
					sortable: true,
				},
				
				{
					key: 'timetoday', 
					label: 'Today', 
					fn: function(value, tag, key) {
						
						var timeelapsed = 0;
						
						if(tag.type = "item-tag") {
							Items.find({tags: tag._id}).map(function(item) {
								Times.find({
									item: item._id,
									start: {
										$gte: new Date(new Date().setHours(0,0,0,0)),
										$lte: new Date(new Date().setHours(23,59,59,999))
									}
								}).map(function(doc) {
									timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
								});
							});
							
						} else if (tag.type = "time-tag") {
							// TODO
						}
						
						return formatDuration(timeelapsed, true);
					},
					sortable: false,
				},
				{
					key: 'timeweek', 
					label: 'this Week', 
					fn: function(value, tag, key) {
						
						var timeelapsed = 0;
						
						var firstDayofWeek = new Date().getDate() - new Date().getDay(); // will be sunday;
						firstDayofWeek += 1; // will be monday
						
						if(tag.type = "item-tag") {
							Items.find({tags: tag._id}).map(function(item) {
								Times.find({
									item: item._id,
									start: {
										$gte: new Date(new Date(new Date().setDate(firstDayofWeek  )).setHours(0,0,0,0     )),
										$lte: new Date(new Date(new Date().setDate(firstDayofWeek+6)).setHours(23,59,59,999))
									}
								}).map(function(doc) {
									timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
								});
							});
							
						} else if (tag.type = "time-tag") {
							// TODO
						}
						
						return formatDuration(timeelapsed, true);
					},
					sortable: false,
				},
				{
					key: 'timeweekprev', 
					label: 'previous Week', 
					fn: function(value, tag, key) {
						
						var timeelapsed = 0;
						
						var firstDayofWeek = new Date().getDate() - new Date().getDay(); // will be sunday;
						firstDayofWeek += 1; // will be monday
						
						if(tag.type = "item-tag") {
							Items.find({tags: tag._id}).map(function(item) {
								Times.find({
									item: item._id,
									start: {
										$gte: new Date(new Date(new Date().setDate(firstDayofWeek - 7)).setHours(0,0,0,0     )),
										$lte: new Date(new Date(new Date().setDate(firstDayofWeek - 1)).setHours(23,59,59,999))
									}
								}).map(function(doc) {
									timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
								});
							});
							
						} else if (tag.type = "time-tag") {
							// TODO
						}
						
						return formatDuration(timeelapsed, true);
					},
					sortable: false,
				},
				{
					key: 'timemonth', 
					label: 'this Month', 
					fn: function(value, tag, key) {
						
						var timeelapsed = 0;
						
						if(tag.type = "item-tag") {
							Items.find({tags: tag._id}).map(function(item) {
								Times.find({
									item: item._id,
									start: {
										$gte: new Date(new Date(new Date().setDate(1)).setHours(0,0,0,0     )),
										$lte: new Date(new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)).setHours(23,59,59,999))
									}
								}).map(function(doc) {
									timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
								});
							});
							
						} else if (tag.type = "time-tag") {
							// TODO
						}
						
						return formatDuration(timeelapsed, true);
					},
					sortable: false,
				},
				{
					key: 'timemonthprev', 
					label: 'previous Month', 
					fn: function(value, tag, key) {
						
						var timeelapsed = 0;
						
						if(tag.type = "item-tag") {
							Items.find({tags: tag._id}).map(function(item) {
								Times.find({
									item: item._id,
									start: {
										$gte: new Date(new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(1)).setHours(0,0,0,0     )),
										$lte: new Date(new Date(new Date().setDate(0)).setHours(23,59,59,999))
									}
								}).map(function(doc) {
									timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
								});
							});
							
						} else if (tag.type = "time-tag") {
							// TODO
						}
						
						return formatDuration(timeelapsed, true);
					},
					sortable: false,
				},
				{
					key: 'timetotal', 
					label: 'Total', 
					fn: function(value, tag, key) {
						
						var timeelapsed = 0;
						
						if(tag.type = "item-tag") {
							Items.find({tags: tag._id}).map(function(item) {
								Times.find({
									item: item._id
								}).map(function(doc) {
									timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
								});
							});
							
						} else if (tag.type = "time-tag") {
							// TODO
						}
						
						return formatDuration(timeelapsed, true);
					},
					sortable: false,
				}
			],
		};
	},
	tags: function () {
		//return Tags.find({type: "item-tag"}, {sort: {name: 1, value: 1}});
		return Tags.find({}, {sort: {name: 1, value: 1}});
	},
});
