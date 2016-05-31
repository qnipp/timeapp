// function functionname() 			.. scope: file
// var functionname = function() 	.. scope: file
// function name = function()		.. scope: global

CNF = {};
CNF.FORMAT_DATETIME = 'DD.MM.YYYY HH:mm';
CNF.FORMAT_TIMEFRAME_LONG = 'd[d] h[h] m[m] s[s]';
//CNF.FORMAT_TIMEFRAME_LONG = '%sd %sh %sm %ss';
CNF.FORMAT_TIMEFRAME_SHORT = 'H:M';
//CNF.FORMAT_TIMEFRAME_SHORT = '%s:%s:%s';

CNF.APPNAME = "TimeApp";



/*
 * example call: 
 * 	loadItem(itemid, false, null); -- no details 
 *  loadItem(item, {all: true}, null);  -- all details (including tags, times, is running flag)
 * 
*/
loadItem = function ( item, details, cbMethod) {
	//console.log("global loadItem - call: "+ (typeof item === 'string' ? item : item._id +' '+ item.title));
	//console.log("called from: " + arguments.callee.caller.toString());
	
	// if called with itemid
	if(typeof item === 'string' && item !== '') {
		
		//console.log("global loadItem - going to find item: "+ item);
		//founditem =  Items.findOne({_id: item});
		founditem =  Items.find({_id: item}, {limit: 1});
		
		// it seems this does not work with findone.
		if(founditem) {
			founditem = founditem.fetch();
			if(founditem) {
				item = founditem[0];
			}
		} else {
			console.warn('global loadItem - could not find item with _id: '+ item);
		}
	}
	
	if(!details) {
		return item;
	}
	
	if(item && item._id) {
		
		/*
		if(details.path || details.all) {
			
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
		}
		*/
		
		
		if(details.tags || details.all) {
			
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
		}
		
		
		if(details.times || details.all) {
			
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
					//item.timeelapsed.today += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					item.timeelapsed.today += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
					
				});
				
				// all elements
				Times.find({
					item: item._id
				}).map(function(doc) {
					//item.timeelapsed.total += (doc.end > 0 ? doc.end : new Date()) - doc.start;
					item.timeelapsed.total += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
				});
				
				/*
				 // another way that didn't work out :
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
		}
		
		/*
		if(details.running || details.all) {
			
			// check if this item has an running time element
			item.isRunning = Times.findOne({
				item: item._id,
				createdBy: Meteor.userId(),
				end: {
					$not: {$ne: null}
				}
			}, {limit: 1, fields: {_id: 1}}) ? true : false;
			
		}
		*/
	}
		
	return item;
}

loadTag = function( tag, cbMethod) {
	
	tag.color = {};
	tag.color.bgname = '#'+intToRGB(hashCode( tag.name ) );
	tag.color.bgvalue = '#'+intToRGB(hashCode( tag.value ) );
	
	tag.color.fgname = invertCssColor( tag.color.bgname );
	tag.color.fgvalue = invertCssColor( tag.color.bgvalue );
	
	/*
	tag.color_name = intToARGB(hashCode(tag.name ));
	tag.color_value = intToARGB(hashCode(tag.value ));
	
	// unique color
	tag.color = intToARGB(hashCode(tag.name + tag.value ));
	*/
	
	return tag;
}


formatDuration = function (timeelapsed, shorten, cbMethod) {
	
	if(timeelapsed <= 0) {
		return "-";
	} else {
		var timeduration = '';
		
		if (shorten == null) {
			shorten = false;
		}
		
		var d = 0, h = 0, m = 0, s = 0;
			
		// cut off milliseconds
		timeelapsed = timeelapsed / 1000;
		
		if(!shorten && Math.floor(timeelapsed / (60*60*24)) > 0) {
			d = Math.floor(timeelapsed / (60*60*24));
			
			//timeduration += d + "d ";
			timeelapsed = timeelapsed % (60*60*24);
		}
		
		if(Math.floor(timeelapsed / (60*60)) > 0) {
			h = Math.floor(timeelapsed / (60*60));
			//timeduration += h + "h ";
			timeelapsed = timeelapsed % (60*60);
		}
		if(Math.floor(timeelapsed / 60) > 0) {
			m = Math.floor(timeelapsed / 60);
			//timeduration += m + "m ";
			timeelapsed = timeelapsed % 60;
		}
		
		if(!shorten && timeelapsed > 0) {
			s = Math.floor(timeelapsed);
			//timeduration += s + "s";
		}
		
		if(!shorten) {
			timeduration = CNF.FORMAT_TIMEFRAME_LONG;
		} else {
			timeduration = CNF.FORMAT_TIMEFRAME_SHORT;
		}
		
		if(d > 0) {
			timeduration = timeduration.replace(/d(?![^\[]*\])/, d);
			timeduration = timeduration.replace(/D(?![^\[]*\])/, d < 10 ? '0'+d : d);
		} else {
			timeduration = timeduration.replace(/d/ig, '');
		}
		
		if(shorten || h > 0) {
			timeduration = timeduration.replace(/h(?![^\[]*\])/, h);
			timeduration = timeduration.replace(/H(?![^\[]*\])/, h < 10 ? '0'+h : h);
		} else {
			timeduration = timeduration.replace(/h/ig, '');
		}
		
		if(shorten || m > 0) {
			timeduration = timeduration.replace(/m(?![^\[]*\])/, m);
			timeduration = timeduration.replace(/M(?![^\[]*\])/, m < 10 ? '0'+m : m);
		} else {
			timeduration = timeduration.replace(/m/ig, '');
		}
		
		if(shorten || s > 0) {
			timeduration = timeduration.replace(/s(?![^\[]*\])/, s);
			timeduration = timeduration.replace(/S(?![^\[]*\])/, s < 10 ? '0'+s : s);
		} else {
			timeduration = timeduration.replace(/s/ig, '');
		}
		
		timeduration = timeduration.replace(/[\[\]]*/g, '');
		
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

// HTTP Functions

fetchUrl = function(url, cbMethod) {
	console.log("global fetchUrl - call: "+ url + " - isClient: "+ Meteor.isClient);

	check(url, String);
	
	if (Meteor.isClient) {
	
		HTTP.call( 'GET', url, {}, function( error, response ) {
		  if ( error ) {
		    console.log( "error:" +  error );
		  } else {
		    console.log( response );
		    /*
		     This will return the HTTP response object that looks something like this:
		     {
		       content: "String of content...",
		       data: Array[100], <-- Our actual data lives here. 
		       headers: {  Object containing HTTP response headers }
		       statusCode: 200
		     }
		    */
		  }
		  cbMethod(error, response);
		});
		
		return true;
		
	}
	else if (Meteor.isServer) {
		
		//this.unblock();
		
	  try {
	    var result = 
				HTTP.call("GET", url, {
					timeout: 2000,
					followRedirects: true,
				}/*, function (error, result) {
            if (!error) {
              result.content
            }
        }*/);
        
      console.log("status from fetchWebsite: "+ result.statusCode);
      
      if(result.statusCode == 200) {
      
      	var t, d;
      	
      	var reg = /<title[^>]*>(.*?)<\/title>/i;
      	t = reg.exec(result.content);
      	if(t) {
      		t = t[1];
      	}
      	
      	reg = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i;
      	d = reg.exec(result.content);
      	if(d) {
      		d = d[1];
      	}
      	
      	//<meta name=\"description\" content=\"Ich bin Software Entwickler und ich möchte mich an dieser Stelle bei Ihnen vorstellen.\" /> \
      	//$('.commit-title').text().trim()
				//$.parseHTML(result.content
				/*
				console.log("parsing data ..");
				var div = document.createElement('div');
				console.log("parsing data ...");
				div.innerHTML = result.content;
				var newdoc = div.childNodes;
				console.log("parsing data ....");

				console.log("result from fetchWebsite: "+ newdoc.title);
				*/
				
				console.log("result from fetchUrl: "+ t + " desc: "+ d);
				
				
				return {
					description: d, //$(result.content).find('meta[name=description]').attr("content"),
					title: t, //$(result.content).find('title')
					content: result.content
					};
					
			} else {
				console.log("Response issue: ", result.statusCode);
				var errorJson = JSON.parse(result.content);
				throw new Meteor.Error(result.statusCode, errorJson.error);
			}
			
	    return false;
	  } catch (e) {
	    // Got a network error, time-out or HTTP error in the 400 or 500 range
	    console.log("exception from http get: ");
	    console.log(e);
	    return false;
	  }
	}
}

parseUrlResponse = function(html, cbMethod) {
	var reg;
	
	reg = /<a class="issue-link"[^>]*>(.*?)<\/a>/;
	var ticketid = reg.exec(html);
	
	if(ticketid) {
		ticketid = ticketid[1];
	}
	
	reg = /<h1 id="summary-val"[^>]*>(.*?)<\/h1>/;
	var title = reg.exec(html);
	if(title) {
		title = title[1];
	}
	
	return {
			title: ticketid +" "+ title, 
			description: title
	};
}



// select2Options

formatTagResult = function (state) {
	if (!state.id) { return state.name; }
	
	var tag = Tags.findOne({_id: state.id});
	tag = loadTag(tag);
	
	
	return Blaze.toHTMLWithData(Template.taginputentry, {tag: tag});
	/*
	var $state = $(
		'<li role="presentation" class="small">'+
		'	<button class="btn btn-primary" type="button" style="background-color: '+ tag.color.bgname + '; color: '+ tag.color.fgname + ';">'+
		tag.name +
		'		<span class="badge" style="background-color: '+ tag.color.bgvalue +'; color: '+ tag.color.fgvalue +';">'+ tag.value +'</span>'+
		'	</button>'+
		'</li>'
	);
	return $state;
	*/
};

formatItemResult = function (state) {
	if (!state.id) { return state.name; }
	
	var item = Items.findOne({_id: state.id});
	//item = loadItem(time.item, {all: true}, null);
	item = loadItem(item, false, null);
	
	return Blaze.toHTMLWithData(Template.iteminputentry, {item: item});
};



// reactive times

// see: http://stackoverflow.com/questions/25301149/momentjs-in-meteor-reactivity

/*
fromNowReactive = function (mmt) {
  timeTick.depend();
  //return mmt.fromNow();
  return formatDuration( moment() - mmt );
}
*/

if(Meteor.isClient) {
	var timeTick = new Tracker.Dependency();

	Meteor.setInterval(function () {
	timeTick.changed();
	}, 5000);
}

reactiveDate = function () {
  timeTick.depend();
  //return mmt.fromNow();
  //return formatDuration( moment() - mmt );
  return new Date(); // moment();
}