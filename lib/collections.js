// code sent to client and server
// which gets loaded before anything else (since it is in the lib folder)


// define schemas
Schemas = {};
Collections = {};

Items = Collections.Items = new Mongo.Collection("items");
Hierarchy = Collections.Hierarchy = new Mongo.Collection("hierarchy");
Times = Collections.Times = new Mongo.Collection("times");
Attributes = Collections.Attributes = new Mongo.Collection("attributes");

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

/*
Times.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
*/

Attributes.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});



// does not work :\
// Operators = new Mongo.Collection("users");

Schemas.Items = new SimpleSchema({
	title: {
		type: String,
		label: "Title",
		max: 200,
		unique: true,
		
		/*
		custom: function () {
			var shouldBeRequired = this.field('saleType').value == 1;

			if (shouldBeRequired) {
				// inserts
				if (!this.operator) {
					if (!this.isSet || this.value === null || this.value === "") return "required";
				}

				// updates
				else if (this.isSet) {
					if (this.operator === "$set" && this.value === null || this.value === "") return "required";
					if (this.operator === "$unset") return "required";
					if (this.operator === "$rename") return "required";
				}
			}
		}*/
      
      /*
		custom: function () {
			if (Meteor.isClient && this.isSet) {
				Meteor.call("itemIsTitleUnique", this.value, function (error, result) {
					if (!result) {
						Meteor.Items.simpleSchema().namedContext("formItem").addInvalidKeys(
							[{name: "title", type: "notUnique"}]
						);
					}
				});
			}
		}*/
	},
	description:{
		type: String,
		label: "Description",
		optional: true,
		max: 2000  	
	},
	path: {
		type: String,
		label: "Path",
		optional: true,
		autoform: {
			type: "hidden",
			label: false
		},
	},
	origin: {
		type: String,
		label: "origin of item",
		optional: true,
		autoform: {
			type: "hidden",
			label: false
		},
	},
	keepOpen: {
		type: Boolean,
		label: "keep item running",
		optional: true,
		autoform: {
			afFieldInput: {
				type: "boolean-checkbox"
			}
		}
	},
	createdAt: {
		type: Date,
		label: "Created at",
		defaultValue: new Date,
		optional: true,
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
});
Items.attachSchema(Schemas.Items);

Schemas.Hierarchy = new SimpleSchema({
	upperitem:{
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		
		// TODO: does this work?
		//type: Items,
		optional: true,
		label: "Upper-Item",
		
		autoform: {
			autocomplete: "off",
			afFieldInput: {
				type: 'autocomplete-input',
				placeholder: 'Upper-Item name',
				settings: function() {
					return {
						position: "bottom",
						rules: [
							{
								collection: Items,
								field: "_id",
								filter: { createdBy: Meteor.userId() },
								template: Meteor.isClient && Template.autocompleteItem,
								noMatchTemplate: Meteor.isClient && Template.autocompleteItemNotFound,
								selector: function(match) {
									return {"title" : {$regex : ".*"+match+".*"}};
								}
							}
						]
					};
				}
			}
		}
		
	},
	loweritem:{
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		
		// TODO: does this work?
		//type: Items,
		optional: true,
		label: "Sub-Item",
		autoform: {
			autocomplete: "off",
			afFieldInput: {
				type: 'autocomplete-input',
				placeholder: 'Lower-Item name',
				settings: function() {
					return {
						position: "bottom",
						rules: [
							{
								collection: Items,
								field: "_id",
								filter: { createdBy: Meteor.userId() },
								template: Meteor.isClient && Template.autocompleteItem,
								noMatchTemplate: Meteor.isClient && Template.autocompleteItemNotFound,
								selector: function(match) {
									return {"title" : {$regex : ".*"+match+".*"}};
								}
							}
						]
					};
				}
			}
		}
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
});

Hierarchy.attachSchema(Schemas.Hierarchy);


Schemas.Times = new SimpleSchema({
	item: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		// TODO: does this work?
		//type: Items,
		label: "Item",
		
		autoform: {
			autocomplete: "off",
			afFieldInput: {
				type: 'autocomplete-input',
				placeholder: 'Item name',
				settings: function() {
					return {
						position: "bottom",
						//limit: 15,
						rules: [
							{
								collection: Items,
								//subscription: 'items.mine',
								//matchAll: true,
								//field: "title",
								field: "_id",
								filter: { createdBy: Meteor.userId() },
								template: Meteor.isClient && Template.autocompleteItem,
								noMatchTemplate: Meteor.isClient && Template.autocompleteItemNotFound,
								selector: function(match) {
									console.log("in selector :");
									console.log(match);
									return {"title" : {$regex : ".*"+match+".*"}};
								}
							}
						]
					};
				}
			}
		}
		
	},
	start: {
		//type: "datetime-local",
		type: Date,
		label: "Start Time",
		defaultValue: new Date, // moment.utc(new Date).format("DD.MM.YYYY HH:mm"), //  new Date,
		autoform: {
			afFieldInput: {
				type: "datetime-local",
				//type: "bootstrap-datetimepicker",
				//timezoneId: "America/New_York"
			}
		},
		// start-date always before end-date
		custom: function () {
			if (this.value > new Date()) {
				return "invalidValueStartdate";
			}
			
			/*
			if (this.field('end').value > 0 && this.field('end').value < this.value) {
				return "invalidValueStartdate";
			}
			*/
		}
	},
	end: {
		type: Date,
		label: "End Time",
		optional: true,
		autoform: {
			afFieldInput: {
				type: "datetime-local",
				//type: "bootstrap-datetimepicker",
				//timezoneId: "America/New_York"
			}
		},
		// end-date always after start-date
		custom: function () {
			if (this.value > 0 && this.field('start').value > this.value) {
				return "invalidValueEnddate";
			}
		}
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
		optional: true,
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
});
Times.attachSchema(Schemas.Times);


Schemas.Attributes = new SimpleSchema({
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
});

Attributes.attachSchema(Schemas.Attributes);