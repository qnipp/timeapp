// function functionname() 			.. scope: file
// var functionname = function() 	.. scope: file
// function name = function()		.. scope: global

/*
 * example call: 
 * 	loadItem(itemid, false, null); -- no details 
 *  loadItem(item, {all: true}, null);  -- all details (including tags, times, is running flag)
 * 
*/
loadItem = function(item, details, cbMethod) {
  /*console.log(
    "global loadItem - call: " +
      (typeof item === "string" ? item : item._id + " " + item.title) +
      " Details: ",
    details
  );
  */
  //console.log("called from: " + arguments.callee.caller.toString());

  // if called with itemid
  if (typeof item === "string" && item !== "") {
    //console.log("global loadItem - going to find item: "+ item);
    item = Items.findOne(item);
    /*
		founditem =  Items.find({_id: item}, {limit: 1});
		
		// it seems this does not work with findone.
		if(founditem) {
			founditem = founditem.fetch();
			if(founditem) {
				item = founditem[0];
			}
		} else {
			console.warn('global loadItem - could not find item with _id: '+ item);
		}*/
  }

  if (!details) {
    return item;
  }

  if (item && item._id) {
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

    if (details.tags || details.all) {
      if (item.tags) {
        item.tags = item.tags.map(function(tagid) {
          //console.log('searching tags for tagid: ' + tagid);
          if (typeof tagid === "string") {
            return Tags.findOne({ _id: tagid });
          } else {
            return null;
          }
        });
      }
    }

    if (details.times || details.all) {
      var indexOfUser;

      // if totals are not yet set for this item
      if (!item.totals) {
        // create array
        item.totals = [];
      }

      // add elapse time for given item
      item.timeelapsed = {};

      for (timeslot in CNF.timeslots) {
        if (CNF.timeslots[timeslot].usage != "normal") continue;
        //item.timeelapsed[timeslot] = 0;
        /*
				Times.find({
					item: item._id,
					start: CNF.timeslots[timeslot].start
					//createdBy: Meteor.userId()
				}).map(function(doc) {
					//item.timeelapsed[timeslot] += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
					
					if(typeof item.timeelapsed[doc.createdBy] === "undefined") {
						item.timeelapsed[doc.createdBy] = {userid: doc.createdBy};
					}
					if(!item.timeelapsed[doc.createdBy][timeslot]) {
						item.timeelapsed[doc.createdBy][timeslot] = 0;
					}
					item.timeelapsed[doc.createdBy][timeslot] += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
					
				});
				*/
        const times = Times.find(
          {
            item: item._id,
            start: CNF.timeslots[timeslot].start
            // createdBy: Meteor.userId()
          },
          {
            fields: { start: true, end: true, createdBy: true },
            reactive: false
          }
        ).fetch();

        const timeelapsed = times.reduce(function(acc, doc) {
          const t = acc[doc.createdBy] || { userid: doc.createdBy };

          t[timeslot] =
            (t[timeslot] || 0) +
            (doc.end > 0 ? doc.end : reactiveDate()) -
            doc.start;

          /*
					console.log('timeslot: ', timeslot);
					console.log('t[timeslot]: ', t[timeslot]);
					console.log('(t[timeslot] || 0): ', (t[timeslot] || 0));
					console.log('doc: ', doc);
					console.log('(doc.end > 0 ? doc.end : reactiveDate()) - doc.start: ', (doc.end > 0 ? doc.end : reactiveDate()) - doc.start);
					console.log('(t[timeslot] || 0) + (doc.end > 0 ? doc.end : reactiveDate()) - doc.start: ', (t[timeslot] || 0) + (doc.end > 0 ? doc.end : reactiveDate()) - doc.start);
					*/
          acc[doc.createdBy] = t;
          //console.log('acc: ', acc);
          return acc;
        }, {});
        //console.log('timeelapsed: ', timeelapsed);

        item.timeelapsed = timeelapsed;
      }

      //console.log('loadItem - timeelapsed: ');
      //console.log(item.timeelapsed);

      for (founduserid in item.timeelapsed) {
        indexOfUser = getUserIndexFromTotals(item.totals, founduserid);
        if (indexOfUser == -1) {
          item.totals.push(item.timeelapsed[founduserid]);
        } else {
          for (timeslot in CNF.timeslots) {
            if (CNF.timeslots[timeslot].usage != "normal") continue;
            if (item.timeelapsed[founduserid][timeslot]) {
              if (!item.totals[indexOfUser][timeslot]) {
                item.totals[indexOfUser][timeslot] = 0;
              }
              item.totals[indexOfUser][timeslot] +=
                item.timeelapsed[founduserid][timeslot];
            }
          }
        }
        /*
				// interate through array search for user
				for(var i = 0; i < item.totals.length; i++) {
					if(item.totals[i].userid == founduserid) {
						indexOfUser = i;
						break;
					}
				}
				
				// if not found..
				if(indexOfUser == -1) {
					// set index after last entry ..
					indexOfUser = item.totals.length;
					// .. and create new item with current userid and totals from above
					item.totals.push(item.timeelapsed[founduserid]);
				} else {
					for (timeslot in item.timeelapsed[founduserid]) {
						if(timeslot == 'userid') continue;
						if(typeof item.totals[indexOfUser][timeslot] == "undefined") {
							item.totals[indexOfUser][timeslot] = item.timeelapsed[timeslot];
						} else {
							item.totals[indexOfUser][timeslot] += item.timeelapsed[timeslot];
						}
					}
				}
				*/
      }
      /*
			for(var i = 0; i < item.totals.length; i++) {	
				for (timeslot in CNF.timeslots) {
					if(CNF.timeslots[timeslot].usage != 'normal') continue;
					
					item.totals[i][timeslot] = formatDuration(item.totals[i][timeslot]);
				}
			}
			
			item.timeelapsed = "change me to totals";
			*/

      /*
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
						start: CNF.timeslots.today,
						createdBy: Meteor.userId()
					}}, group_modifier
				]);
				
				// all elements
				item.timeelapsed.total = Times.aggregate([
					{ $match: {
						item: item._id,
						createdBy: Meteor.userId()
					}}, group_modifier
				]);
				
				
			}
			*/
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
};

loadTag = function(tag, cbMethod) {
  tag.color = {};
  tag.color.bgname = "#" + intToRGB(hashCode(tag.name));
  tag.color.bgvalue = "#" + intToRGB(hashCode(tag.value));

  tag.color.fgname = invertCssColor(tag.color.bgname);
  tag.color.fgvalue = invertCssColor(tag.color.bgvalue);

  return tag;
};

generateKeyColor = function(attrib, key, cbMethod) {
  if (!attrib.color) {
    attrib.color = {};
  }
  if (attrib[key]) {
    attrib.color[key + "bg"] = "#" + intToRGB(hashCode(attrib[key]));
  } else {
    attrib.color[key + "bg"] = "#eeeeee";
  }
  attrib.color[key + "fg"] = invertCssColor(attrib.color[key + "bg"]);

  return attrib;
};

formatDuration = function(timeelapsed, shorten, cbMethod) {
  if (!timeelapsed || timeelapsed <= 0) {
    return "-";
  } else {
    var timeduration = "";

    if (shorten == null) {
      shorten = false;
    }
    // 5 days per week, 8 hours per day
    var w = 0,
      d = 0,
      h = 0,
      m = 0,
      s = 0;

    // cut off milliseconds
    timeelapsed = timeelapsed / 1000;

    if (!shorten && Math.floor(timeelapsed / (60 * 60 * 8 * 5)) > 0) {
      w = Math.floor(timeelapsed / (60 * 60 * 8 * 5));

      //timeduration += w + "w ";
      timeelapsed = timeelapsed % (60 * 60 * 8 * 5);
    }

    if (!shorten && Math.floor(timeelapsed / (60 * 60 * 8)) > 0) {
      d = Math.floor(timeelapsed / (60 * 60 * 8));

      //timeduration += d + "d ";
      timeelapsed = timeelapsed % (60 * 60 * 8);
    }

    if (Math.floor(timeelapsed / (60 * 60)) > 0) {
      h = Math.floor(timeelapsed / (60 * 60));
      //timeduration += h + "h ";
      timeelapsed = timeelapsed % (60 * 60);
    }
    if (Math.floor(timeelapsed / 60) > 0) {
      m = Math.floor(timeelapsed / 60);
      //timeduration += m + "m ";
      timeelapsed = timeelapsed % 60;
    }

    if (!shorten && timeelapsed > 0) {
      s = Math.floor(timeelapsed);
      //timeduration += s + "s";
    }

    if (!shorten) {
      timeduration = CNF.FORMAT_TIMEFRAME_LONG;
    } else {
      timeduration = CNF.FORMAT_TIMEFRAME_SHORT;
    }

    if (w > 0) {
      timeduration = timeduration.replace(/w(?![^\[]*\])/, w);
      timeduration = timeduration.replace(
        /W(?![^\[]*\])/,
        w < 10 ? "0" + w : w
      );
    } else {
      timeduration = timeduration.replace(/w/gi, "");
    }

    if (d > 0) {
      timeduration = timeduration.replace(/d(?![^\[]*\])/, d);
      timeduration = timeduration.replace(
        /D(?![^\[]*\])/,
        d < 10 ? "0" + d : d
      );
    } else {
      timeduration = timeduration.replace(/d/gi, "");
    }

    if (shorten || h > 0) {
      timeduration = timeduration.replace(/h(?![^\[]*\])/, h);
      timeduration = timeduration.replace(
        /H(?![^\[]*\])/,
        h < 10 ? "0" + h : h
      );
    } else {
      timeduration = timeduration.replace(/h/gi, "");
    }

    if (shorten || m > 0) {
      timeduration = timeduration.replace(/m(?![^\[]*\])/, m);
      timeduration = timeduration.replace(
        /M(?![^\[]*\])/,
        m < 10 ? "0" + m : m
      );
    } else {
      timeduration = timeduration.replace(/m/gi, "");
    }

    if (shorten || s > 0) {
      timeduration = timeduration.replace(/s(?![^\[]*\])/, s);
      timeduration = timeduration.replace(
        /S(?![^\[]*\])/,
        s < 10 ? "0" + s : s
      );
    } else {
      timeduration = timeduration.replace(/s/gi, "");
    }

    timeduration = timeduration.replace(/[\[\]]*/g, "");

    return timeduration.trim();
  }
};

queryTimes = function(startdate, enddate, item, tag, user) {
  var timeelapsed = 0;
  var selector = {};

  selector.start = {
    $gte: startdate,
    $lte: enddate
  };

  if (item) {
    selector.item = item;
  }
  if (tag) {
    selector.tags = tag;
  }
  if (user) {
    selector.createdBy = user;
  }

  Times.find(selector).map(function(doc) {
    timeelapsed += (doc.end > 0 ? doc.end : new Date()) - doc.start;
  });

  return timeelapsed;
};

queryItems = function(startdate, enddate) {};

getIndexfromArray = function(value, array, field) {
  //console.log("getIndexfromArray - searching for " + value + " through: "+ field +": "+ value);

  if (array) {
    if (Object.prototype.toString.call(array) === "[object Array]") {
      // interate through array search for given value
      for (var i = 0; i < array.length; i++) {
        //console.log("index " + i);
        //console.log(array[i]);

        if (array[i][field] === value) {
          return i;
        }
      }
    } else {
      // interate through object search for given value
      var i;
      for (i in array) {
        //console.log("index " + i);
        //console.log(array[i]);
        if (array[i][field] === value) {
          return i;
        }
      }
    }
  }
  // if not found..
  return -1;
};

// find index of given userid from totals array
getUserIndexFromTotals = function(totals, userid) {
  /*
	if(totals) {
		// interate through array search for user
		for(var i = 0; i < totals.length; i++) {
			if(totals[i].userid == userid) {
				return i;
			}
		}
	}
	
	// if not found..
	//---- set index after last entry .. array needs to be pushed
	return -1;
	*/
  return getIndexfromArray(userid, totals, "userid");
};

// get timeslot value for given user from totals array
// if !userid sum up all times for given slot
getTimeslotValueFromTotals = function(totals, userid, timeslot) {
  if (userid) {
    var userindex = getUserIndexFromTotals(totals, userid);
    if (userindex == -1) {
      return 0;
    } else {
      return totals[userindex][timeslot] ? totals[userindex][timeslot] : 0;
    }
  } else {
    // sum up all user values
    var timeelapsed = 0;
    if (totals) {
      for (var i = 0; i < totals.length; i++) {
        if (totals[i][timeslot]) {
          timeelapsed += totals[i][timeslot];
        }
      }
    }
    return timeelapsed;
  }
};

// make String to colorcode.
// see: http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
// usage: alert(intToARGB(hashCode("Carrots, sdfsdfraw")))

hashCode = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};
intToRGB = function(i) {
  return (
    ("00" + ((i >> 16) & 0xff).toString(16)).slice(-2) +
    ("00" + ((i >> 8) & 0xff).toString(16)).slice(-2) +
    ("00" + (i & 0xff).toString(16)).slice(-2)
  );
};
intToARGB = function(i) {
  return (
    ("00" + ((i >> 24) & 0xff).toString(16)).slice(-2) +
    ("00" + ((i >> 16) & 0xff).toString(16)).slice(-2) +
    ("00" + ((i >> 8) & 0xff).toString(16)).slice(-2) +
    ("00" + (i & 0xff).toString(16)).slice(-2)
  );
};

// color management - make text-color readable on background color
// see: http://stackoverflow.com/questions/9600295/automatically-change-text-color-to-assure-readability
// usage: alert(invertCssColor('#'+intToARGB(hashCode("Carrots, sdfsdfraw"))))

invertCssColor = function(color) {
  var rgb = invertColor(hexColor2rgb(color));
  return rgb2hexColor(rgb);
};

invertColor = function(rgb) {
  var yuv = rgb2yuv(rgb);
  var factor = 180; // 90
  var threshold = 100;
  yuv.y = clamp(yuv.y + (yuv.y > threshold ? -factor : factor));
  return yuv2rgb(yuv);
};

rgb2hexColor = function(rgb) {
  return "#" + dec2hex(rgb.r) + dec2hex(rgb.g) + dec2hex(rgb.b);
};

hexColor2rgb = function(color) {
  color = color.substring(1); // remove #
  return {
    r: parseInt(color.substring(0, 2), 16),
    g: parseInt(color.substring(2, 4), 16),
    b: parseInt(color.substring(4, 6), 16)
  };
};

rgb2hexColor = function(rgb) {
  return "#" + dec2hex(rgb.r) + dec2hex(rgb.g) + dec2hex(rgb.b);
};

dec2hex = function(n) {
  var hex = n.toString(16);
  if (hex.length < 2) {
    return "0" + hex;
  }
  return hex;
};

rgb2yuv = function(rgb) {
  var y = clamp(rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
  var u = clamp(rgb.r * -0.16874 + rgb.g * -0.33126 + rgb.b * 0.5 + 128);
  var v = clamp(rgb.r * 0.5 + rgb.g * -0.41869 + rgb.b * -0.08131 + 128);
  return { y: y, u: u, v: v };
};

yuv2rgb = function(yuv) {
  var y = yuv.y;
  var u = yuv.u;
  var v = yuv.v;
  var r = clamp(y + (v - 128) * 1.402);
  var g = clamp(y + (u - 128) * -0.34414 + (v - 128) * -0.71414);
  var b = clamp(y + (u - 128) * 1.772);
  return { r: r, g: g, b: b };
};

clamp = function(n) {
  if (n < 0) {
    return 0;
  }
  if (n > 255) {
    return 255;
  }
  return Math.floor(n);
};

// HTTP Functions
// httpoptions: see https://docs.meteor.com/api/http.html
fetchUrl = function(url, httpoptions, regex, cbMethod) {
  console.log(
    "global fetchUrl - call: " + url + " - isClient: " + Meteor.isClient
  );

  check(url, String);

  if (Meteor.isClient) {
    HTTP.call("GET", url, {}, function(error, response) {
      if (error) {
        console.log("error: " + error);
      } else {
        console.log(response);
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
  } else if (Meteor.isServer) {
    //this.unblock();

    try {
      var result;

      if (!httpoptions) {
        httpoptions = {};
      }
      // default http options
      httpoptions.timeout = 2000;
      httpoptions.followRedirects = true;

      if (!httpoptions.data) {
        result = HTTP.call("GET", url, httpoptions);
      } else {
        result = HTTP.call("POST", url, httpoptions);
      }
      /*, function (error, result) {
				if (!error) {
					result.content
				}
			}*/

      console.log("status from fetchWebsite: " + result.statusCode);

      if (result.statusCode == 200) {
        /*
				var t, d;
				
				var reg = /<title[^>]*>(.*?)<\/title>/i;
				t = reg.exec(result.content);
				if(t) {
					t = t[1];
				} else {
					t = 'not found';
				}
				
				reg = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i;
				d = reg.exec(result.content);
				if(d) {
					d = d[1];
				} else {
					d = 'not found';
				}
				console.log("result from fetchUrl: "+ t + " desc: "+ d);
				*/

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
        var matches = "";

        if (regex) {
          matches = regex.exec(result.content);
        }

        return {
          //description: d, //$(result.content).find('meta[name=description]').attr("content"),
          //title: t, //$(result.content).find('title')
          matches: matches,
          status: result.statusCode,
          content: result.content,
          data: result.data,
          headers: result.headers
        };
      } else {
        console.log("Response issue: ", result.statusCode);
        var errorJson = JSON.parse(result.content);
        throw new Meteor.Error(result.statusCode, errorJson.error);
      }
    } catch (e) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range
      console.log("exception from http get: ");
      console.log(e);
      throw new Meteor.Error(e.errorCode, e);
    }
  }
};

parseUrlResponse = function(html, cbMethod) {
  var reg;

  reg = /<a class="issue-link"[^>]*>(.*?)<\/a>/;
  var ticketid = reg.exec(html);

  if (ticketid) {
    ticketid = ticketid[1];
  }

  reg = /<h1 id="summary-val"[^>]*>(.*?)<\/h1>/;
  var title = reg.exec(html);
  if (title) {
    title = title[1];
  }

  return {
    title: ticketid + " " + title,
    description: title
  };
};

// select2Options

formatTagResult = function(state) {
  if (!state.id) {
    return state.name;
  }

  var tag = Tags.findOne({ _id: state.id });
  tag = loadTag(tag);

  return Blaze.toHTMLWithData(Template.taginputentry, { tag: tag });
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

formatItemResult = function(state) {
  if (!state.id) {
    return state.name;
  }

  var item = Items.findOne({ _id: state.id });
  //item = loadItem(time.item, {all: true}, null);
  item = loadItem(item, false, null);

  return Blaze.toHTMLWithData(Template.iteminputentry, { item: item });
};

formatAttributeResult = function(state) {
  if (!state.id) {
    return state.name;
  }

  var attrib = Attributes.findOne({ _id: state.id });
  attrib = generateKeyColor(attrib, "name");

  return Blaze.toHTMLWithData(Template.attributeinputentry, {
    attribute: attrib
  });
};

createJiraAuth = function(user, password) {
  console.log("createJiraAuth - create new session for user " + user);
  Meteor.call("createJiraAuth", user, password, function(error, result) {
    if (error) {
      console.log("createJiraAuth - Error: ");
      console.log(error);
    } else {
      console.log("createJiraAuth - Success new session ID: " + result);
      Session.set(CNF.PLUGIN.JIRA.SESSION.AUTH, result);
    }
  });
};

logCallback = function(error, result) {
  if (error) {
    console.log("Error: ");
    console.log(error);
  } else {
    console.log("Result: ");
    console.log(result);
  }
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

if (Meteor.isClient) {
  var timeTick = new Tracker.Dependency();

  Meteor.setInterval(function() {
    timeTick.changed();
  }, CNF.REACTIVEDATE_REFRESH);
}

reactiveDate = function() {
  timeTick.depend();
  //return mmt.fromNow();
  //return formatDuration( moment() - mmt );
  return new Date(); // moment();
};
