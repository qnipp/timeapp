// code sent to client and server
// which gets loaded before anything else (since it is in the lib folder)

Items = new Mongo.Collection("items");
Hierarchy = new Mongo.Collection("hierarchy");
Times = new Mongo.Collection("times");
Attributes = new Mongo.Collection("attributes");

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
	},
	owner:{
		type: String,
		label: "Owner",
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
	},
	owner:{
		type: String,
		label: "Owner",
	},
}));

Times.attachSchema(new SimpleSchema({
	item: {
		type: String,
		label: "Item",
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
	createdAt: {
		type: Date,
		label: "Created at",
		defaultValue: new Date,
	},
	owner:{
		type: String,
		label: "Owner",
	},
	comments: {
		type: [String],
		label: "Comments",
		optional: true,
		max: 200,
	}
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
		allowedValues: ["boolean", "int", "float", "date", "String", "Url", "Text", "List"],
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
	},
	owner:{
		type: String,
		label: "Owner",
	},
}));
	

/*
// set up a schema controlling the allowable 
// structure of comment objects
Comments.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200
  },
  body:{
    type: String,
    label: "Comment",
    max: 1000  	
  },
  docid:{
  	type: String, 
  }, 
  owner:{
  	type: String, 
  }, 
  
}));

*/