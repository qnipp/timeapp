Meteor.methods({
	/*
	addTask: function (text) {
		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
		throw new Meteor.Error("not-authorized");
		}
	
		Tasks.insert({
		text: text,
		createdAt: new Date(),
		owner: Meteor.userId(),
		username: Meteor.user().username
		});
	},
	deleteTask: function (taskId) {
		Tasks.remove(taskId);
	},
	setChecked: function (taskId, setChecked) {
		Tasks.update(taskId, { $set: { checked: setChecked} });
	},
	*/
	
	itemInsert: function (item) {
		console.log('methods:itemInsert - '+ item.title);
		// basic checks
		// rate limiting
		// properties checks
		return Items.insert(item);
	},
	itemUpdate: function (item) {
		console.log('methods:itemUpdate #'+ item._id + ' - ' + item.modifier.$set.title );
		
		console.log(item.modifier);
		
		check(item.modifier.$set, Schemas.Items);
		return Items.update(item._id, item.modifier);
	},
	itemIsTitleUnique: function (title) {
		
		return false;
	},
	
	setTimeEnd: function (timeid) {
		console.log('methods:setTimeEnd - '+ timeid);
		
		var time = Times.findOne(timeid);
		
		if(!time) 			
			throw new Meteor.Error("not-found");
		if(time.createdBy != Meteor.userId()) 
			throw new Meteor.Error("not-authorized");
		
		return Times.update(time._id, {$set: {end: new Date() }});
	},
	
	setItemStart: function (itemid) {
		console.log('methods:setItemStart - '+ itemid);
		
		var item = Items.findOne(itemid);
		
		if(!item) 			
			throw new Meteor.Error("not-found");
		if(item.createdBy != Meteor.userId()) 
			throw new Meteor.Error("not-authorized");
		
		// stop all other times	
		var timesrunning = Times.find({end: {
				$not: {$ne: null}
			}});
		
		var itemrunning;
		var items_for_update = [];
		
		timesrunning.forEach(function(timerunning) {
			// load item of running time
			itemrunning = Items.findOne(timerunning.item, {fields: { keepOpen: 1} });
			
			if(itemrunning) {
				// only update end-time of keepOpen is not set
				// current selected Item will always be stopped and restartet
				if(!itemrunning.keepOpen || item._id == itemrunning._id) {
					items_for_update.push(itemrunning._id);
				} /*else {
					console.log("running time will not be stopped: ");
					console.log(itemrunning);
				}*/
			}
		});
		
		// run update only if necessary
		if(items_for_update) {
			Times.update({
				$and: [ {
					end: { $not: {$ne: null}},
					item: { $in: items_for_update }
				} ] },
				{$set: {end: new Date() }}
			);
		}
		
		// create new Time entry for selected Item
		return Times.insert({
			item: item._id,
			start: new Date(),
		});
	},
	
	timeInsert: function (time) {
		console.log('methods:timeInsert - '+ time.start);
		return Times.insert(time);
	},
	timeUpdate: function (time) {
		console.log('methods:timeUpdate #'+ time._id + ' - ' + time.modifier.$set.start);
		//console.log(time.modifier.$set);
		
		check(time.modifier.$set, Schemas.Times);
		return Times.update(time._id, time.modifier);
	},
	
	timeRemove: function (timeid) {
		console.log('methods:timeRemove #'+ timeid);
		// TODO: check if my time entry
		return Times.remove({_id: timeid});
	},
});


/*
// see: https://github.com/aldeed/meteor-autoform#callbackshooks
var hooksObject = {
  before: {
    // Replace `formType` with the form `type` attribute to which this hook applies 
	  // insert, update, delete
    formType: function(doc) {
      // Potentially alter the doc
      doc.foo = 'bar';

      // Then return it or pass it to this.result()
      //return doc; (synchronous)
      //return false; (synchronous, cancel)
      //this.result(doc); (asynchronous)
      //this.result(false); (asynchronous, cancel)
    }
  },

  // The same as the callbacks you would normally provide when calling
  // collection.insert, collection.update, or Meteor.call
  after: {
    // Replace `formType` with the form `type` attribute to which this hook applies
    formType: function(error, result) {}
  },

  // Called when form does not have a `type` attribute
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    // You must call this.done()!
    //this.done(); // submitted successfully, call onSuccess
    //this.done(new Error('foo')); // failed to submit, call onError with the provided error
    //this.done(null, "foo"); // submitted successfully, call onSuccess with `result` arg set to "foo"
  },

  // Called when any submit operation succeeds
  onSuccess: function(formType, result) {},

  // Called when any submit operation fails
  onError: function(formType, error) {},

  // Called every time an insert or typeless form
  // is revalidated, which can be often if keyup
  // validation is used.
  formToDoc: function(doc) {
    // alter doc
    // return doc;
  },

  // Called every time an update or typeless form
  // is revalidated, which can be often if keyup
  // validation is used.
  formToModifier: function(modifier) {
    // alter modifier
    // return modifier;
  },

  // Called whenever `doc` attribute reactively changes, before values
  // are set in the form fields.
  docToForm: function(doc, ss) {},

  // Called at the beginning and end of submission, respectively.
  // This is the place to disable/enable buttons or the form,
  // show/hide a "Please wait" message, etc. If these hooks are
  // not defined, then by default the submit button is disabled
  // during submission.
  beginSubmit: function() {},
  endSubmit: function() {}
};

// Pass an array of form IDs for multiple forms
AutoForm.addHooks(['form1', 'form2', 'form3', 'form4'], hooksObject);

// Or pass `null` to run the hook for all forms in the app (global hook)
AutoForm.addHooks(null, hooksObject);
*/