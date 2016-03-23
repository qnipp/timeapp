
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

Template.registerHelper('projectName', function() {
	return "timeapp";
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


/*
dependItemTree = new Tracker.Dependency();

Template.itemtree.onRendered(function () {
	this.$('div.itemtree').jstree({
		core: {
			data: function (node, cb) {
				dependItemTree.depend();
				
				console.log('Template.itemtree.onRendered');
				console.log(node);
				
				if(node.id === '#') {
					
					var rootNode = [{
						text : 'Your Items',
						id : '1',
						children : true
					}];
					cb(rootNode);
					
				}
				else {
					
				
					var nodes = Items.find().fetch();
					var hierarchyelement = null;
					
					_.forEach(nodes, function(item){
						//process item
						item.text = item.title;
						item.id = item._id;
						
						// find parent
						hierarchyelement = Hierarchy.findOne({loweritem: item._id}, {fields: {upperitem: 1}});
						if (hierarchyelement) {
							item.parent = hierarchyelement.upperitem;
						} else {
							item.parent = '1';
							//item.parent = null;
						}
					});
					
					cb(nodes);
				}
			}
		}
	});
});

  
Template.itemtree.events({
	'changed.jstree .jstree-node': function(node, event) {
		console.log("tree node was activated..");
		
		alert(node);
		
		console.log("node: ");
		console.log(node);
		console.log("event: ");
		console.log(event);
	},
	'click .jstree-node': function(node, event) {
		console.log("tree node was clicked..");
		
		alert(node);
		
		console.log("node: ");
		console.log(node);
		console.log("event: ");
		console.log(event);
	},
});
*/

Template.itemtree.helpers({
	items: function () {
		return Items.find({});
	}
});

Template.leafform.helpers({
	// TODO: check if this is necessary, item should be set by route already
	item: function () {
		// TODO: add parent information 
		return Items.findOne({_id: this._id});
	}
});

Template.itemrecentlist.helpers({
	itemsrecent: function() {
		return Items.find({});
	},
});

Template.itemrecentlistentry.helpers({
	item: function() {
		return loadItem(this, null);
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

Template.timelist.helpers({
	times: function () {
		return Times.find({}, {sort: {createdAt: -1}});
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
				
		time.item = loadItem(time.item, null);
		
		if(time.end) {
			time.duration_fmt = formatDuration(time.end - time.start);
		} else {
			time.duration_fmt = formatDuration(new Date() - time.start);
		}
		
		if(time.start) {
			time.start_fmt = moment.utc(time.start).format(CNF.FORMAT_DATETIME);
		}
		if(time.end) {
			time.end_fmt = moment.utc(time.end).format(CNF.FORMAT_DATETIME);
		}
		
		return time;
	}
});

Template.timeform.events({
	'click .jstimeremove': function() {
		Meteor.call("timeRemove", this._id);
	},
});

Template.timeform.helpers({
	// TODO: check if this is necessary, time should be set by route already
	time: function () {
		return Times.findOne({_id: this._id});
	},
});



//////////// TAGS ////////////


Template.taglist.helpers({
	tags: function () {
		return Tags.find({}, {sort: {name: 1, value: 1}});
	}
});

Template.tagform.events({
	'click .jstagremove': function() {
		Meteor.call("tagRemove", this._id);
	},
});

Template.tagform.helpers({
	// TODO: check if this is necessary, tag should be set by route already
	tag: function () {
		return Tags.findOne({_id: this._id});
		
		// TODO: 
		// loadTag(this, null);
	},
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