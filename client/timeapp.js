
// FIXED: remove DEBUG
SimpleSchema.debug = false;


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
// usage: {{var_dump variable "variable name"}}
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

Template.registerHelper('formatDuration', function(timeinms) {
	return formatDuration(timeinms);
});
 


// make Schema available in Templates (?)
// see: http://autoform.meteor.com/updateaf
Template.registerHelper("Schemas", Schemas);
Template.registerHelper("Collections", Collections);


//////////// SEARCH ///////////

// see: https://github.com/aldeed/meteor-autoform#callbackshooks
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
	},
	
	formItem: {
		before: {
			"method-update": function(doc) {
				console.log('AutoForm.hooks([formItem]');
				console.log(doc);
				//this.done();
				// return false;
				return doc;
			}
		}
	},
	formTime: {
		before: {
			"method-update": function(doc) {
				console.log('AutoForm.hooks([formTime]');
				console.log(doc);
				//this.done();
				// return false;
				return doc;
			}
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
		//return Items.find({}, {sort: {createdAt: -1, updatedAt: -1}});
		
		// 2016-08-08 - as requested sort by title.
		return Items.find({}, {sort: {title: 1}});
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
	},
	
	/*
	tags: function() {
		console.log('this in tags: ');
		console.log(this);
		return Tags.find({_id: {$in: this.tags}}, {fields: {attributes: 1}});
	},
	'tag.attributes': function() {
		console.log('this in attributes: ');
		console.log(this);
		return Attributes.find({_id: {$in: this.attributes}});
	},*/
	
	renderAttributeValues: function(element) {
	//Template.registerHelper('renderAttributeValues', function(attributes) {
	// {{renderAttributeValues element=this structkey="tags" structcollection="Tags" structfield="attributes" valuekey="attributes"  }}
		// Attributes._id: name [type]
		// Tags.attributes: [Attributes._id]
		// Item.tags: [Tags._id]
		// Item.attributes: [AttributesValues {Attributes._ids: value} ]

		// structcollection._id: name [type]
		// holder.structkey: structcollection._id
		// this.holder
		
	
		//console.log("renderAttributeValues: ");
		// item element
		/*
		console.log("this: ");
		console.log(this);
		console.log("element :");
		console.log(element);
		console.log("attributes valuekey: ");
		console.log(attributes.hash.valuekey);
		console.log("attributes structkey: ");
		console.log(attributes.hash.structkey);
		console.log("attributes struct: ");
		console.log(attributes.hash.struct);
		*/
		
		//var doc = this;
		var doc = element.hash.element;
		
		// attributes.hash.structkey	..	field in document, that referes to _id in structure Collection
		// attributes.hash.structcollection	..	name of the Collection that holds the structure
		// attributes.hash.structfield	..	field in collection, that holds the structure
		// attributes.hash.valuekey	..	
		
		var oFoundAttribs = {};
		/*
		//var instance = Template.instance();
		if(!document.querySelector('.renderAttributeTarget')) {
			console.log("document not ready :(");
			//return;
		} else {
			console.log("ready ...");
		}
		*/
		if(doc.tags) {
			Tags.find({_id: {$in: doc.tags} }).map(function (tag) {
				if(tag.attributes) {
					for(var i = 0; i < tag.attributes.length; i++) {
						oFoundAttribs[tag.attributes[i]] = tag.attributes[i];
					}
				}
			});
		}
		
		// result so far:
		// oFoundAttribs["4oKTwk4ZSvybBuXmj"] = "4oKTwk4ZSvybBuXmj"
		// oFoundAttribs["zb7RMJ98MGccNHnLJ"] = "zb7RMJ98MGccNHnLJ"
		// ..
		
		var aFoundAttribs = [];
		var sHTML = "";
		var fieldValue = null;
		var attribIndex = null;
		
		
		//console.log("parent element: ");
		//console.log( document.querySelector('.panel-body'));
		/*
		console.log("instance element: ");
		if(instance) {
			console.log( instance.querySelector('.renderAttributeTarget'));
		} else {
			console.log("instance not found :(");
		}*/
		/*
		console.log("child element: ");
		console.log( document.querySelector('.form-group'));
		*/
		
		// TODO: fügt man zu einem item später zusätzliche attribute hinzu,
		// kann es sein, dass sich die reihenfolge der attribute so verändert, dass 
		// der Index der gespeicherten Werte im Item, nicht mehr zum formular passt
		// d.h.: man muss das render der Items ändern und zuerst die indices rendern, 
		// die als werte bereits vorhanden sind. 
		
		if(oFoundAttribs) {
			aFoundAttribs = Object.keys(oFoundAttribs).map(
				function (key) {
					return oFoundAttribs[key]
				});
			// result so far:
			// aFoundAttribs = ["4oKTwk4ZSvybBuXmj", "zb7RMJ98MGccNHnLJ", ...]
			
			var count = 0;
			// will list all attributes that needs to be rendered, in correct order
			// having the values on the correct spot
			// if values are on indices beyound lenght - they will be put earlier
			// - if half of the saved values are beyond lenght - we will have a problem
			//var aRenderedAttributes = new Array(aFoundAttribs.length);
			
			// if there are alreay attribute values stored for this item
			// render those attributes first
			/*
			if(doc.attributes) {
				for(var i = 0; i < doc.attributes.length; i++) {
					
					// only accept if the values are still 
					if()
					
					sHTML += Blaze.toHTMLWithData(Template.attributedynamic, 
							{attrib: attrib, value: fieldValue, index: count});
					
					count++;
				}
			}*/
			
			//console.log('renderAttributeValues - items attributes: ');
			//console.log(doc.attributes);
			
			Attributes.find({_id: {$in: aFoundAttribs} }).map(function (attrib) {
				//console.log('renderAttributeValues - found attribute to render: ');
				//console.log(attrib);
				
				// the problem: it needs to rendered within a #form - but selector is not there (in document) yet
				// this means, it render more and more elements outside the form
				//Blaze.renderWithData(Template.attributedynamic, {attrib: attrib}, document.querySelector('.panel-body'));
				
				fieldValue = null;
				attribIndex = getIndexfromArray(attrib._id, doc.attributes, 'attribid');
				if(attribIndex != -1) {
					fieldValue = doc.attributes[attribIndex].value;
					attrib.value = fieldValue;
				}
				
				//console.log('renderAttributeValues - found value: '+ fieldValue + ' on index: '+ attribIndex);
				
				sHTML += Blaze.toHTMLWithData(Template.attributedynamic, 
							{attrib: attrib, value: fieldValue, index: count});
				count ++;
				
			});
		} else {
			console.log('renderAttributeValues - no found attributes');
		}
		
		return sHTML;
	},
});

Template.itemform.onRendered( function() {
	this.autorun(function(element) {
		Template.currentData();
		try {
			AutoForm.resetForm("formItem");
			AutoForm._forceResetFormValues("formItem");
		} catch (e) {
		}
	});
});

Template.itemform.events({
	'click .jsitemremove': function() {
		if(confirm("Are you sure?")) {
			Meteor.call("itemRemove", this._id);
		}
	},
	/*
	'click .fetchUrl.client': function() {
		// Error: 
		// No 'Access-Control-Allow-Origin' header is present on the requested resource. 
		// Origin 'https://timeapp.qnipp.com' is therefore not allowed access.
		
		console.log('direct client call: ');
		fetchUrl('https://jira.super-fi.net/browse/INGWEB-906');
	},*/
	
	'click .fetchUrl.server': function() {
		console.log('Updating details from JIRA: ');
		//var result = Meteor.call("fetchUrl", 'https://jira.super-fi.net/rest/auth/1/session', false);
		
		Meteor.call("updateJiraDetails", this._id, Session.get(CNF.PLUGIN.JIRA.SESSION.AUTH),
			function(error, result) {
				if(!error) {
					console.log("updateJiraDetails result: ");
					console.log(result);
				} else {
					console.log("updateJiraDetails error: ");
					console.log(error);
				}
		});
		
		/*
		console.log("going to search through array this.attributes: ");
		console.log(this.attributes);
		console.log(".. for id: " + Attributes.findOne({"name": "JIRA ID"})._id + " in field: "+ "attribid");
		*/
		
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
	}
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
	},
	currentuserid: function() {
		return Meteor.userId();
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

// is called every time when page is reloaded
Template.itemreport.onCreated(function (){
    var self = this;
    self.asyncTimes = new ReactiveVar([{comments: [{comment: "Waiting for response from server..."}]}]);
	
	Meteor.call("findTimes", Template.currentData()._id,
		function(error, result) {
			
			//console.log("itemreport onCreated with result: "+ result); 
			self.asyncTimes.set(result);
	});
	
	self.autorun(function() {
		Meteor.call("findTimes", Template.currentData()._id, 
			function(error, result) {
				//console.log("itemreport autorun with result: "); 
				self.asyncTimes.set(result);
		});
	});
});

Template.itemreport.events({
	//'click .reactive-table tbody tr': function (event) {
	'click .jstimeload': function(event) {
		Router.go(Router.path('time.detail', {_id: this._id}));
	}
});

Template.itemreport.helpers({
	items: function() {
		return Items.find({_id: this._id});
	},
	times: function() {
		
		//console.log("itemreport times called.");
		
		return Template.instance().asyncTimes.get();
		/*
		return Times.find({
			createdBy: Meteor.userId(), 
			item: this._id
		});*/
		
	},
	isReady: function() {
		//console.log("itemreport isReady called.");
		return Template.instance().asyncTimes.get();
	},
	
	totalsUpdatedAt: function() {
		if(this.totalsUpdatedAt) {
			return moment(this.totalsUpdatedAt).format(CNF.FORMAT_DATETIME);
		} else {
			return "ever";
		}
	},
	
	tableSettingsGroupByItem: tableSettings('item', null, 'normal', Meteor.userId()),
	tableSettingsTimes: function() {
		var settings = tableSettingsTime();
		
		settings.fields.splice(0, 1);
		settings.showFilter = false;
		settings.showNavigation = 'never';
		settings.rowsPerPage = 1000;
		// remove on click handler
		//settings.rowClass = null;
		
		return settings;
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
});
*/

Template.timeform.onRendered( function() {
	this.autorun(function(element) {
		Template.currentData();
		try {
			AutoForm.resetForm("formTime");
			AutoForm._forceResetFormValues("formTime");
		} catch(e) {
		}
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
		try {
			AutoForm.resetForm("formTag");
			AutoForm._forceResetFormValues("formTag");
		} catch(e) {
		}
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
	tableSettingsGroupByTag: tableSettings('tag', null, 'normal', Meteor.userId()),
	tableSettingsGroupByItem: tableSettings('item', Template.itemlistentryItemSimple, 'normal', Meteor.userId()),
	
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

//////////// ATTRIBUTES ////////////


Template.attributelist.helpers({
	attributes: function () {
		return Attributes.find({}, {sort: {name: 1, value: 1}});
	},
});

Template.attributeform.events({
	'click .jsattributeremove': function() {
		Meteor.call("attributeRemove", this._id);
	},
});

Template.attributeform.helpers({
	currentuserid: function() {
		return Meteor.userId();
	}
});

Template.attributeform.onRendered( function() {
	this.autorun(function(element) {
		Template.currentData();
		try {
			AutoForm.resetForm("formAttribute");
			AutoForm._forceResetFormValues("formAttribute");
		} catch (e) {
		}
	});
});

Template.attributedynamic.helpers({
	fieldnameID: function() {
		return "attributes."+ this.index +".attribid";
	},
	fieldnameValue: function() {
		return "attributes."+ this.index +".value";
	},
	
	fieldvalueID: function() {
		//console.log("fieldvalueId: "+  this.attrib._id);
		return this.attrib._id;
	},
	fieldvalueName: function() {
		//console.log("fieldvalueName: "+  this.attrib.value);
		//console.log("fieldvalueName: "+ (this.value ? this.value : ''));
		//console.log(this);
		return this.value ? this.value : '';
	},
});
/*
Template.attributelistentry.helpers({
	// TODO: check if this is necessary, attribute should be set by route already
	attribute: function () {
		var attribute;
		
		if(this.attribute && this.attribute._id) {
			attribute = Attributes.findOne({_id: this.attribute._id});
			
			if(attribute) {
				// TODO: make loadAttribute(attribute)
				attribute = loadTag(attribute);
			}
		}
		
		return attribute;
		// TODO: 
		// loadTag(this, null);
	},
});
*/

//////////// REPORT ////////////

/*
Template.reportcontainer.onCreated(function (){
    var self = this;
    self.currentUserId = new ReactiveVar([{_id: 1, 'emails.0.address': "Waiting for response from server..."}]);
	
	//self.currentUserId.set(this._id);
	
	self.autorun(function() {
		self.currentUserId.set(this._id);
	});
});
*/

Template.reportcontainer.events({
	//'click .reactive-table tbody tr': function (event) {
	'click .jsitemload': function(event) {
		Router.go(Router.path('item.detail', {_id: this._id}));
	},
	'click .jstagload': function(event) {
		Router.go(Router.path('tag.detail', {_id: this._id}));
	},
	'click .jsuserload': function(event) {
		Router.go(Router.path('report.detail', {_id: this._id}));
	}
});


Template.reportcontainer.helpers({
	// all item tags (TODO: time-tags do not work)
	tags: function () {
		if(this._id) {
			
			var oAllItems = {};
			var aAllItems = [];

			Times.find(
				{createdBy: this._id}, 
				{fields: {item: 1}}
			).map(
				function(time) {
					if(time.item) {
						var b = {};
						//console.log(time.item);
						b[time.item] = time.item;
						jQuery.extend(oAllItems, b);
					} else { 
						return []; 
					}
				}
			);
			
			for(var a in oAllItems) { aAllItems.push(a); }
			
			var oAllTags = {};
			var aAllTags = [];

			Items.find(
				{ $or: [{'totals.userid': this._id}, {_id: {$in: aAllItems }} ]}, {fields: {tags: 1}}
			).map(
				function(item) {
					if(item.tags) {
						var b = {};
						for(var i = 0;i < item.tags.length; i++) {
							//console.log(item.tags[i]);
							b[item.tags[i]] = item.tags[i];
						}
						jQuery.extend(oAllTags, b);
					} else { 
						return []; 
					}
				}
			);
			
			for(var a in oAllTags) { aAllTags.push(a); }
			
			return Tags.find({
				// tags of user, or tags that where created by the user
				_id: {$in: aAllTags},
				type: "item-tag"}, {sort: {name: 1, value: 1}});
		} else {
			return Tags.find({type: "item-tag"}, {sort: {name: 1, value: 1}});
		}
		//return Tags.find({}, {sort: {name: 1, value: 1}});
	},
	// all items
	items: function () {
		
		if(this._id) {
			// only items that have the user id in totals sums
			var oAllItems = {};
			var aAllItems = [];

			Times.find(
				{createdBy: this._id}, 
				{fields: {item: 1}}
			).map(
				function(time) {
					if(time.item) {
						var b = {};
						//console.log(time.item);
						b[time.item] = time.item;
						jQuery.extend(oAllItems, b);
					} else { 
						return []; 
					}
				}
			);
			
			for(var a in oAllItems) { aAllItems.push(a); }
			
			return Items.find(
				{ $or: [{'totals.userid': this._id}, {_id: {$in: aAllItems }} ]}, {sort: {title: 1}});
		} else {
			return Items.find({}, {sort: {title: 1}});
		}
	},
	// current user (TODO: add all other users)
	users: function() {
		if(this._id) {
			return Meteor.users.find({_id: this._id}, {fields: {_id: 1, emails: 1}});
		} else {
			return Meteor.users.find({}, {fields: {_id: 1, emails: 1}});
		}
			
		//return [{ _id: Meteor.userId(),  'emails.0.address': 'andreas@qnipp.com', 'timetoday': 123 }];
		
	},
	
	tableSettingsGroupByUserRecent: tableSettings('user', Template.userlistentryItemSimple, 'normal', this._id),
	tableSettingsGroupByUser: function() {
		return tableSettings('user', Template.userlistentryItemSimple, 'report', this._id);
	},
	tableSettingsGroupByTag: function() {
		return tableSettings('tag', Template.taglistentryItem, 'report', this._id);
	},
	tableSettingsGroupByItem: function() {
		return tableSettings('item', Template.itemlistentryItemSimple, 'report', this._id);
	},
	
	/*
	isReady: function() {
		return Template.instance().currentUserId.get();
	},
	*/
});


Template.estimatedresultentry.helpers({
	estimate: function() {
		var item = this;
				
		var attribIdEstimate = Attributes.findOne({"name": CNF.PLUGIN.JIRA.ATTRIBUTES.ESTIMATE});
		if(!attribIdEstimate) return '';
		attribIdEstimate = attribIdEstimate._id;
		
		var indexEstimate = getIndexfromArray(attribIdEstimate, item.attributes, "attribid");
		if(indexEstimate >= 0 && item.attributes[indexEstimate].value) {
			
			var timeestimated = parseFloat(item.attributes[indexEstimate].value) * 60 * 60 * 1000;
			
			// get calculated base value
			var timeelapsed = getTimeslotValueFromTotals(item.totals, null, "total");
			
			// add times that are not summed up for given item
			Times.find({
				item: item._id,
				start: CNF.timeslots["total"].start
			}).map(function(doc) {
				timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
			});
			
			var color = 'black';
			// coloring result
			if(timeelapsed < timeestimated * 0.90) {
				color = "LimeGreen";
			} else if(timeelapsed < timeestimated * 1.10) {
				color = "green";
			} else if(timeelapsed < timeestimated * 1.20) {
				color = "gold";
			} else if(timeelapsed < timeestimated * 1.50) {
				color = "orange";
			} else if(timeelapsed < timeestimated * 3) {
				color = "red";
			} else {
				color = "magenta";
			}
		
			/*
			return Blaze.toHTMLWithData(Template.estimatedresultentry, {
				percentage: (Math.floor((timeelapsed * 100) / timeestimated)) + '%',
				timeestimated: formatDuration(timeestimated, true),
				timeelapsed: formatDuration(timeelapsed, true),
				color: color
			});
			*/
			
			return {
				percentage: (Math.floor((timeelapsed * 100) / timeestimated)) + '%',
				timeestimated: formatDuration(timeestimated, true),
				timeelapsed: formatDuration(timeelapsed, true),
				color: color
			};
		} else {
			return "";
		}
	},
});

/*
Template.tablecellSimple.helpers({
	userid: Meteor.userId(),
	test: function() {
		console.log(Template.instance().data);
	}
});
*/

