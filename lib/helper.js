// function functionname() 			.. scope: file
// var functionname = function() 	.. scope: file
// function name = function()		.. scope: global

CNF = {};
CNF.FORMAT_DATETIME = 'DD.MM.YYYY HH:mm';
//CNF.FORMAT_TIMEFRAME = 'd[d] H[h] m[m] s[s]';



loadItem = function ( item, cbMethod) {
	
	//console.log("global loadItem - call: "+ item);
	
	// if called with itemid
	if(typeof item === 'string' && item !== '') {
		item =  Items.findOne({_id: item});
	}
	
	if(item && item._id) {
		
		// add path for given item
		item.path = '/';
		var hierarchyelement = '';
		var itemupper = null;
		var item_currentid = item._id;
		
		do {
			hierarchyelement = Hierarchy.findOne({loweritem: item_currentid}, {fields: {upperitem: 1}});
			
			// if hierarchy is found - load upperelement
			if (hierarchyelement) {
				
				// load title
				itemupper = Hierarchy.findOne({_id: hierarchyelement.upperitem}, {fields: {title: 1}});
				
				if(itemupper) {
					// concat title to path
					item_currentid = hierarchyelement.upperitem;
					item.path = item.path + itemupper.title + '/';
				}
			}
		// go up through hierarchy until root element
		} while (itemupper && hierarchyelement);
		
		
		// add elapse time for given item
		item.timeelapsed = {};
		item.timeelapsed.total = 0;
		item.timeelapsed.today = 0;
		
		// TODO - other current timeframes
		item.timeelapsed.week = 0;
		item.timeelapsed.month = 0;
		item.timeelapsed.year = 0;
		
		// aggregate is only available on server
		if(Meteor.isServer) {
			
			// sum all matching elements by: (end - start)  or  (Date - start)
			var group_modifier = {
				$group: {
					_id: null,
					total: { $sum: { $cond: [ { $gt: [ "$end", 0 ] }, 
						{  $subtract: [ "$end", "$start" ] }, 
						{  $subtract: [ new Date(), "$start" ] } ] }},
					emptycount: {$sum: { $cond: [ { $gt: [ "$end", 0 ] }, 0, 1 ] }}
				}};
			
			// elements having start today
			item.timeelapsed.today = Times.aggregate([
				{ $match: {
					item: item._id,
					start: {
						$gte: new Date(new Date().setHours(0,0,0,0)),
						$lte: new Date(new Date().setHours(23,59,59,999))
					}
				}}, group_modifier
			]);
			
			// all elements
			item.timeelapsed.total = Times.aggregate([
				{ $match: {
					item: item._id
				}}, group_modifier
			]);
			
		} else {
			
			// elements having start today
			Times.find({
				item: item._id,
				start: {
					$gte: new Date(new Date().setHours(0,0,0,0)),
					$lte: new Date(new Date().setHours(23,59,59,999))
				}
			}).map(function(doc) {
				item.timeelapsed.today += (doc.end > 0 ? doc.end : new Date()) - doc.start;
			});
			
			// all elements
			Times.find({
				item: item._id
			}).map(function(doc) {
				item.timeelapsed.total += (doc.end > 0 ? doc.end : new Date()) - doc.start;
			});
			
			/*
			item.timeelapsed.total = 
				_.reduce(
					_.map(
						Times.find({
							item: item._id,
							start: {
								$gte: new Date(new Date().setHours(0,0,0,0)),
								$lte: new Date(new Date().setHours(23,59,59,999))
							}
						}).fetch(),
						function(doc) {
							//map
							return Times.findOne().end - Times.findOne().start;
						}
					), 
					function(memo, num) {
						//reduce
						return memo + num;
					}
				);
			*/
		}
		
		//item.timeelapsed.today = moment.duration(item.timeelapsed.today).humanize(); //.format(CNF.FORMAT_TIMEFRAME);
		//item.timeelapsed.total = moment.duration(item.timeelapsed.total).humanize();
		//item.timeelapsed.total = moment(item.timeelapsed.total).format(CNF.FORMAT_TIMEFRAME);
		item.timeelapsed.today = formatDuration(item.timeelapsed.today);
		item.timeelapsed.total = formatDuration(item.timeelapsed.total);
		
		// check if this item has an running time element
		item.isRunning = Times.findOne({
			item: item._id,
			end: {
				$not: {$ne: null}
			}
		}) ? true : false;
	}
		
	return item;
}


formatDuration = function (timeelapsed, cbMethod) {
	
	if(timeelapsed <= 0) {
		return "-";
	} else {
		var timeduration = '';
		
		// cut off milliseconds
		timeelapsed = timeelapsed / 1000;
		
		if(Math.floor(timeelapsed / (60*60*24)) > 0) {
			timeduration += Math.floor(timeelapsed / (60*60*24)) + "d ";
			timeelapsed = timeelapsed % (60*60*24);
		}
		if(Math.floor(timeelapsed / (60*60)) > 0) {
			timeduration += Math.floor(timeelapsed / (60*60)) + "h ";
			timeelapsed = timeelapsed % (60*60);
		}
		if(Math.floor(timeelapsed / 60) > 0) {
			timeduration += Math.floor(timeelapsed / 60) + "m ";
			timeelapsed = timeelapsed % 60;
		}
		
		if(timeelapsed > 0) {
			timeduration += Math.floor(timeelapsed) + "s";
		}
		
		return timeduration.trim();
	}
	
}