

tableSettingsTags = function () {
	return {
		//collection: times,
		/*
		collection: function() {
			console.log('tableSettingsTime - access to collection.find.');
			return Times.find({},  {sort: {createdAt: -1}});
		},*/
		rowsPerPage: 100,
		showFilter: true,
		showNavigation: 'auto',
		//fields: ['item', 'start', 'end', 'duration'],
		rowClass: function(tag) {
			return tag.id == this.id ? 'info' : '';
		},
		fields: [
		/*
			{ 
				key: 'name', 
				label: 'Tag Name', 
				hidden: false,
				sortOrder: 0, 
				sortDirection: 'ascending',
			},
			{ 
				key: 'value', 
				label: 'Tag Value', 
				hidden: false,
				sortOrder: 0, 
				sortDirection: 'ascending',
			},*/
			{ 
				key: 'name', 
				label: 'Tag', 
				
				tmpl: Template.taglistentryItem,
				
				fn: function(value, tag, key) {
					//var item = loadItem(time.item, false, null);
					return tag;
				},
				sortByValue: true,
				sortable: true,
			},
			
			{
				key: 'timetoday', 
				label: 'Today', 
				fn: function(value, tag, key) {
					
					var timeelapsed = 0;
					
					if(tag.type = "item-tag") {
						Items.find({tags: tag._id}).map(function(item) {
							Times.find({
								item: item._id,
								start: {
									$gte: new Date(new Date().setHours(0,0,0,0)),
									$lte: new Date(new Date().setHours(23,59,59,999))
								}
							}).map(function(doc) {
								timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
							});
						});
						
					} else if (tag.type = "time-tag") {
						// TODO
					}
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timeweek', 
				label: 'this Week', 
				fn: function(value, tag, key) {
					
					var timeelapsed = 0;
					
					var firstDayofWeek = new Date().getDate() - new Date().getDay(); // will be sunday;
					firstDayofWeek += 1; // will be monday
					
					if(tag.type = "item-tag") {
						Items.find({tags: tag._id}).map(function(item) {
							Times.find({
								item: item._id,
								start: {
									$gte: new Date(new Date(new Date().setDate(firstDayofWeek  )).setHours(0,0,0,0     )),
									$lte: new Date(new Date(new Date().setDate(firstDayofWeek+6)).setHours(23,59,59,999))
								}
							}).map(function(doc) {
								timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
							});
						});
						
					} else if (tag.type = "time-tag") {
						// TODO
					}
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timeweekprev', 
				label: 'previous Week', 
				fn: function(value, tag, key) {
					
					var timeelapsed = 0;
					
					var firstDayofWeek = new Date().getDate() - new Date().getDay(); // will be sunday;
					firstDayofWeek += 1; // will be monday
					
					if(tag.type = "item-tag") {
						Items.find({tags: tag._id}).map(function(item) {
							Times.find({
								item: item._id,
								start: {
									$gte: new Date(new Date(new Date().setDate(firstDayofWeek - 7)).setHours(0,0,0,0     )),
									$lte: new Date(new Date(new Date().setDate(firstDayofWeek - 1)).setHours(23,59,59,999))
								}
							}).map(function(doc) {
								timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
							});
						});
						
					} else if (tag.type = "time-tag") {
						// TODO
					}
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timemonth', 
				label: 'this Month', 
				fn: function(value, tag, key) {
					
					var timeelapsed = 0;
					
					if(tag.type = "item-tag") {
						Items.find({tags: tag._id}).map(function(item) {
							Times.find({
								item: item._id,
								start: {
									$gte: new Date(new Date(new Date().setDate(1)).setHours(0,0,0,0     )),
									$lte: new Date(new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)).setHours(23,59,59,999))
								}
							}).map(function(doc) {
								timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
							});
						});
						
					} else if (tag.type = "time-tag") {
						// TODO
					}
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timemonthprev', 
				label: 'previous Month', 
				fn: function(value, tag, key) {
					
					var timeelapsed = 0;
					
					if(tag.type = "item-tag") {
						Items.find({tags: tag._id}).map(function(item) {
							Times.find({
								item: item._id,
								start: {
									$gte: new Date(new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(1)).setHours(0,0,0,0     )),
									$lte: new Date(new Date(new Date().setDate(0)).setHours(23,59,59,999))
								}
							}).map(function(doc) {
								timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
							});
						});
						
					} else if (tag.type = "time-tag") {
						// TODO
					}
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timetotal', 
				label: 'Total', 
				fn: function(value, tag, key) {
					
					var timeelapsed = 0;
					
					if(tag.type = "item-tag") {
						Items.find({tags: tag._id}).map(function(item) {
							Times.find({
								item: item._id
							}).map(function(doc) {
								timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
							});
						});
						
					} else if (tag.type = "time-tag") {
						// TODO
					}
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			}
		],
	};
};

tableSettingsItems = function () {
	return {
		//collection: times,
		/*
		collection: function() {
			console.log('tableSettingsTime - access to collection.find.');
			return Times.find({},  {sort: {createdAt: -1}});
		},*/
		rowsPerPage: 100,
		showFilter: true,
		showNavigation: 'auto',
		//fields: ['item', 'start', 'end', 'duration'],
		rowClass: function(item) {
			return item.id == this.id ? 'info' : '';
		},
		fields: [
			{ 
				key: 'name', 
				label: 'Item', 
				
				tmpl: Template.itemlistentryItem,
				
				fn: function(value, item, key) {
					//var item = loadItem(time.item, false, null);
					return item;
				},
				sortByValue: true,
				sortable: true,
			},
			
			{
				key: 'timetoday', 
				label: 'Today', 
				fn: function(value, item, key) {
					
					var timeelapsed = 0;
					
					Times.find({
						item: item._id,
						start: {
							$gte: new Date(new Date().setHours(0,0,0,0)),
							$lte: new Date(new Date().setHours(23,59,59,999))
						}
					}).map(function(doc) {
						timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					});
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timeweek', 
				label: 'this Week', 
				fn: function(value, item, key) {
					
					var timeelapsed = 0;
					
					var firstDayofWeek = new Date().getDate() - new Date().getDay(); // will be sunday;
					firstDayofWeek += 1; // will be monday
					
					Times.find({
						item: item._id,
						start: {
							$gte: new Date(new Date(new Date().setDate(firstDayofWeek  )).setHours(0,0,0,0     )),
							$lte: new Date(new Date(new Date().setDate(firstDayofWeek+6)).setHours(23,59,59,999))
						}
					}).map(function(doc) {
						timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					});
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timeweekprev', 
				label: 'previous Week', 
				fn: function(value, item, key) {
					
					var timeelapsed = 0;
					
					var firstDayofWeek = new Date().getDate() - new Date().getDay(); // will be sunday;
					firstDayofWeek += 1; // will be monday
					
					Times.find({
						item: item._id,
						start: {
							$gte: new Date(new Date(new Date().setDate(firstDayofWeek - 7)).setHours(0,0,0,0     )),
							$lte: new Date(new Date(new Date().setDate(firstDayofWeek - 1)).setHours(23,59,59,999))
						}
					}).map(function(doc) {
						timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					});
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timemonth', 
				label: 'this Month', 
				fn: function(value, item, key) {
					
					var timeelapsed = 0;
					
					Times.find({
						item: item._id,
						start: {
							$gte: new Date(new Date(new Date().setDate(1)).setHours(0,0,0,0     )),
							$lte: new Date(new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)).setHours(23,59,59,999))
						}
					}).map(function(doc) {
						timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					});
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timemonthprev', 
				label: 'previous Month', 
				fn: function(value, item, key) {
					
					var timeelapsed = 0;
					
					Times.find({
						item: item._id,
						start: {
							$gte: new Date(new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(1)).setHours(0,0,0,0     )),
							$lte: new Date(new Date(new Date().setDate(0)).setHours(23,59,59,999))
						}
					}).map(function(doc) {
						timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					});
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			},
			{
				key: 'timetotal', 
				label: 'Total', 
				fn: function(value, item, key) {
					
					var timeelapsed = 0;
					
					Times.find({
						item: item._id
					}).map(function(doc) {
						timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					});
					
					return formatDuration(timeelapsed, true);
				},
				sortable: false,
			}
		],
	};
};

tableSettingsTime = function () {
	return {
		//collection: times,
		/*
		collection: function() {
			console.log('tableSettingsTime - access to collection.find.');
			return Times.find({},  {sort: {createdAt: -1}});
		},*/
		rowsPerPage: 20,
		showFilter: true,
		showNavigation: 'auto',
		//fields: ['item', 'start', 'end', 'duration'],
		rowClass: function(item) {
			return item.id == this.id ? 'info' : '';
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
						time.duration_fmt = formatDuration(new Date() - time.start);
					}
					return time.duration_fmt;
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