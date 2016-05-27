Meteor.startup(function () {
    // code to run on server at startup
	
	console.log("Meteor startup is called!");
	
	console.log("Dropping indeces on items..");
	//Items._dropIndex("title");
}); 
