// function functionname() 			.. scope: file
// var functionname = function() 	.. scope: file
// function name = function()		.. scope: global

CNF = {};
CNF.FORMAT_DATETIME = 'DD.MM.YYYY HH:mm';
//CNF.FORMAT_TIMEFRAME = 'd[d] H[h] m[m] s[s]';



loadItem = function ( item, cbMethod) {
	
	console.log("global loadItem - call: "+ item);
	
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
				itemupper = Items.findOne({_id: hierarchyelement.upperitem}, {fields: {title: 1}});
				
				if(itemupper) {
					// concat title to path
					item_currentid = hierarchyelement.upperitem;
					item.path = item.path + itemupper.title + '/';
				}
			}
		// go up through hierarchy until root element
		} while (itemupper && hierarchyelement);
		
		
		if(item.tags) {
			item.tags = item.tags.map(function(tagid) {
				//console.log('searching tags for tagid: ' + tagid);
				if(typeof tagid === "string") {
					return Tags.findOne({_id: tagid});
				} else {
					return tagid;
				}
			});
		}
		
		
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

loadTag = function( tag, cbMethod) {
	tag.color_name = intToARGB(hashCode(tag.name ));
	tag.color_value = intToARGB(hashCode(tag.value ));
	
	// unique color
	tag.color = intToARGB(hashCode(tag.name + tag.value ));
	
	return tag;
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



// make String to colorcode.
// see: http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
// usage: alert(intToARGB(hashCode("Carrots, sdfsdfraw")))

hashCode = function (str) { 
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}
intToRGB = function (i){
    return ("00"+((i>>16)&0xFF).toString(16)).slice(-2) + 
           ("00"+((i>>8)&0xFF).toString(16)).slice(-2) + 
           ("00"+(i&0xFF).toString(16)).slice(-2);
}
intToARGB = function (i){
    return ("00"+((i>>24)&0xFF).toString(16)).slice(-2) + 
           ("00"+((i>>16)&0xFF).toString(16)).slice(-2) + 
           ("00"+((i>>8)&0xFF).toString(16)).slice(-2) + 
           ("00"+(i&0xFF).toString(16)).slice(-2);
}




// color management - make text-color readable on background color
// see: http://stackoverflow.com/questions/9600295/automatically-change-text-color-to-assure-readability
// usage: alert(invertCssColor('#'+intToARGB(hashCode("Carrots, sdfsdfraw"))))

invertCssColor = function (color) {
	var rgb = invertColor(hexColor2rgb(color));
	return rgb2hexColor(rgb);
}

invertColor = function (rgb) {
	var yuv = rgb2yuv(rgb);
	var factor = 180; // 90 
	var threshold = 100;
	yuv.y = clamp(yuv.y + (yuv.y > threshold ? -factor : factor));
	return yuv2rgb(yuv);
}

rgb2hexColor = function (rgb) {
	return '#' + dec2hex(rgb.r) + dec2hex(rgb.g) + dec2hex(rgb.b);
}

hexColor2rgb = function (color) {
	color = color.substring(1); // remove #
	return {
		r: parseInt(color.substring(0, 2), 16),
		g: parseInt(color.substring(2, 4), 16),
		b: parseInt(color.substring(4, 6), 16)
	};
}

rgb2hexColor = function (rgb) {
	return '#' + dec2hex(rgb.r) + dec2hex(rgb.g) + dec2hex(rgb.b);
}

dec2hex = function (n) {
	var hex = n.toString(16);
	if (hex.length < 2) {
		return '0' + hex;
	}
	return hex;
}

rgb2yuv = function (rgb){
	var y = clamp(rgb.r *  0.29900 + rgb.g *  0.587   + rgb.b * 0.114);
	var u = clamp(rgb.r * -0.16874 + rgb.g * -0.33126 + rgb.b * 0.50000 + 128);
	var v = clamp(rgb.r *  0.50000 + rgb.g * -0.41869 + rgb.b * -0.08131 + 128);
	return {y:y, u:u, v:v};
}

yuv2rgb = function (yuv){
	var y = yuv.y;
	var u = yuv.u;
	var v = yuv.v;
	var r = clamp(y + (v - 128) *  1.40200);
	var g = clamp(y + (u - 128) * -0.34414 + (v - 128) * -0.71414);
	var b = clamp(y + (u - 128) *  1.77200);
	return {r:r,g:g,b:b};
}
	
clamp = function (n){
	if (n<0) { return 0;}
	if (n>255) { return 255;}
	return Math.floor(n);
}




