// code sent to client and server
// which gets loaded before anything else (since it is in the lib folder)

Items = new Mongo.Collection("items");
Hierarchy = new Mongo.Collection("hierarchy");
Times = new Mongo.Collection("times");
Attributes = new Mongo.Collection("attributes");

/*
Items.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
*/

// TODO: write methode for needed actions

Hierarchy.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});

Times.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});

Attributes.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});

// does not work :\
// Operators = new Mongo.Collection("users");

Items.attachSchema(new SimpleSchema({
	title: {
		type: String,
		label: "Title",
		max: 200
	},
	description:{
		type: String,
		label: "Description",
		optional: true,
		max: 2000  	
	},
	createdAt: {
		type: Date,
		label: "Created at",
		defaultValue: new Date,
		autoform: {
			type: "hidden",
			label: false
		},
	},
	createdBy:{
		type: String,
		label: "Owner",
		autoValue: function() { return this.userId; },
		autoform: {
			type: "hidden",
			label: false
		},
	},
}));

Hierarchy.attachSchema(new SimpleSchema({
	upperitem:{
		type: String, 
		optional: true,
		label: "Upper-Item",
	},
	loweritem:{
		type: String, 
		optional: true,
		label: "Sub-Item",
	},
	createdAt: {
		type: Date,
		label: "Created at",
		defaultValue: new Date,
		autoform: {
			type: "hidden",
			label: false
		},
	},
	createdBy:{
		type: String,
		label: "Owner",
		autoValue: function() { return this.userId; },
		autoform: {
			type: "hidden",
			label: false
		},
	},
}));

Times.attachSchema(new SimpleSchema({
	item: {
		type: String,
		label: "Item",
		autoform: {
			afFieldInput: {
				type: 'autocomplete-input',
				placeholder: 'Item name',
				settings: function() {
					return {
						position: "top",
						//limit: 15,
						rules: [
							{
								collection: Meteor.Items,
								//subscription: 'items.mine',
								field: "title",
								template: Template.userPill
							}
							
							/*{
								token: '@',
								collection: Meteor.Items,
								field: "title",
								template: Template.userPill
							}, {
								token: '!',
								collection: Dataset,
								field: "_id",
								options: '',
								matchAll: true,
								filter: { type: "autocomplete" },
								template: Template.dataPiece
							}*/
						]
					};
				}
			}
		}
	},
	start: {
		type: Date,
		label: "Start Time",
		defaultValue: new Date,
	},
	end: {
		type: Date,
		label: "End Time",
	},
	comments: {
		type: [String],
		label: "Comments",
		optional: true,
		max: 200,
	},
	
	createdAt: {
		type: Date,
		label: "Created at",
		defaultValue: new Date,
		autoform: {
			type: "hidden",
			label: false
		},
	},
	createdBy:{
		type: String,
		label: "Owner",
		autoValue: function() { return this.userId; },
		autoform: {
			type: "hidden",
			label: false
		},
	},
}));

Attributes.attachSchema(new SimpleSchema({
	name: {
		type: String,
		label: "Name",
		max: 200
	},
	type:{
		type: String,
		label: "Type of",
		allowedValues: ["boolean", "int", "float", "date", "string", "url", "text", "list"],
		autoform: {
			options: [
				{label: "Boolean", value: "boolean"},
				{label: "Integer", value: "int"},
				{label: "Float", value: "float"},
				{label: "Boolean", value: "date"},
				{label: "String", value: "string"},
				{label: "Url", value: "url"},
				{label: "Long Text", value: "text"},
				{label: "List", value: "list"},
			]
		}
	},
	default:{
		type: String,
		label: "Default Value",
		optional: true,
		max: 100  	
	},
	createdAt: {
		type: Date,
		label: "Created at",
		defaultValue: new Date,
		autoform: {
			type: "hidden",
			label: false
		},
	},
	createdBy:{
		type: String,
		label: "Owner",
		autoValue: function() { return this.userId; },
		autoform: {
			type: "hidden",
			label: false
		},
	},
}));