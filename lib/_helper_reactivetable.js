
tableSettingsItemsFieldFn = function(timeslot, peritem) {
	
	return {
		key: "time"+timeslot,
		label: CNF.timeslots[timeslot].label, 
		fn: function(value, item, key) {
			
			var timeelapsed = 0;
			
			if(peritem) {
				timeelapsed = getTimeslotValueFromTotals(item.totals, Meteor.userId(), timeslot);
				
				Times.find({
					createdBy: Meteor.userId(),
					item: item._id,
					start: CNF.timeslots[timeslot].start
				}).map(function(doc) {
					//timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
					
				});
				
			} else {
				
				var query = {};
				query["totals.userid"] = Meteor.userId();
				query["totals."+timeslot] = {$gt: 0};
				
				var fields = {};
				fields["totals.userid"] = 1;
				fields["totals."+timeslot] = 1;
				
				Items.find(query, { fields: fields }).map(function(item) {
					timeelapsed += getTimeslotValueFromTotals(item.totals, Meteor.userId(), timeslot);
				} );
				
				Times.find({
					createdBy: Meteor.userId(),
					start: CNF.timeslots[timeslot].start
				}).map(function(doc) {
					//timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
				});
			}
			
			return formatDuration(timeelapsed, true);
			
		},
		sortable: false,
			
	};
};


tableSettingsTagsFieldFn = function(timeslot) {
	return {
		key: "time"+timeslot,
		label: CNF.timeslots[timeslot].label, 
		fn: function(value, tag, key) {
			
			var timeelapsed = 0;
			
			if(tag.type = "item-tag") {
				Items.find({tags: tag._id}).map(function(item) {
					
					timeelapsed += getTimeslotValueFromTotals(item.totals, Meteor.userId(), timeslot);
					
					Times.find({
						createdBy: Meteor.userId(),
						item: item._id,
						start: CNF.timeslots[timeslot].start
					}).map(function(doc) {
						//timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
						timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
					});
				});
				
			} else if (tag.type = "time-tag") {
				
				// TODO: if we dont have a single item, we need to sum up all items :\
				// TODO: time-tags are broken :(
				
				Times.find({
					createdBy: Meteor.userId(),
					tags: tag._id,
					start: CNF.timeslots[timeslot].start
				}).map(function(doc) {
					//timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
				});
			}
			
			return formatDuration(timeelapsed, true);
		},
		sortable: false,
	};
};



// route: report, tags - sum of times per tag
tableSettingsTags = function () {
	
	
	var fields = [];
	
	fields.push({
		key: 'name', 
		label: 'Tag', 
		tmpl: Template.taglistentryItem,
		fn: function(value, tag, key) {
			//var item = loadItem(time.item, false, null);
			return tag;
		},
		sortByValue: true,
		sortable: true,
	});
	
	for(var key in CNF.timeslots) {
		if(CNF.timeslots[key].usage != 'normal') continue;
		fields.push(tableSettingsTagsFieldFn(key));
	}
	
	return {
		rowsPerPage: 100,
		showFilter: true,
		showNavigation: 'auto',
		//fields: ['item', 'start', 'end', 'duration'],
		rowClass: function(tag) {
			return tag._id == this._id ? 'info' : '';
		},
		fields: fields
	};
};

// route: tags, items - sum of times per item
tableSettingsItems = function () {
	
	var fields = [];
	
	fields.push({
		key: 'name',
		label: 'Item',
		tmpl: Template.itemlistentryItem,
		/*
		fn: function(value, item, key) {
			//var item = loadItem(time.item, false, null);
			return item;
		},*/
		sortByValue: true,
		sortable: true,
	});
	
	for(var key in CNF.timeslots) {
		if(CNF.timeslots[key].usage != 'normal') continue;
		fields.push(tableSettingsItemsFieldFn(key, true));
	}
	
	return {
		rowsPerPage: 100,
		showFilter: true,
		showNavigation: 'auto',
		rowClass: function(item) {
			return item._id == this._id ? 'info jsitemload' : 'jsitemload';
		},
		fields: fields
	};
};


// route: route - sum of all times in total
tableSettingsTotal = function () {
	
	var fields = [];
	
	fields.push({
		key: 'user',
		label: 'User',
		sortByValue: false,
		sortable: false,
		fn: function(value, user, key) {
			if(Meteor.users.findOne({_id: user._id}).emails) {
				return Meteor.users.findOne({_id: user._id}).emails[0].address;
			} else {
				return 'unknown';
			}
		}
	});
	
	for(var key in CNF.timeslots) {
		if(CNF.timeslots[key].usage != 'normal') continue;
		fields.push(tableSettingsItemsFieldFn(key, false));
	}
	
	return {
		rowsPerPage: 1,
		showFilter: false,
		showNavigation: 'never',
		/*
		rowClass: function(item) {
			return item._id == this._id ? 'info' : '';
		},
		*/
		fields: fields 
	};
};

// route: route - sum of all times per month
tableSettingsPerMonth = function () {
	
	var fields = [];
	
	fields.push({
		key: 'user',
		label: 'User',
		sortByValue: false,
		sortable: false,
		fn: function(value, user, key) {
			if(Meteor.users.findOne({_id: user._id}).emails) {
				return Meteor.users.findOne({_id: user._id}).emails[0].address;
			} else {
				return 'unknown';
			}
		}
	});
	
	for(var key in CNF.timeslots) {
		if(CNF.timeslots[key].usage != 'report') continue;
		fields.push(tableSettingsItemsFieldFn(key, false));
	}
	
	return {
		rowsPerPage: 1,
		showFilter: false,
		showNavigation: 'never',
		/*
		rowClass: function(item) {
			return item._id == this._id ? 'info' : '';
		},
		*/
		fields: fields 
	};
};

// route: times - list of all time entries
tableSettingsTime = function () {
	return {
		rowsPerPage: 20,
		showFilter: true,
		showNavigation: 'auto',
		rowClass: function(item) {
			return item._id == this._id ? 'info jstimeload' : 'jstimeload';
		},
		fields: [
			{ 
				key: 'item', 
				label: 'Item', 
				
				//tmpl: Template.timelistentryItem,
				
				fn: function(value, time, key) {
					// value == time.item
					var item = loadItem(value, false, null);
				
					if(item) {
						return new Spacebars.SafeString(
							'<span>'+ item.title +' </span>'+
							'<small>'+ item.description +'</small>');
					} else {
						return "Loading item: "+ value;
					}
				},
				sortByValue: true,
				sortable: false,
			},
			{ 
				key: 'start', 
				label: 'Start', 
				
				//tmpl: Template.timelistentryStart,
				
				fn: function(value, time, key) {
					if(time.start) {
						//time.start_fmt = moment.utc(time.start).format(CNF.FORMAT_DATETIME);
						time.start_fmt = moment(time.start).format(CNF.FORMAT_DATETIME);
					}
					return time.start_fmt;
				},
				sortByValue: true,
				sortOrder: 1, 
				sortDirection: 'descending',
			},
			{ 
				key: 'end', 
				label: 'End', 
				//tmpl: Template.timelistentryEnd,
				
				fn: function(value, time, key) {
					if(time.end) {
						//time.end_fmt = moment.utc(time.end).format(CNF.FORMAT_DATETIME);
						time.end_fmt = moment(time.end).format(CNF.FORMAT_DATETIME);
					} else {
						time.end_fmt = '';
					}
					return time.end_fmt;
				},
				sortByValue: true,
				
				sortOrder: 2, 
				sortDirection: 'descending', 
			},
			{ 
				key: 'duration', 
				label: 'duration', 
				//tmpl: Template.timelistentryDuration,
				
				fn: function(value, time, key) {
					if(time.end) {
						time.duration_fmt = formatDuration(time.end - time.start);
					} else {
						//time.duration_fmt = formatDuration(new Date() - time.start);
						time.duration_fmt = formatDuration(reactiveDate() - time.start);
					}
					return time.duration_fmt;
				},
				
				//sortByValue: true,
				sortable: false,
			},
			{ 
				key: 'comments', 
				label: 'Comments',
				
				fn: function(value, time, key) {
					if(!value) return;
					return value.map(function(comment) {return comment.comment; }).join(", ");
				},
				
				//sortByValue: true,
				sortable: false,
			},
			{ 
				key: 'createdAt', 
				label: 'Created At', 
				hidden: true,
				sortOrder: 0, 
				sortDirection: 'descending',
			},
		],
	};
};