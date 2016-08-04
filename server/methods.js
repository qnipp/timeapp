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
	
	// Returns true if current user has no item with the same name - true if name is unique
	itemIsTitleUnique: function (newtitle, currentid) {
		// https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
		return !Items.findOne({
			title: newtitle, 
			ownedBy: Meteor.userId(),
			_id: {$ne: currentid }
			/*
			$or: [
				{createdBy: Meteor.userId()},
				{ownedBy: Meteor.userId()}]
				*/
		}, {fields: {_id: 1}});
		
	},
	
	timeSetEnd: function (timeid) {
		console.log('methods:timeSetEnd - '+ timeid);
		
		var time = Times.findOne(timeid);
		
		if(!time) {
			throw new Meteor.Error("not-found");
		}
		if(time.createdBy != Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		
		return Times.update(time._id, {$set: {end: new Date() }});
	},
	
	itemSetEnd: function (itemid) {
		console.log('methods:itemSetEnd - '+ itemid);
		
		var item = Items.findOne(itemid);
		
		if(!item) {
			throw new Meteor.Error("not-found");
		}
		
		// TODO: check if item's tags are shared with current user
		
		return Times.update({
				$and: [ {
					end: { $not: {$ne: null}},
					createdBy: Meteor.userId(),
					item: itemid
				} ] },
				{ $set: {end: new Date() }},
				{ multi: true }
			);
	},
	
	itemSetStart: function (itemid) {
		console.log('methods:itemSetStart - '+ itemid);
		
		var item = Items.findOne(itemid);
		
		if(!item) {
			throw new Meteor.Error("not-found");
		}
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
					createdBy: Meteor.userId(),
					item: { $in: items_for_update }
				} ] },
				{$set: {end: new Date() }},
				{ multi: true }
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
		
		if(!Meteor.call("itemIsTitleUnique", item.title, item._id)) {
			console.log('methods:itemInsert : '+ item.title + ' failed - itemIsTitleUnique not met');
			throw new Meteor.Error("notUnique", "item title is notUnique");
			return false;
		}
		
		return Items.insert(item);
	},
	itemUpdate: function (item, id) {
		console.log('methods:itemUpdate : '+ id + ' - ' + item.$set.title );
		
		check(item, Schemas.Items);
		
		if(!Meteor.call("itemIsTitleUnique", item.$set.title, id)) {
			console.log('methods:itemUpdate : '+ item.$set.title + ' failed - itemIsTitleUnique not met');
			throw new Meteor.Error("notUnique", "item title is notUnique");
			return false;
		} else {
			console.log('methods:itemInsert : '+ item.title + ' ok - itemIsTitleUnique is ok');
		}
		
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
	
	timeRunning: function(form) {
		
		console.log('trying: ');
		console.log(form);
		console.log("my user id: "+ Meteor.userId());
		
		check(form, Schemas.TimeRunning);
		
		// adding autovalues
		Schemas.TimeRunning.clean(form);
		
		// DONE: check if ID is my own timeentry
		
		return Times.update(
			{_id: form.timeId, createdBy: Meteor.userId()},
			// does nothing
			// see: http://stackoverflow.com/a/15307881/2115610
			/*
			{$set: {
				'comments.-1': {
					comment: form.comment,
					createdAt: form.createdAt
				}
			}}
			*/
			
			/*
			// does not work: 
			// Exception while invoking method 'timeRunning' MongoError: $each term takes only $slice (and optionally $sort) as complements
			{$push: {
				comments: {
					$each: [{
						comment: form.comment,
						createdAt: form.createdAt
					}],
					// prepend 
					// see: https://docs.mongodb.com/master/reference/operator/update/position/#up._S_position
					//$position: 0
					// see: http://stackoverflow.com/questions/32028472/insert-into-the-front-of-a-mongodb-document-array-without-position-and-each
					 $sort: { createdAt: -1 }
				}
			}}
			*/
			// will put comment on the end of the array
			
			{$push: {
				comments: {
					comment: form.comment,
					createdAt: form.createdAt
				}
			}}
			
		);
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
						row.commentobj = [];
						
						/*
						for (index = 0; index < a.length; ++index) {
							row.comments = {comment: }
						}*/
						
						row.comments.forEach(function(comment) {
							row.commentobj.push({comment: comment});
						});
					} else {
						row.commentobj = [];
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
							//comments: row.comments
							// "comments.$.comment" 
							comments: row.commentobj
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
	
	
	// not in use!
	timeReport: function() {
		
		
		Times.find({
			start: {
				$gte: new Date(new Date().setHours(0,0,0,0)),
				$lte: new Date(new Date().setHours(23,59,59,999))
			},
			createdBy: Meteor.userId(),
		}).map(function(doc) {
			//item.timeelapsed.today += (doc.end > 0 ? doc.end : new Date()) - doc.start;
			item.timeelapsed.today += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
			
		});
		
		/*
		totaltimes = 0; 
		Times.find({ 
			start: { 
				$gte : moment().startOf('day').toDate()
			}, 
			end: { 
				$lte : moment().weekday(moment().weekday()+1).startOf('day').toDate() 
			}, 
			createdBy: Meteor.userId() 
		}).map( function( t ) { 
			totaltimes += t.end - t.start; 
		} ); 
		//totaltimes / 60 / 60 / 1000;
		*/
			
	},
		
	// TAGS
	
	tagInsert: function (tag) {
		console.log('methods:tagInsert : '+ tag.name);
		
		Schemas.Tags.clean(tag);
		check(tag, Schemas.Tags);
		return Tags.insert(tag);
	},
	
	tagUpdate: function (tag, id) {
		console.log('methods:tagUpdate : '+ id + ' - ' + tag.$set.name + ': '+ tag.$set.value);
		
		//return false;
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
	},
	
	
	// fetchUrl
	
	fetchUrl: function (url, options, regex) {
		console.log('methods:fetchUrl : '+ url);
		
		return fetchUrl(url, options, regex);
	},
	
	
	
	// calculations
	
	doCalculations: function() {
		console.log("Total Items: " + Items.find({}).count());
		console.log("My Items: " + Items.find({createdBy: Meteor.userId()}).count());
		
		console.log("Total Times: " + Times.find({}).count());
		console.log("My Times: " + Times.find({createdBy: Meteor.userId()}).count());
		
		// go through all items
		//Items.find({_id: 'rqvj5bXJQtJL2A2go'}).map(function(doc_item) {
		Items.find({
			//_id: 'rqvj5bXJQtJL2A2go', 
			//tags: 'KwaxGTBiSybcq2d43',
			$or: [
			{ ownedBy: Meteor.userId() },
			{ ownedBy: null, createdBy: Meteor.userId() }
			]
		}).map(function(doc_item) {
			
			// will calc through all times
			//var updatedAt = moment().toDate();
			// will leave current month untouched
			var updatedAt = moment().subtract(1, 'months').startOf("month").toDate();
			var totals = {};
			
			// for each timeslot ..
			for (timeslot in CNF.timeslots) {
				
				// define timeslot
				//totals[timeslot] = {};
				
				//console.log('doing calculations for: '+ doc_item.title + ' timeslot: ' + timeslot );
				
				// timeslot: today
				Times.find({
					item: doc_item._id,
					start: CNF.timeslots[timeslot].start,
					// only count finished times - having an end time set
					end: {$ne: null},
					// only newer then update date
					createdAt: {$lte: updatedAt}
				}).map(function(doc_time) {
					
					//console.log('found item entry: '+ doc_time.start + ' by '+ doc_time.createdBy);
					
					// sum up times per user
					if(typeof totals[doc_time.createdBy] === "undefined") {
						totals[doc_time.createdBy] = {};
					}
					if(typeof totals[doc_time.createdBy][timeslot] === "undefined") {
						totals[doc_time.createdBy][timeslot] = doc_time.end - doc_time.start;
					} else {
						totals[doc_time.createdBy][timeslot] += doc_time.end - doc_time.start;
					}
				});
			}
			
			
			// resulting format: 
			// 		totals[_id of user1][today] = 123
			// 		totals[_id of user2][today] = 234
			// 		totals[_id of user1][yesterday] = 345
			
			// reformat totals
			// targeting format:
			// 		totals[0].userid = _id of user1
			// 		totals[0].today = 123
			// 		totals[0].yesterday = 345
			// 		totals[1].userid = _id of user2
			// 		totals[1].today = 234
			
			// reset totals for this item
			doc_item.totals = [];
			
			for (userid in totals) {
				
				// totals[userid].today = 123; this shold already be there
				
				totals[userid].userid = userid;
				//totals[userid].updatedAt = updatedAt;
				
				doc_item.totals.push( totals[userid] );
			}
			
			console.log('updating doc_item._id: ' + doc_item._id +' - ' + 
				' totalsUpdatedAt: '+ updatedAt + 
				' title: ' + doc_item.title +
				' using:');
			console.log(doc_item.totals);
			
			// updating current using new totals
			return Items.update(doc_item._id, {
				$set: {
					ownedBy: doc_item.ownedBy, 
					totals: doc_item.totals, 
					totalsUpdatedAt: updatedAt
				},
				//$unset: {totals: "", totalsUpdatedAt: ""}
			});
		});
		
		
		/*
		Times.find({
			createdBy: Meteor.userId(),
		}).map(function(doc) {
			//item.timeelapsed.today += (doc.end > 0 ? doc.end : new Date()) - doc.start;
			item.timeelapsed.today += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
			
		});
		
		
		*/
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