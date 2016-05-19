
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
Meteor.publishComposite('data.others', {
	find: function() {
		return Tags.find({
			"createdBy": { $ne: this.userId },
			"shared": this.userId
		});
	},
	children: [{
		find: function(tag) {
			return Items.find({ 
				"createdBy": { $ne: this.userId },
				"tags": tag._id 
			});
		},
		children: [{
			find: function(item, tag) {
				return Times.find({
					"createdBy": { $ne: this.userId },
					"item": item._id
					
				});
			}
		}]
	}]
});*/


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
			return Items.find({
				// find my own items
				"createdBy": this.userId
			});
		},
		children: [{
			find: function(item, tag) {
				return Times.find({
					$or: [{
						// my tracked times
						"createdBy": this.userId
					},{
						// tracked times from others belonging to my items 
						"createdBy": { $ne: this.userId },
						"item": item._id
					}]
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
					"createdBy": this.userId
				});
			}
		}]
	}]
});

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
