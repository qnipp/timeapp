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
  itemIsTitleUnique(newtitle, currentid) {
    // https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
    return !Items.findOne(
      {
        title: newtitle,
        ownedBy: Meteor.userId(),
        _id: { $ne: currentid },
        /*
			$or: [
				{createdBy: Meteor.userId()},
				{ownedBy: Meteor.userId()}]
				*/
      },
      { fields: { _id: 1 } }
    );
  },

  timeSetEnd(timeid) {
    console.log(`methods:timeSetEnd - ${timeid}`);

    const time = Times.findOne(timeid);

    if (!time) {
      throw new Meteor.Error('not-found');
    }
    if (time.createdBy != Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    return Times.update(time._id, { $set: { end: new Date() } });
  },

  itemSetEnd(itemid) {
    console.log(`methods:itemSetEnd - ${itemid}`);

    const item = Items.findOne(itemid);

    if (!item) {
      throw new Meteor.Error('not-found');
    }

    // TODO: check if item's tags are shared with current user

    return Times.update(
      {
        $and: [
          {
            end: { $not: { $ne: null } },
            createdBy: Meteor.userId(),
            item: itemid,
          },
        ],
      },
      { $set: { end: new Date() } },
      { multi: true }
    );
  },

  itemSetStart(itemid) {
    console.log(`methods:itemSetStart - ${itemid}`);

    const item = Items.findOne(itemid);

    if (!item) {
      throw new Meteor.Error('not-found');
    }
    /*
		if(item.createdBy != Meteor.userId()) 
			throw new Meteor.Error("not-authorized");
		*/
    // TODO: check if item's tags are shared with current user

    // stop all other times
    const timesrunning = Times.find({
      end: { $not: { $ne: null } },
      createdBy: Meteor.userId(),
    });

    let itemrunning;
    const items_for_update = [];

    timesrunning.forEach(function(timerunning) {
      // load item of running time
      itemrunning = Items.findOne(timerunning.item, {
        fields: { keepOpen: 1 },
      });

      if (itemrunning) {
        // only update end-time of keepOpen is not set
        // current selected Item will always be stopped and restartet
        if (!itemrunning.keepOpen || item._id == itemrunning._id) {
          items_for_update.push(itemrunning._id);
        } /* else {
					console.log("running time will not be stopped: ");
					console.log(itemrunning);
				}*/
      }
    });

    // run update only if necessary
    if (items_for_update) {
      Times.update(
        {
          $and: [
            {
              end: { $not: { $ne: null } },
              createdBy: Meteor.userId(),
              item: { $in: items_for_update },
            },
          ],
        },
        { $set: { end: new Date() } },
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

  itemInsert(item) {
    console.log(`methods:itemInsert : ${item.title}`);

    Schemas.Items.clean(item);
    check(item, Schemas.Items);

    if (!Meteor.call('itemIsTitleUnique', item.title, item._id)) {
      console.log(
        `methods:itemInsert : ${item.title} failed - itemIsTitleUnique not met`
      );
      throw new Meteor.Error('notUnique', 'item title is notUnique');
      return false;
    }

    return Items.insert(item);
  },
  itemUpdate(item, id) {
    console.log(`methods:itemUpdate : ${id} - ${item.$set.title}`);

    console.log(item);

    check(item, Schemas.Items);

    if (!Meteor.call('itemIsTitleUnique', item.$set.title, id)) {
      console.log(
        `methods:itemUpdate : ${
          item.$set.title
        } failed - itemIsTitleUnique not met`
      );
      throw new Meteor.Error('notUnique', 'item title is notUnique');
      return false;
    }
    console.log(
      `methods:itemUpdate : ${item.title} ok - itemIsTitleUnique is ok`
    );

    return Items.update(id, item);
  },
  itemRemove(itemid) {
    console.log(`methods:itemRemove : ${itemid}`);
    // itemRemove not implemented !
    // console.log('haha - no :)');
    // return false;
    return Items.remove({ _id: itemid }) && Times.remove({ item: itemid });
  },

  itemImport(form) {
    console.log('trying: ');
    console.log(form);

    check(form, Schemas.ItemImport);

    const csv = Papa.parse(`${form.format}\n${form.data}`, {
      quotes: true,
      delimiter: form.delimiter,
      newline: '\n',
      header: true,
      skipEmptyLines: true,
    });

    console.log('parsed csv: ');
    console.log(csv);

    if (csv.errors && csv.errors.length > 0) {
      throw new Meteor.Error('csv-error', csv.errors);
    }

    // only title, description and tags are allowed
    // if(csv.meta.fields

    if (csv.data) {
      csv.data.forEach(function(row) {
        console.log('reparsing a single row: ');
        console.log(row);

        if (!row.title) {
          console.log('skip row without title: ');
          console.log(row);
          return;
        }

        row.title = row.title.trim();

        let item = Items.findOne({
          title: row.title,
        });

        if (item) {
          console.log(`found item "${row.title}" with id ${item._id}`);
        } else {
          item = {};

          item.title = row.title;

          if (row.description) {
            item.description = row.description.trim();
          }

          if (form.origin) {
            item.origin = form.origin.trim();
          }

          console.log('inserting item:');
          console.log(item);

          const itemid = Items.insert(item);

          item._id = itemid;

          console.log(`created item "${item.title}" with id ${itemid}`);
        }

        if (row.tags) {
          var tagids = [];

          const tagnames = Papa.parse(row.tags, {
            quotes: true,
            delimiter: ',',
            newline: '\n\r',
            header: false,
            skipEmptyLines: false,
          });
          console.log('found tagnames:');
          console.log(tagnames);

          if (tagnames.errors && tagnames.errors.length > 0) {
            throw new Meteor.Error('csv-errors', tagnames.errors);
          }

          if (tagnames.data) {
            tagnames.data[0].forEach(function(tagname) {
              console.log(`reading a single tagname: ${tagname}`);

              tagname = tagname.trim();
              let tagvalue = '';

              let tag = Tags.findOne({
                $and: [
                  {
                    type: 'item-tag',
                    name: tagname,
                    value: '',
                  },
                ],
              });

              if (tag) {
                console.log(`found tag "${tagname}" with id ${tag._id}`);
                tagids.push(tag._id);
              } else {
                // split tag into name and value

                let tagparts;
                tagparts = tagname.split(':');

                if (tagparts.length == 1) {
                  tagparts = tagname.split('-');
                }
                if (tagparts.length == 1) {
                  tagparts = tagname.split(' ');
                }
                if (tagparts.length == 1) {
                  console.log(
                    `skipping tag: ${tagname} - because it can not be split into name and value`
                  );
                  return;
                }

                tagname = tagparts[0].trim();
                tagvalue = tagparts[1].trim();

                tag = Tags.findOne({
                  $and: [
                    {
                      type: 'item-tag',
                      name: tagname,
                      value: tagvalue,
                    },
                  ],
                });

                if (tag) {
                  console.log(
                    `found tag "${tagname}: ${tagvalue}" with id ${tag._id}`
                  );
                  tagids.push(tag._id);
                } else {
                  const tagid = Tags.insert({
                    type: 'item-tag',
                    name: tagname,
                    value: tagvalue,
                    origin: form.origin,
                  });

                  if (tagid) {
                    console.log(
                      `created tag "${tagname}: ${tagvalue}" with id ${tagid}`
                    );
                    tagids.push(tagid);
                  } else {
                    console.log(`error during insert of tag: ${tagname}`);
                  }
                }
              }
            });
          }
        }

        if (tagids) {
          console.log(`updating item: ${item.title} with new tags: ${tagids}`);
          console.log(tagids);
          Items.update(
            { _id: item._id },
            { $addToSet: { tags: { $each: tagids } } }
          );
          // Items.update({_id: item._id}, {$addToSet: {tags: tagids}});
        } else {
          console.log('skip item update because no tagids were found');
        }
      });

      return true;
    }
    console.log('no item data found for import');
    return false;
  },

  // TIMES

  timeInsert(time) {
    console.log(`methods:timeInsert : ${time.start}`);

    Schemas.Times.clean(time);
    check(time, Schemas.Times);
    return Times.insert(time);
  },
  timeUpdate(time, id) {
    console.log(`methods:timeUpdate : ${id} - ${time.$set.start}`);
    console.log(time);

    check(time, Schemas.Times);

    return Times.update(id, time);
  },
  timeRemove(timeid) {
    console.log(`methods:timeRemove : ${timeid}`);
    // TODO: check if its my time entry
    return Times.remove({ _id: timeid, createdBy: Meteor.userId() });
  },

  timeRunning(form) {
    console.log('trying: ');
    console.log(form);
    console.log(`my user id: ${Meteor.userId()}`);

    check(form, Schemas.TimeRunning);

    // adding autovalues
    Schemas.TimeRunning.clean(form);

    // DONE: check if ID is my own timeentry

    return Times.update(
      { _id: form.timeId, createdBy: Meteor.userId() },
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

      {
        $push: {
          comments: {
            comment: form.comment,
            createdAt: form.createdAt,
          },
        },
      }
    );
  },

  timeImport(form) {
    // throw new Meteor.Error("test", "test details");

    console.log('trying: ');
    console.log(form);

    check(form, Schemas.TimeImport);

    if (!form.dateformat) {
      form.dateformat = 'DD.MM.YY HH:mm';
    }
    if (!form.delimiter) {
      form.delimiter = '	';
    }

    const csv = Papa.parse(`${form.format}\n${form.data}`, {
      quotes: true,
      delimiter: form.delimiter,
      newline: '\n',
      header: true,
      skipEmptyLines: true,
    });

    console.log('parsed csv: ');
    console.log(csv);

    if (csv.errors && csv.errors.length > 0) {
      throw new Meteor.Error('csv-errors', csv.errors);
    }

    // only item, start and stop are allowed
    // if(csv.meta.fields

    if (csv.data) {
      csv.data.forEach(function(row) {
        console.log('reparsing a single row: ');
        console.log(row);

        if (!row.item || !row.start) {
          console.log('skip row without item or start: ');
          console.log(row);
          return;
        }

        row.item = row.item.trim();

        const item = Items.findOne({
          title: row.item,
        });

        if (!item) {
          console.log(
            `skip row with unknown item: "${
              row.item
            }" - please import items first!`
          );
          return;
        }
        console.log(`found item "${row.item}" with id ${item._id}`);

        row.start = moment(row.start.trim(), form.dateformat).toDate();

        if (row.end && row.end != '') {
          row.end = moment(row.end.trim(), form.dateformat).toDate();
        }

        if (row.comments) {
          row.comments = row.comments.split(',');
          row.commentobj = [];

          /*
						for (index = 0; index < a.length; ++index) {
							row.comments = {comment: }
						}*/

          row.comments.forEach(function(comment) {
            row.commentobj.push({ comment });
          });
        } else {
          row.commentobj = [];
        }

        const time = Times.findOne({
          item: item._id,
          createdBy: Meteor.userId(),
          start: row.start,
        });

        if (time) {
          console.log(
            `found time "${row.start}" with id ${time._id} - skipping row`
          );
        } else {
          timeid = Times.insert({
            item: item._id,
            start: row.start,
            end: row.end,
            origin: form.origin,
            // comments: row.comments
            // "comments.$.comment"
            comments: row.commentobj,
          });

          if (timeid) {
            console.log(
              `created time "${item._id}: ${row.start}" with id ${timeid}`
            );
          } else {
            console.log(`error during insert of time: ${row.start}`);
          }
        }
      });

      return true;
    }
    console.log('no time data found for import');
    return false;
  },

  // not in use!
  timeReport() {
    today = 0;
    Times.find({
      start: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      createdBy: Meteor.userId(),
    }).map(function(doc) {
      // item.timeelapsed.today += (doc.end > 0 ? doc.end : new Date()) - doc.start;
      // item.timeelapsed.today += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
      today += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
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
    return today;
  },

  // TAGS

  tagInsert(tag) {
    console.log(`methods:tagInsert : ${tag.name}`);

    Schemas.Tags.clean(tag);
    check(tag, Schemas.Tags);
    return Tags.insert(tag);
  },

  tagUpdate(tag, id) {
    console.log(
      `methods:tagUpdate : ${id} - ${tag.$set.name}: ${tag.$set.value}`
    );

    // return false;
    // console.log(tag);
    // Schemas.Tags.clean(tag);
    check(tag, Schemas.Tags);

    // console.log(Meteor.userId());
    // console.log(tag);

    // /throw new Meteor.Error("do not update tags right now :\  ");

    return Tags.update(id, tag);
  },

  tagRemove(tagid) {
    console.log(`methods:tagRemove : ${tagid}`);
    // TODO: check if its my tag entry
    return Tags.remove({ _id: tagid });
  },

  // ATTRIBUTE

  attributeInsert(attribute) {
    console.log(
      `methods:attributeInsert : ${attribute.name} [${attribute.type}]`
    );

    Schemas.Attributes.clean(attribute);
    check(attribute, Schemas.Attributes);
    return Attributes.insert(attribute);
  },

  attributeUpdate(attribute, id) {
    console.log(
      `methods:attributeUpdate : ${id} - ${attribute.$set.name} [${
        attribute.$set.type
      }]`
    );

    // return false;
    // console.log(tag);
    // Schemas.Tags.clean(tag);
    check(attribute, Schemas.Attributes);

    // console.log(Meteor.userId());
    // console.log(tag);

    // /throw new Meteor.Error("do not update tags right now :\  ");

    return Attributes.update(id, attribute);
  },

  attributeRemove(attributeid) {
    console.log(`methods:attributeRemove : ${attributeid}`);
    // TODO: check if its my attribute entry
    return Attributes.remove({ _id: attributeid });
  },

  // SEARCH

  openTimeWithItem(itemid) {
    console.log(`methods:openTimeWithItem : ${itemid}`);

    // Router.go(Router.path('item.detail', {_id: itemid}));
    Router.go(Router.path('time.create', { _id: itemid }));
  },

  // fetchUrl

  fetchUrl(url, options, regex) {
    console.log(`methods:fetchUrl : ${url}`);

    return fetchUrl(url, options, regex);
  },

  // calculations

  doCalculations(updatedAt) {
    console.log(`doCalculations - user: ${Meteor.userId()}`);

    if (!updatedAt || !moment(updatedAt).isValid()) {
      // will calc through all times
      // updatedAt = moment().toDate();
      // will leave last 2 months untouched
      // updatedAt = moment().subtract(1, 'months').startOf("month").toDate();
      // will leave current month untouched
      updatedAt = moment()
        .startOf('month')
        .toDate();
      // will leave only today untouched
      // updatedAt = moment().startOf("day").toDate();

      console.log(`for all Times created before: ${updatedAt}`);
    } else {
      updatedAt = moment(updatedAt).toDate();
      console.log(`for all Times created before given date: ${updatedAt}`);
    }

    console.log(`Total Items: ${Items.find({}).count()}`);
    console.log(
      `My Items: ${Items.find({ createdBy: Meteor.userId() }).count()}`
    );

    console.log(`Total Times: ${Times.find({}).count()}`);
    console.log(
      `My Times: ${Times.find({ createdBy: Meteor.userId() }).count()}`
    );

    let itemCount = 0;

    // first reset old values (so thisweek and prevweek still work)
    Items.update(
      {
        // _id: 'rqvj5bXJQtJL2A2go',
        // tags: 'KwaxGTBiSybcq2d43',
        ownedBy: Meteor.userId(),
      },
      {
        $unset: { totals: 1, totalsUpdatedAt: 1 },
      },
      { multi: true }
    );

    // go through all items
    // Items.find({_id: 'rqvj5bXJQtJL2A2go'}).map(function(doc_item) {
    Items.find({
      // _id: 'rqvj5bXJQtJL2A2go',
      // _id: 'TmPD7f4Jobguz7MFT',
      // tags: 'KwaxGTBiSybcq2d43',
      ownedBy: Meteor.userId(),
    }).map(function(doc_item) {
      const totals = {};

      // for each timeslot ..
      for (timeslot in CNF.timeslots) {
        // define timeslot
        // totals[timeslot] = {};

        // console.log('doing calculations for: '+ doc_item.title + ' timeslot: ' + timeslot );

        // timeslot: today
        Times.find({
          item: doc_item._id,
          start: CNF.timeslots[timeslot].start,
          // only count finished times - having an end time set
          end: { $ne: null },
          // only times, that come before update Date
          createdAt: { $lte: updatedAt },
        }).map(function(doc_time) {
          // console.log('found item entry: '+ doc_time.start + ' by '+ doc_time.createdBy);

          // sum up times per user
          if (typeof totals[doc_time.createdBy] === 'undefined') {
            totals[doc_time.createdBy] = {};
          }
          if (typeof totals[doc_time.createdBy][timeslot] === 'undefined') {
            totals[doc_time.createdBy][timeslot] =
              doc_time.end - doc_time.start;
          } else {
            totals[doc_time.createdBy][timeslot] +=
              doc_time.end - doc_time.start;
          }
        });
      }

      // console.log('found totals: ', totals);

      if (totals && Object.keys(totals).length !== 0) {
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
          // totals[userid].updatedAt = updatedAt;

          doc_item.totals.push(totals[userid]);
        }
        /*
        console.log('updating doc_item._id: ' + doc_item._id +' - ' + 
          ' totalsUpdatedAt: '+ updatedAt + 
          ' title: ' + doc_item.title +
          ' using:', doc_item.totals);
          */

        itemCount++;

        // updating current using new totals
        return Items.update(doc_item._id, {
          $set: {
            // ownedBy: doc_item.ownedBy,
            totals: doc_item.totals,
            totalsUpdatedAt: updatedAt,
          },
          // $unset: {totals: "", totalsUpdatedAt: ""}
        });
      }
      // console.log("skip updating totals");
    });

    /*
		Times.find({
			createdBy: Meteor.userId(),
		}).map(function(doc) {
			//item.timeelapsed.today += (doc.end > 0 ? doc.end : new Date()) - doc.start;
			item.timeelapsed.today += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
			
		});
		*/

    console.log(
      `doCalculations - user: ${Meteor.userId()} done - summed up a total of: ${itemCount} items`
    );
    return `doCalculations - done - summed up a total of: ${itemCount} items`;
  },

  removeItems(origin) {
    console.log(`removeItems - user: ${Meteor.userId()} origin: ${origin}`);
    if (origin) {
      return Items.remove({ createdBy: Meteor.userId(), origin });
    }
    console.log('removeItems - missing origin string');
    throw new Meteor.Error('Please provide an origin!');
  },
  removeTimes(origin) {
    console.log(`removeTimes - user: ${Meteor.userId()} origin: ${origin}`);
    if (origin) {
      return Times.remove({ createdBy: Meteor.userId(), origin });
    }
    console.log('removeTimes - missing origin string');
    throw new Meteor.Error('Please provide an origin!');
  },
  csvExport(item) {
    console.log(`csvExport - user: ${Meteor.userId()} ItemID: ${item}`);
    const exports = [];
    const query = {};
    query.createdBy = Meteor.userId();

    if (item) {
      query.item = item;
    }
    Times.find(query, { sort: { start: 1 } }).map(function(time) {
      exports.push(
        `${Items.findOne({ _id: time.item }).title};${moment(time.start).format(
          CNF.FORMAT_DATETIME
        )};${moment(time.end).format(CNF.FORMAT_DATETIME)};${formatDuration(
          time.end - time.start,
          true
        )};${
          time.comments
            ? time.comments
                .map(function(comment) {
                  if (comment && comment.comment) {
                    return comment.comment;
                  }
                  return '';
                })
                .join(', ')
            : ''
        }`
      );
    });
    return exports;
  },

  // route: /items/:id
  // returns all Times for a specific item and user
  findTimes(item) {
    // console.log("loading times for: "+ item + " user: "+ userid);
    return Times.find({ item, createdBy: Meteor.userId() }).fetch();
  },

  // route: /times/:id
  // returns a single time entry Times for a specific item and user
  findTime(time) {
    // console.log("loading times for: "+ item + " user: "+ userid);
    // return Times.findOne({_id: time, createdBy: Meteor.userId()});
    return Times.findOne({ _id: time, createdBy: Meteor.userId() });
  },

  createJiraAuth(user, password) {
    console.log(`createJiraAuth - creating new session id for user: ${user}`);

    const result = fetchUrl(`${CNF.PLUGIN.JIRA.URL}/rest/auth/1/session`, {
      data: { username: user, password },
    });
    if (result.data && result.data.session && result.data.session.value) {
      return result.data.session.value;
    }
    console.log('createJiraAuth - invalid user/password combination.');
    throw new Meteor.Error('not-authorized');

    // result: cookie = result.data.session.name; // { name: JSESSIONID, value: 12341234 };
  },
  clearAttributes(itemid) {
    /*
		if(!itemid) {
			itemid = "7XN664Hr4fnFyNBjn";
		}
		return Items.update({_id: itemid}, {$unset: {attributes: 1}});
*/
    // make sure all attributes are set in arrays instead of objects!
    Items.find({ attributes: { $ne: null } }).map(function(item) {
      if (typeof item.attributes.length === 'undefined') {
        console.log(`${item._id} ${item.attributes}`);

        Items.update(
          { _id: item._id },
          { $set: { attributes: [item.attributes[0]] } }
        );
      }
    });
  },
  setJiraID(project, sessionid) {
    console.log('setJiraID - adding JIRA ID to tickets.');

    if (!project) {
      console.log('setJiraID - missing jira project in method call.');
      throw new Meteor.Error('missing-jira-project');
    }

    const regex = new RegExp(`.*(${project}-[0-9]+).*`, 'g');

    // TODO: JIRA key will be added always to attributes.0 for each item
    // - could probably overwrite something else there
    Items.find({ title: regex }, { sort: { createdAt: 1 } }).map(function(
      itemdoc
    ) {
      console.log(`Setting JIRA reference for: ${itemdoc.title}`);

      const attribIdKey = Attributes.findOne({
        name: CNF.PLUGIN.JIRA.ATTRIBUTES.KEY,
      })._id;
      const attributeValue = {
        attribid: attribIdKey,
        value: itemdoc.title.replace(regex, '$1'),
      };
      const attributeSet = {};
      let indexJiraID;

      /*
			
			if(itemdoc.attributes) {
				indexJiraID = getIndexfromArray(Attributes.findOne({"name": CNF.PLUGIN.JIRA.ATTRIBUTES.KEY})._id, itemdoc.attributes, "attribid");
				
				if(indexJiraID < 0) {
					indexJiraID = itemdoc.attributes.length;
				}
			}
			
			if(!indexJiraID) {
				indexJiraID = 0
			}
			*/

      if (itemdoc.attributes) {
        indexJiraID = getIndexfromArray(
          attribIdKey,
          itemdoc.attributes,
          'attribid'
        );

        if (indexJiraID >= 0) {
          // if attribute is already there - update them with $ operator
          attributeSet['attributes.$'] = attributeValue;
          console.log('Updating Item with updateded Jira Reference: ');
          console.log(attributeSet);

          Items.update(
            {
              _id: itemdoc._id,
              'attributes.attribid': attributeValue.attribid,
            },
            { $set: attributeSet }
          );
        } else {
          // if there are attributes but missing new one.

          /* itemdoc.attributes.push(attributeValue);
					attributeValue = itemdoc.attributes;*/
          attributeSet.attributes = attributeValue;
          console.log('Updating Item with additional Jira Reference: ');
          console.log(attributeSet);

          Items.update({ _id: itemdoc._id }, { $addToSet: attributeSet });
        }
      } else {
        // if there are no attribute values, just add a new subdocument

        // attributeSet["attributes."+indexJiraID] = attributeValue;
        attributeSet.attributes = [attributeValue];
        console.log('Update Item with new Jira Reference: ');
        console.log(attributeSet);
        Items.update({ _id: itemdoc._id }, { $set: attributeSet });
      }

      // update estimates as well.
      if (sessionid) {
        Meteor.call('updateJiraDetails', itemdoc._id, sessionid);
      }

      /*
			Items.update({_id: itemdoc._id, 'attributes.attribid': },
				{$set: {
					"attributes."+indexJiraID+".attribid": ,
					"attributes."+indexJiraID+".value": 
				}});
			*/
      // Items.update({_id: itemdoc._id},  {$set: {"attributes[0]": {"attribid": "4oKTwk4ZSvybBuXmj", "value": itemdoc.title.substring(0,10) } }} );
    });

    // how can i use a another field in update ?
    /*
		Items.update({"_id": "7XN664Hr4fnFyNBjn", "title": /INGWEB\-[0-9]+.*  /}, 
			{$set: {"attributes.0.attribid": "4oKTwk4ZSvybBuXmj", 
							"attributes.0.value": this.title.substring(0,10)    } });
		*/
  },

  loadJiraIssue(jiraid, sessionid) {
    console.log(`loadJiraIssue - loading jira details for: ${jiraid}`);

    if (!sessionid) {
      console.log('loadJiraIssue - no valid Jira authentication available.');
      throw new Meteor.Error(
        "Missing valid Jira Auth Session - use: createJiraAuth('username', 'password');"
      );
      // throw new Meteor.Error("not-authorized");
    }

    const result = fetchUrl(
      `${CNF.PLUGIN.JIRA.URL}/rest/api/2/issue/${jiraid}`,
      {
        headers: { Cookie: `JSESSIONID=${sessionid}` },
      }
    );

    let estimate = null;

    /*
		result: data.fields.customfield_10314   Array[4]
				0: "Role: 10304 (18000 | 18000)"
				1: "Role: 10303 (null | null)"
				2: "Role: 10306 (1800 | 1800)"
				3: "Role: 10305 (null | null)"

				Backend 
					Estimated: 5h
					Remaining:	5h
					
				Konzept & PM
					Estimated: 30m
					Remaining:30m
		*/

    estimatedValue = null;

    if (result.data.fields.customfield_10314) {
      // e.g.: "Role: 10304 (18000 | 18000)"
      estimate = result.data.fields.customfield_10314;

      if (estimate) {
        for (let i = 0; i < estimate.length; i++) {
          if (estimate[i].match(/^Role: 10304.*/) !== null) {
            estimatedValue = estimate[i].replace(
              /Role: 10304 \(([0-9]*) \|.*\)/,
              '$1'
            );
            break;
          }
        }

        if (estimatedValue != null && !isNaN(estimatedValue)) {
          // if(!isNaN(estimatedValue)) { //Number.isInteger(estimate)) { // $.isNumeric(estimate)) {
          estimatedValue = estimatedValue / 60 / 60;
        } else {
          estimatedValue = null;
        }
      }
    }

    const resultCrop = {
      title: result.data.fields.summary,
      description: result.data.fields.description,
      key: result.data.key,
      state: result.data.fields.status.name,
      orderstate: result.data.fields.customfield_10300
        ? result.data.fields.customfield_10300.value
        : null,
      type: result.data.fields.issuetype.name,
      estimate: estimatedValue,
      // fullresult: result,
    };

    // console.log("loading Jira result: ");
    // console.log(resultCrop);

    return resultCrop;
  },

  updateJiraDetails(itemid, sessionid) {
    // var index = getIndexfromArray(CNF.PLUGIN.JIRA.ATTRIBUTES.KEY, this.attributes, "name");
    // TODO: this.attributes - is not an array, but an object :\

    let itemdoc;
    itemdoc = Items.findOne(itemid);

    console.log(
      `updateJiraDetails - Updating Item with JIRA Details ${itemdoc.title}`
    );

    const indexJiraID = getIndexfromArray(
      Attributes.findOne({ name: CNF.PLUGIN.JIRA.ATTRIBUTES.KEY })._id,
      itemdoc.attributes,
      'attribid'
    );
    // return "updateJiraDetails - itemid: "+ itemid +" sessionid: "+ sessionid + " found indexJiraID: "+ indexJiraID;
    // console.log("found index: " + index);

    // check if item has a JIRA ID set
    if (indexJiraID >= 0 && itemdoc.attributes[indexJiraID].value) {
      console.log(`loading jira id: ${itemdoc.attributes[indexJiraID].value}`);
      let detailsJira;

      detailsJira = Meteor.call(
        'loadJiraIssue',
        itemdoc.attributes[indexJiraID].value,
        sessionid
      );

      const setModifier = {
        $set: {
          title: `${detailsJira.key} ${
            detailsJira.type ? `[${detailsJira.type}]` : ''
          } ${detailsJira.title}`,
          description: detailsJira.description
            ? detailsJira.description.substring(0, 200)
            : '',
        },
      };

      const attribIdEstimate = Attributes.findOne({
        name: CNF.PLUGIN.JIRA.ATTRIBUTES.ESTIMATE,
      })._id;
      const indexEstimate = getIndexfromArray(
        attribIdEstimate,
        itemdoc.attributes,
        'attribid'
      );

      const attributeValue = {
        attribid: attribIdEstimate,
        value: detailsJira.estimate,
      };

      if (indexEstimate >= 0) {
        // if attribute is already there - update them with $ operator
        // attributeSet["attributes.$"] = attributeValue;
        setModifier.$set['attributes.$'] = attributeValue;
        console.log('Updating Item with updateded Jira Estimate: ');
        console.log(setModifier);

        return Items.update(
          { _id: itemdoc._id, 'attributes.attribid': attributeValue.attribid },
          setModifier
        );
      }
      // if there are attributes but missing new one.

      /* itemdoc.attributes.push(attributeValue);
				attributeValue = itemdoc.attributes;*/
      // attributeSet["attributes"] = attributeValue;
      setModifier.$addToSet = {};
      setModifier.$addToSet.attributes = attributeValue;
      console.log('Updating Item with additional Jira Reference: ');
      console.log(setModifier);

      return Items.update({ _id: itemdoc._id }, setModifier);
    }
    console.log('no jira id is set for this item.');
    throw new Meteor.Error('no jira id is set for this item');
  },

  takeoverItem(itemid) {
    let itemdoc;
    itemdoc = Items.findOne(itemid);

    console.log(
      `takeoverItem - takeover item: ${itemdoc.title} user: ${Meteor.userId()}`
    );

    Items.update(
      itemid,
      { $set: { ownedBy: Meteor.userId() } },
      { validate: false }
    );
    return `The Item: ${itemdoc.title} belongs now to you`;
  },

  calculateTimesheet(userid, starttimeframe, endtimeframe) {
    const times = {};
    let lastendtime = 0;
    let lastday = 0;

    if (!starttimeframe) {
      starttimeframe = moment()
        .subtract(24, 'months')
        .toDate();
      // , start: { $gte: starttimeframe }
    }

    if (!endtimeframe) {
      endtimeframe = moment(starttimeframe)
        .add(24, 'months')
        .toDate();
    }

    times.days = [];
    times.weeks = [];
    times.months = [];

    // aus irgendeinem grund kann man das nicht hinzufügen: , start: { $gte: starttimeframe }
    /*
    Times.find({ createdBy: userid , start: { $gte: starttimeframe } },{ sort: { start: 1 } }).map(function(
      time
    ) {
    */

    timesResult = Times.find(
      {
        createdBy: userid,
        start: { $gte: starttimeframe, $lte: endtimeframe },
      },
      { sort: { start: 1 } }
    ).fetch();

    const additionalTime = Times.findOne({
      createdBy: userid,
      start: { $gt: endtimeframe },
    });

    if (additionalTime) {
      timesResult.push(additionalTime);
    }

    timesResult.forEach(function(time) {
      /* formatting will be done while rendering to ensure sorting
      var day = moment(time.start).format(CNF.FORMAT_DATE);
      var week = moment(time.start).format(CNF.FORMAT_WEEK);
      var month = moment(time.start).format(CNF.FORMAT_MONTH);
      */
      const day = moment(time.start)
        .startOf('day')
        .format(CNF.FORMAT_DATETIME_SORT);
      const week = moment(time.start)
        .startOf('isoWeek')
        .format(CNF.FORMAT_DATETIME_SORT);
      const month = moment(time.start)
        .startOf('month')
        .format(CNF.FORMAT_DATETIME_SORT);

      /* start of new day */
      if (!times.days[day]) {
        /* reset previous end time */
        lastendtime = 0;
        times.days[day] = {
          start: 0,
          end: 0,
          break: 0,
          workingtime: 0,
          pauses: [],
          continuouswork: [],
          violations: {},
        };
      }
      /* start of new week */
      if (!times.weeks[week]) {
        times.weeks[week] = { workingtime: 0, violations: {} };
      }
      /* start of new month */
      if (!times.months[month]) {
        times.months[month] = {
          workingtime: 0,
          daysoff: [],
          violations: {},
        };
      }
      /* set end time for running items */
      time.end = time.end ? time.end : moment().toDate();
      /* calculate worktime for current entry */
      const workingtime = time.end - time.start;
      times.days[day].workingtime += workingtime;
      times.weeks[week].workingtime += workingtime;
      times.months[month].workingtime += workingtime;

      /* set start time to minimum */
      if (times.days[day].start == 0 || times.days[day].start > time.start) {
        times.days[day].start = time.start;
      }
      /* set end time to maximum */
      if (times.days[day].end == 0 || times.days[day].end < time.end) {
        times.days[day].end = time.end;
      }

      /* calculate pauses - returns milliseconds, only show if longer than 6 min */
      if (
        lastendtime > 0 &&
        (time.start - lastendtime) / 1000 / 60 / 60 >
          CNF.workinghours.pause_minimum
      ) {
        times.days[day].pauses.push({
          start: moment(lastendtime).format(CNF.FORMAT_DATETIME_SORT),
          end: moment(time.start).format(CNF.FORMAT_DATETIME_SORT),
        });
        times.days[day].break += time.start - lastendtime;
      }

      /* if pause is longer than pause_main_minimum, break working into continuous chunks */
      if (
        !times.days[day].continuouswork.length ||
        (lastendtime > 0 &&
          (time.start - lastendtime) / 1000 / 60 / 60 >
            CNF.workinghours.pause_main_minimum)
      ) {
        times.days[day].continuouswork.push(workingtime);
      } else {
        times.days[day].continuouswork[
          times.days[day].continuouswork.length - 1
        ] += workingtime;
      }

      /* calculate days off - check if there are working days between current and previous day */
      if (lastday > 0) {
        daysbetween = moment(time.start)
          .startOf('day')
          .diff(moment(lastday).startOf('day'), 'days');
      }
      if (lastday > 0 && daysbetween > 1) {
        for (let daysadded = 1; daysadded < daysbetween; daysadded++) {
          const dayoff = moment(lastday).add(daysadded, 'days');
          if (dayoff.isWorkday()) {
            // to make sure, to book the days off into the correct month
            const corr_month = moment(dayoff)
              .startOf('month')
              .format(CNF.FORMAT_DATETIME_SORT);
            if (!times.months[corr_month]) {
              times.months[corr_month] = {
                workingtime: 0,
                daysoff: [],
                violations: {},
              };
            }
            times.months[corr_month].daysoff.push(
              moment(dayoff).format(CNF.FORMAT_DATETIME_SORT)
            );
          }
        }
      }

      lastendtime = time.end;
      lastday = time.start;
    });

    const hours = 1000 * 60 * 60;
    let time, previous;
    const timesheets = {};
    timesheets.days = [];
    timesheets.weeks = [];
    timesheets.months = [];
    time = previous = null;

    //  times = JSON.parse(JSON.stringify(timesbkp));
    for (const j in times) {
      for (const k in times[j]) {
        times[j][k].index = k;
        if (time) {
          previous = time;
        } else {
          previous = { start: 0, end: 0, workingtime: 0 };
        }
        time = times[j][k];
        // times[j][k].workingtime = formatDuration(times[j][k].workingtime, true);

        if (
          CNF.workinghours &&
          CNF.workinghours.ruleset &&
          CNF.workinghours.ruleset.length > 0
        ) {
          CNF.workinghours.ruleset.forEach(function(rule) {
            // only apply rules for correct context
            if (rule.context == j) {
              // if function is default, call it with parameters as this
              if (rule.fn && rule.fn.call({ time, previous, hours })) {
                // console.log('hitting violation', rule, times[j][k].violations);
                // add violations only if
                // .. there are none defined
                // .. the groupkey is empty
                // .. the groupkey level is lower than the current one
                if (
                  !times[j][k].violations ||
                  !times[j][k].violations[rule.groupkey] ||
                  (times[j][k].violations[rule.groupkey].alert == 'warning' &&
                    rule.alert == 'danger')
                ) {
                  // console.log('adding violation');
                  times[j][k].violations[rule.groupkey] = {
                    message: rule.message,
                    alert: rule.alert,
                  };
                }
              }
            }
          }, times[j][k]);
        }

        if (moment(times[j][k].index).isBefore(endtimeframe)) {
          timesheets[j].push({
            index: times[j][k].index,
            start: times[j][k].start,
            end: times[j][k].end,
            break: times[j][k].break,
            workingtime: times[j][k].workingtime,
            pauses: times[j][k].pauses,
            daysoff: times[j][k].daysoff,
            violations: Object.values(times[j][k].violations),
          });
        }
      }
    }
    return timesheets;
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
