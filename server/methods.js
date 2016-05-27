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
	
	// Returns true if current user already has a title with this name
	itemIsTitleUnique: function (newtitle) {
		// https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
		return !Items.find({
			title: newtitle, 
			ownedBy: Meteor.userId()
			/*
			$or: [
				{createdBy: Meteor.userId()},
				{ownedBy: Meteor.userId()}]
				*/
		}, {_id: 1});
		
	},
	
	setTimeEnd: function (timeid) {
		console.log('methods:setTimeEnd - '+ timeid);
		
		var time = Times.findOne(timeid);
		
		if(!time) {
			throw new Meteor.Error("not-found");
		}
		if(time.createdBy != Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		
		return Times.update(time._id, {$set: {end: new Date() }});
	},
	
	setItemStart: function (itemid) {
		console.log('methods:setItemStart - '+ itemid);
		
		var item = Items.findOne(itemid);
		
		if(!item) 			
			throw new Meteor.Error("not-found");
		/*
		if(item.createdBy != Meteor.userId()) 
			throw new Meteor.Error("not-authorized");
		*/
		// TODO: check if item's tags are shared with current user
		
		// stop all other times	
		var timesrunning = Times.find({
			end: {	$not: {$ne: null}}, 
			createdBy: Meteor.userId()
		});
		
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
	
	
	// FORM MODIFICATION METHODS
	
	// ITEMS
	
	itemInsert: function (item) {
		console.log('methods:itemInsert : '+ item.title);
		
		Schemas.Items.clean(item);
		check(item, Schemas.Items);
		return Items.insert(item);
	},
	itemUpdate: function (item, id) {
		console.log('methods:itemUpdate : '+ id + ' - ' + item.$set.title );
		
		check(item, Schemas.Items);
		return Items.update(id, item);
	},
	itemRemove: function (itemid) {
		console.log('methods:itemRemove : '+ itemid);
		// itemRemove not implemented !
		//console.log('haha - no :)');
		//return false;
		return Items.remove({_id: itemid}) && Times.remove({item: itemid});
		
	},
	
	itemImport: function(form) {
		console.log('trying: ');
		console.log(form);
		
		check(form, Schemas.ItemImport);
		
		var csv = Papa.parse(
			form.format + "\n" + form.data, 
			{
				quotes: true,
				delimiter: form.delimiter,
				newline: "\n",
				header: true,
				skipEmptyLines: true,
			});
		
		
		console.log('parsed csv: ');
		console.log(csv);
		
		if(csv.errors && csv.errors.length > 0) {
			throw new Meteor.Error("csv-error", csv.errors);
		}
		
		// only title, description and tags are allowed
		// if(csv.meta.fields
		
		if(csv.data) {
			csv.data.forEach(function(row) {
				console.log('reparsing a single row: ');
				console.log(row);
				
				if(!row.title) {
					console.log('skip row without title: ');
					console.log(row);
					return;
				}
				
				row.title = row.title.trim();
				
				var item = Items.findOne({
					title: row.title
				});
				
				if(item) {
					console.log('found item "'+row.title +'" with id '+ item._id);
					
				} else {
					
					item = {};
					
					item.title = row.title;
					
					if(row.description) {
						item.description = row.description.trim();
					}
					
					if(form.origin) {
						item.origin = form.origin.trim();
					}
					
					console.log('inserting item:');
					console.log(item);
					
					var itemid = Items.insert(item);
					
					item._id = itemid;
					
					console.log('created item "'+ item.title +'" with id '+ itemid);
				
				}
				
				if(row.tags) {
					var tagids = [];
					
					var tagnames = Papa.parse(
						row.tags, 
						{
							quotes: true,
							delimiter: ",",
							newline: "\n\r",
							header: false,
							skipEmptyLines: false,
						});
					console.log('found tagnames:');
					console.log(tagnames);
					
					
					if(tagnames.errors && tagnames.errors.length > 0) {
						throw new Meteor.Error("csv-errors", tagnames.errors);
					}
					
					if(tagnames.data) {
						tagnames.data[0].forEach(function(tagname) {
							console.log('reading a single tagname: '+ tagname);
							
							tagname = tagname.trim();
							var tagvalue = "";
							
							var tag = Tags.findOne({
								$and: [{
									type: "item-tag",
									name: tagname,
									value: ""
								}]
							});
							
							if(tag) {
								console.log('found tag "'+tagname+'" with id '+ tag._id);
								tagids.push(tag._id);
							} else {
								
								// split tag into name and value
								
								var tagparts;
								tagparts = tagname.split(":");
								
								if(tagparts.length == 1) {
									tagparts = tagname.split("-");
								}
								if(tagparts.length == 1) {
									tagparts = tagname.split(" ");
								}
								if(tagparts.length == 1) {
									console.log('skipping tag: ' + tagname + ' - because it can not be split into name and value');
									return;
								}
								
								tagname = tagparts[0].trim();
								tagvalue = tagparts[1].trim();
								
								tag = Tags.findOne({
									$and: [{
										type: "item-tag",
										name: tagname,
										value: tagvalue
									}]
								});
								
								if(tag) {
									console.log('found tag "'+tagname+': '+tagvalue+'" with id '+ tag._id);
									tagids.push(tag._id);
								} else {
									
									var tagid = Tags.insert({
										type: "item-tag",
										name: tagname,
										value: tagvalue,
										origin: form.origin
									});
									
									if(tagid) {
										console.log('created tag "'+tagname+': '+tagvalue+'" with id '+ tagid);
										tagids.push(tagid);
									} else {
										console.log('error during insert of tag: ' + tagname);
										return;
									}
								}
							}
						});
					}
				}
				
				if(tagids) {
					console.log('updating item: '+ item.title + ' with new tags: ' + tagids);
					console.log(tagids);
					Items.update({_id: item._id}, {$addToSet: {tags: { $each: tagids }}});
					//Items.update({_id: item._id}, {$addToSet: {tags: tagids}});
				} else {
					console.log('skip item update because no tagids were found');
				}
				
			});
			
			return true;
		} else {
			console.log('no item data found for import');
			return false;
		}
	},
	
	
	// TIMES
	
	timeInsert: function (time) {
		console.log('methods:timeInsert : '+ time.start);
		
		Schemas.Times.clean(time);
		check(time, Schemas.Times);
		return Times.insert(time);
	},
	timeUpdate: function (time, id) {
		
		console.log('methods:timeUpdate : '+ id + ' - ' + time.$set.start);
		console.log(time);
		
		check(time, Schemas.Times);
		return Times.update(id, time);
	},
	timeRemove: function (timeid) {
		console.log('methods:timeRemove : '+ timeid);
		// TODO: check if its my time entry
		return Times.remove({_id: timeid});
	},
	
	timeImport: function(form) {
		
		//throw new Meteor.Error("test", "test details");
		
		
		console.log('trying: ');
		console.log(form);
		
		check(form, Schemas.TimeImport);
		
		if(!form.dateformat) {
			form.dateformat = "DD.MM.YY HH:mm";
		}
		if(!form.delimiter) {
			form.delimiter = "	";
		}
		
		var csv = Papa.parse(
			form.format + "\n" + form.data, 
			{
				quotes: true,
				delimiter: form.delimiter,
				newline: "\n",
				header: true,
				skipEmptyLines: true,
			});
		
		
		console.log('parsed csv: ');
		console.log(csv);
		
		if(csv.errors && csv.errors.length > 0) {
			throw new Meteor.Error("csv-errors", csv.errors);
		}
		
		// only item, start and stop are allowed
		// if(csv.meta.fields
		
		if(csv.data) {
			csv.data.forEach(function(row) {
				console.log('reparsing a single row: ');
				console.log(row);
				
				if(!row.item || !row.start) {
					console.log('skip row without item or start: ');
					console.log(row);
					return;
				}
				
				row.item = row.item.trim();
				
				var item = Items.findOne({
					title: row.item
				});
				
				if(!item) {
					console.log('skip row with unknown item: "'+ item + '" - please import items first!');
					return;
				} else {
					console.log('found item "'+ row.item +'" with id '+ item._id);
					
					row.start = moment(row.start.trim(), form.dateformat).toDate();
					
					if(row.end && row.end != '') {
						row.end = moment(row.end.trim(), form.dateformat).toDate();
					}
					
					if(row.comments) {
						row.comments = row.comments.split(',');
					}
					
					var time = Times.findOne({
						item: item._id,
						createdBy: Meteor.userId(),
						start: row.start
					});
					
					if(time) {
						console.log('found time "'+ row.start +'" with id '+ time._id + ' - skipping row');
					} else {
						timeid = Times.insert({
							item: item._id,
							start: row.start,
							end: row.end,
							origin: form.origin,
							comments: row.comments
						});
						
						if(timeid) {
							console.log('created time "'+item._id+': '+row.start+'" with id '+ timeid);
							
						} else {
							console.log('error during insert of time: ' + row.start);
							return;
						}
					}
				}
			});
			
			return true;
		} else {
			console.log('no time data found for import');
			return false;
		}
	},
		
	// TAGS
	
	tagInsert: function (tag) {
		console.log('methods:tagInsert : '+ tag.name);
		/*
		console.log(tag);
		Schemas.Tags.clean(tag);
		console.log('tagInsert - after clean: ');
		console.log(tag);*/
		
		Schemas.Tags.clean(tag);
		check(tag, Schemas.Tags);
		return Tags.insert(tag);
	},
	
	tagUpdate: function (tag, id) {
		console.log('methods:tagUpdate : '+ id + ' - ' + tag.$set.name + ': '+ tag.$set.value);
		
		return false;
		//console.log(tag);
		//Schemas.Tags.clean(tag);
		check(tag, Schemas.Tags);
		
		//console.log(Meteor.userId());
		//console.log(tag);
		
		///throw new Meteor.Error("do not update tags right now :\  ");
		
		return Tags.update(id, tag);
	},
	
	tagRemove: function (tagid) {
		console.log('methods:tagRemove : '+ tagid);
		// TODO: check if its my tag entry
		return Tags.remove({_id: tagid});
	},
	
	// SEARCH
	
	openTimeWithItem: function (itemid) {
		console.log('methods:openTimeWithItem : '+ itemid);
		
		
		//Router.go(Router.path('item.detail', {_id: itemid}));
		Router.go(Router.path('time.create', {_id: itemid}));
	}
	
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