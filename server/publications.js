
Meteor.publish("users.company", function() {
	// TODO: only list users from group
	// TODO: add group to users collection
	//return Meteor.users.find({}); users.company
	return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});


/**
 User
	owns Tags
		hold Items
			hold Times
	shares Tags
		include Items
			include Times only with owner of Items 
	sees shared Tags
		including Items
			including Times of owned Items
			
// createdBy from Tags and Items can change by current owner.
// createdBy from Times can not be changed.
*/



/*

Meteor.publish("tags.mine", function() {
	return Tags.find({
		"createdBy": this.userId

	});
});

// publish read access to collections
Meteor.publish("items.mine", function() {
	return Items.find({
		"createdBy": this.userId
	});
});

Meteor.publish("times.mine", function() {
	return Times.find({
		"createdBy": this.userId
	});
});
*/


// publish Tags, Items and Times from shared tags
// shared times only from those items, that belong to you.

/*
 // reads too many children - 
Meteor.publishComposite('data.all', {
	// find Tags
	find: function() {
		return Tags.find({
			
			$or: [{
				// my own tags
				"createdBy": this.userId
			},{
				// tags shared with me
				"createdBy": { $ne: this.userId },
				"shared": this.userId
			}]
		});
	},
	children: [{
		
		find: function(tag) {
			console.log("loading first level children..");
			
			return Items.find({
				// find my own items
				"createdBy": this.userId
			});
		},
		children: [{
			find: function(item, tag) {
				//console.log("loading children: "+  item.title + ' - ' + item.totalsUpdatedAt + ' - '+ (typeof item.totalsUpdatedAt) );
				
				return Times.find({
					$or: [{
						// my tracked times
						"createdBy": this.userId
					},{
						// tracked times from others belonging to my items 
						"createdBy": { $ne: this.userId },
						"item": item._id
					}],
					//"createdAt": {$gte: moment().startOf("month").toDate()}
					"createdAt": {$gt: (typeof item.totalsUpdatedAt === "undefined") ? new Date(0) : item.totalsUpdatedAt}
				});
			}
		}]
	},{
		find: function(tag) {
			return Items.find({
				// find shared items
				"createdBy": { $ne: this.userId },
				"tags": tag._id 
			});
		},
		children: [{
			find: function(item, tag) {
				return Times.find({
					// only show my own times
					"createdBy": this.userId,
					//"createdAt": {$gte: moment().startOf("month").toDate()}
					"createdAt": {$gt: (typeof item.totalsUpdatedAt === "undefined") ? new Date(0) : item.totalsUpdatedAt}
				});
			}
		}]
	}]
});

*/


Meteor.publishComposite('data.my.items', {
	// find my own items 
	find: function() {
		return Items.find({
			// find my own items
			"ownedBy": this.userId
		});
	},
	children: [{
		// for each item, get all tracked times, regardless of user
		find: function(item) {
			//console.log("loading children: "+  item.title + ' - ' + item.totalsUpdatedAt + ' - '+ (typeof item.totalsUpdatedAt) );
			
			return Times.find({
				"item": item._id,
				//"createdAt": {$gte: moment().startOf("month").toDate()}
				"createdAt": {$gt: (typeof item.totalsUpdatedAt === "undefined") ? new Date(0) : item.totalsUpdatedAt}
			});
		}
	}]
});



Meteor.publishComposite('data.shared.tags', {
	// find tags that are mine or shared with me
	find: function() {
		return Tags.find({
			$or: [{
				// my own tags
				"createdBy": this.userId
			},{
				// tags shared with me
				"createdBy": { $ne: this.userId },
				"shared": this.userId
			}]
		});
	},
	children: [{
		// for each tag - load all items that are not owned by me where i dont have my user in totals yet
		find: function(tag) {
			return Items.find({
				// find shared items
				"ownedBy": { $ne: this.userId },
				"totals.userid": {$ne: this.userId},
				"tags": tag._id 
			});
		}, children: [{
			// for each item - load all times that are mine
			find: function(item, tag) {
				return Times.find({
					// find shared items
					"createdBy": this.userId,
					"item": item._id,
					"createdAt": {$gt: (typeof item.totalsUpdatedAt === "undefined") ? new Date(0) : item.totalsUpdatedAt}
				});
			}
		}]
	}/*, {
	// item is not defined - does not work
		// for each tag - load all times that are not created by me - necessary?
		find: function(tag) {
			return Times.find({
				// find shared items
				"createdBy": { $ne: this.userId },
				"tags": tag._id,
				// will break summary - when its in where, sums of tags will fail, if its not in where total sums will break
				"createdAt": {$gt: (typeof item.totalsUpdatedAt === "undefined") ? new Date(0) : item.totalsUpdatedAt}
			});
		}
	}*/]
});


Meteor.publishComposite('data.shared.items', {
	// find items that does not belong to me, but having my id in totals summed up
	find: function() {
		return Items.find({
			// find my own 
			"ownedBy": { $ne: this.userId },
			"totals.userid": this.userId,
		});
	},
	children: [{
		// for each item, get my tracked times, later than the last totals calculation date
		find: function(item) {
			return Times.find({
				"item": item._id,
				"createdBy": this.userId,
				//"createdAt": {$gte: moment().startOf("month").toDate()}
				"createdAt": {$gt: (typeof item.totalsUpdatedAt === "undefined") ? new Date(0) : item.totalsUpdatedAt}
			});
		}
	}]
});

// duplicated:
// times not own by me with my or shared tags that are tracked to my items
// - items that are shared via tags and have my user id in totals 

// Missing:
// my own times in shared items, that does not have a totals set 
// my own times that does not have an item

/*
 * see mongo: https://www.slideshare.net/slideshow/embed_code/36715147
 * and meteor: http://joshowens.me/using-mongodb-aggregations-to-power-a-meteor-js-publication/
 * cheat sheet: http://blog.serverdensity.com/wp-content/uploads/2010/06/pdf-screenshot.png
 * 
Meteor.publish('items.mine', function() {  
  self = this;
  
  
  contacts = 
	Events.aggregate([
		{$match: {createdBy: this.userId}}, 
		{$project: {invites: 1}}, 
		{ $unwind : "$invites" }, 
		{$group: {_id: {_id: "$_id"}}}, 
		{$project: {email: "$_id.email"}}]);
	
  
  timeelapsed = Items.aggregate([
	{$match: {createdBy: this.userId}}, // only those documents
	//{$project: {invites: 1}}, // limit to list of fields or rename fields
	//{$unwind : "$invites" }, // transforms list into single array elements
	{$group: {_id:  {_id: "$_id"}}},
	//{$project: {email: "$_id.email"}}])
  _(contacts).each(function(contact) {
    if (contact.email) {
      if (!Contacts.findOne({userId: self.userId, email: contact.email})) {
        self.added('contacts', Random.id(), {email: contact.email, userId: self.userId, name: ''});
      }
    }
  });
});

*/




/*
Meteor.publishComposite("times.mine", {
	find: function() {
        // Find top ten highest scoring posts
        return Times.find({
			"createdBy": this.userId,
		});
    },
	children: [ {
		find: function(time) {
			// Find post author. Even though we only want to return
			// one record here, we use "find" instead of "findOne"
			// since this function should return a cursor.
			return Items.find({
				"_id": time.item,
				"createdBy": this.userId,
			}, {limit: 1});
		}
	} ]
});
*/
/*
Meteor.publish("times.mine.sum", function() {
	self = this;
	
	timeelapsed = Times.aggregate([
		{$match: {createdBy: this.userId}}, // only those documents
		{$project: {item: 1, year: { $year: "$start" }, 
					month: { $month: "$start" }, day: { $dayOfMonth: "$start" },
					date: { $concat: [ {$year: "$start"}, "-", {$month: "$start"}, "-", {$dayOfMonth: "$start"} ]}
		}}, // limit to list of fields or rename fields
		{$group: {_id:  {_id: "$_id"}}}]);
});*/

/*
Meteor.publish("attribs.mine", function() {
	return Attributes.find({
		"createdBy": this.userId
	});
});


Meteor.publish("hierarchy.mine", function() {
	return Hierarchy.find({
		"createdBy": this.userId
	});
});

*/

// coments on docs
