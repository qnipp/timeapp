// seperated field function used below
tableSettingsFieldFn = function(timeslot, groupby, userid) {
  if (!groupby) {
    groupby = 'user';
  }
  /*
	if(groupby == 'tag') {
		console.log('userid: ' + userid);
	}
	*/
  return {
    key: `time${timeslot}`,
    label: CNF.timeslots[timeslot].label,
    sortByValue: false,
    sortable: true,
    // tmpl: Template.tablecellSimple,

    fn(value, element, key) {
      let timeelapsed = 0;

      if (groupby == 'user') {
        // all times for one user

        // userid is set within row
        userid = element._id;

        // find all items, that have a calculated sum for given user
        const query = {};
        query['totals.userid'] = userid;
        query[`totals.${timeslot}`] = { $gt: 0 };

        const fields = {};
        fields['totals.userid'] = 1;
        fields[`totals.${timeslot}`] = 1;

        // get calculated base value for given item
        Items.find(query, { fields, reactive: false }).map(function(item) {
          timeelapsed += getTimeslotValueFromTotals(
            item.totals,
            userid,
            timeslot
          );
        });

        // add times that are not summed up
        // if ", reactive: false" is added here, user part in reports stays empty
        Times.find(
          {
            createdBy: userid,
            start: CNF.timeslots[timeslot].start,
          },
          { fields: { start: true, end: true } }
        ).map(function(doc) {
          timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
        });
      } else if (groupby == 'item') {
        // all times for one user, group by item

        // get calculated base value
        timeelapsed = getTimeslotValueFromTotals(
          element.totals,
          userid,
          timeslot
        );

        // userid is set within row
        if (userid) {
          // add times that are not summed up for given item
          Times.find(
            {
              createdBy: userid,
              item: element._id,
              start: CNF.timeslots[timeslot].start,
            },
            { fields: { start: true, end: true }, reactive: false }
          ).map(function(doc) {
            timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
          });
        } else {
          // add times that are not summed up for given item
          Times.find(
            {
              item: element._id,
              start: CNF.timeslots[timeslot].start,
            },
            { fields: { start: true, end: true }, reactive: false }
          ).map(function(doc) {
            timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
          });
        }
      } else if (groupby == 'tag') {
        // all times for one user, group by tag
        if ((element.type = 'item-tag')) {
          // get all items with given tag
          Items.find({ tags: element._id }).map(function(item) {
            // console.log('userid: ' + userid + ' timeslot: ' +  timeslot +' totals: ');
            // console.log(item.totals);

            // get calculated base value
            timeelapsed += getTimeslotValueFromTotals(
              item.totals,
              userid,
              timeslot
            );

            // console.log('timeelapsed: ' + timeelapsed);

            // userid is set within row
            if (userid) {
              // add times that are not summed up for given item
              Times.find(
                {
                  createdBy: userid,
                  item: item._id,
                  start: CNF.timeslots[timeslot].start,
                },
                { fields: { start: true, end: true }, reactive: false }
              ).map(function(doc) {
                timeelapsed +=
                  (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
              });
            } else {
              // add times that are not summed up for given item
              Times.find(
                {
                  item: item._id,
                  start: CNF.timeslots[timeslot].start,
                },
                { fields: { start: true, end: true }, reactive: false }
              ).map(function(doc) {
                timeelapsed +=
                  (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
              });
            }
          });
        } else if ((element.type = 'time-tag')) {
          // TODO: if we dont have a single item, we need to sum up all items :\
          // TODO: time-tags are broken :(

          // add times that are not summed up for given tag
          Times.find(
            {
              createdBy: userid,
              tags: element._id,
              start: CNF.timeslots[timeslot].start,
            },
            { fields: { start: true, end: true }, reactive: false }
          ).map(function(doc) {
            timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
          });
        }
      }

      // return formated total duration
      return formatDuration(timeelapsed, true);

      // return timeelapsed;
    },
  };
};

// route: route - sum of all times in total
tableSettings = function(firstcol, firstcoltemplate, timeslotusage, userid) {
  const fields = [];
  let settings = {};

  if (!timeslotusage) {
    timeslotusage = 'normal';
  }

  if (!firstcol) {
    firstcol = 'user';
  }

  if (!firstcoltemplate) {
    firstcoltemplate = null;
  }

  // default settings value - all on one page, no paging
  settings = {
    showFilter: false,
    showNavigation: 'never',
    // showNavigation: 'auto',
    rowsPerPage: 1000,
  };

  if (firstcol == 'user') {
    if (firstcoltemplate) {
      fields.push({
        key: 'emails.0.address',
        label: 'User',
        tmpl: firstcoltemplate,
        sortByValue: false,
        sortable: true,
        sortOrder: 0,
        sortDirection: 'asc',
        /*
				fn: function(value, user, key) {
					if(Meteor.users.findOne({_id: user._id}).emails) {
						return Meteor.users.findOne({_id: user._id}).emails[0].address;
					} else {
						return 'unknown';
					}
				}
				*/
      });
    }
    // set onclick class
    settings.rowClass = function(element) {
      return element._id == this._id ? 'info jsuserload' : 'jsuserload';
    };
  } else if (firstcol == 'item') {
    if (firstcoltemplate) {
      fields.push({
        key: 'name',
        label: 'Item',
        // tmpl: Template.itemlistentryItem,
        tmpl: firstcoltemplate,
        sortByValue: false,
        sortable: true,
        sortOrder: 0,
        sortDirection: 'asc',

        // only for client-side sorting
        fn(value, item, key) {
          return item.title;
        },
      });
    }

    // set onclick class
    settings.rowClass = function(element) {
      return element._id == this._id ? 'info jsitemload' : 'jsitemload';
    };
  } else if (firstcol == 'tag') {
    if (firstcoltemplate) {
      fields.push({
        key: 'name',
        label: 'Tag',
        // tmpl: Template.taglistentryItem,
        tmpl: firstcoltemplate,
        sortByValue: false,
        sortable: true,
        sortOrder: 0,
        sortDirection: 'asc',
        // only for client-side sorting
        fn(value, tag, key) {
          return `${tag.name} ${tag.value}`;
        },
      });
    }

    // set onclick class
    settings.rowClass = function(element) {
      return element._id == this._id ? 'info jstagload' : 'jstagload';
    };
  }

  for (const key in CNF.timeslots) {
    if (CNF.timeslots[key].usage != timeslotusage) continue;

    // each timeslot will go into a new column, firstcol defines how the sums are generated
    fields.push(tableSettingsFieldFn(key, firstcol, userid));
  }

  if (firstcol == 'item' /* && timeslotusage == 'report'*/) {
    fields.push({
      key: 'estimate',
      label: 'estimate',
      sortByValue: false,
      sortable: true,
      tmpl: Template.estimatedresultentry,
      // only for client-side sorting
      fn(value, item, key) {
        // return item;

        let attribIdEstimate = Attributes.findOne({
          name: CNF.PLUGIN.JIRA.ATTRIBUTES.ESTIMATE,
        });
        if (!attribIdEstimate) return '';
        attribIdEstimate = attribIdEstimate._id;

        const indexEstimate = getIndexfromArray(
          attribIdEstimate,
          item.attributes,
          'attribid'
        );
        if (indexEstimate >= 0 && item.attributes[indexEstimate].value) {
          const timeestimated =
            parseFloat(item.attributes[indexEstimate].value) * 60 * 60 * 1000;

          return timeestimated;

          // get calculated base value
          let timeelapsed = getTimeslotValueFromTotals(
            item.totals,
            null,
            'total'
          );

          // add times that are not summed up for given item
          Times.find(
            {
              item: item._id,
              start: CNF.timeslots.total.start,
            },
            { fields: { start: true, end: true }, reactive: false }
          ).map(function(doc) {
            timeelapsed += (doc.end > 0 ? doc.end : reactiveDate()) - doc.start;
          });

          let color = 'black';
          // coloring result
          if (timeelapsed < timeestimated * 0.9) {
            color = 'blue';
          } else if (timeelapsed < timeestimated * 1.1) {
            color = 'green';
          } else if (timeelapsed < timeestimated * 1.2) {
            color = 'yellow';
          } else if (timeelapsed < timeestimated * 1.5) {
            color = 'orange';
          } else {
            color = 'red';
          }

          return Blaze.toHTMLWithData(Template.estimatedresultentry, {
            percentage: `${Math.floor(timeelapsed * 100 / timeestimated)}%`,
            timeestimated: formatDuration(timeestimated, true),
            timeelapsed: formatDuration(timeelapsed, true),
            color,
          });
        }
        return '';
      },
    });
  }

  // set fields
  settings.fields = fields;
  // and return
  return settings;
};

// route: times - list of all time entries
tableSettingsTime = function() {
  return {
    rowsPerPage: 20,
    showFilter: true,
    showNavigation: 'auto',
    rowClass(item) {
      return item._id == this._id ? 'info jstimeload' : 'jstimeload';
    },
    fields: [
      {
        key: 'item',
        label: 'Item',

        // tmpl: Template.timelistentryItem,

        fn(value, time, key) {
          // value == time.item
          const item = loadItem(value, false, null);

          if (item) {
            return new Spacebars.SafeString(
              `<span>${item.title} </span>` +
                `<small>${item.description}</small>`
            );
          }
          return `Loading item: ${value}`;
        },
        sortByValue: true,
        sortable: false,
      },
      {
        key: 'start',
        label: 'Start',

        // tmpl: Template.timelistentryStart,

        fn(value, time, key) {
          if (time.start) {
            // time.start_fmt = moment.utc(time.start).format(CNF.FORMAT_DATETIME);
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
        // tmpl: Template.timelistentryEnd,

        fn(value, time, key) {
          if (time.end) {
            // time.end_fmt = moment.utc(time.end).format(CNF.FORMAT_DATETIME);
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
        // tmpl: Template.timelistentryDuration,

        fn(value, time, key) {
          if (time.end) {
            time.duration_fmt = formatDuration(time.end - time.start);
          } else {
            // time.duration_fmt = formatDuration(new Date() - time.start);
            time.duration_fmt = formatDuration(reactiveDate() - time.start);
          }
          return time.duration_fmt;
        },

        // sortByValue: true,
        sortable: false,
      },
      {
        key: 'comments',
        label: 'Comments',

        fn(value, time, key) {
          if (!value) return;
          return value
            .map(function(comment) {
              return comment.comment;
            })
            .join(', ');
        },

        // sortByValue: true,
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

// route: timesheet - list of all timesheets
tableSettingsTimesheet = function() {
  return {
    rowsPerPage: 1000,
    showFilter: false,
    showNavigation: 'never',
    rowClass(item) {
      // return item._id == this._id ? 'info jstimeload' : 'jstimeload';
      return item._id == this._id ? 'info' : '';
    },
    fields: [
      {
        key: 'index',
        label: 'Day',
        // tmpl: Template.timelistentryItem,
        fn(value, object, key) {
          // will be overritten in timesheet.js for day, month and week
          return value;
        },
        sortByValue: true,
        /* sortable: false,*/
        sortOrder: 0,
        sortDirection: 'descending',
      },
      {
        key: 'start',
        label: 'Start',
        fn(value, object, key) {
          if (moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
            return moment(value, CNF.FORMAT_DATETIME_SORT).format(
              CNF.FORMAT_TIME
            );
          }
          return value;
        },
        sortByValue: true,
        sortOrder: 1,
        sortDirection: 'descending',
      },
      {
        key: 'end',
        label: 'End',
        fn(value, object, key) {
          if (moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
            return moment(value, CNF.FORMAT_DATETIME_SORT).format(
              CNF.FORMAT_TIME
            );
          }
          return value;
        },
        sortByValue: true,

        sortOrder: 2,
        sortDirection: 'descending',
      },
      {
        key: 'break',
        label: 'Break',

        fn(value, object, key) {
          return formatDuration(value, true);
        },
      },
      {
        key: 'workingtime',
        label: 'Working Time',

        fn(value, object, key) {
          return formatDuration(value, true);
        },

        // sortByValue: true,
        // sortable: true,
      },
      {
        key: 'pauses',
        label: 'Break times',
        fn(value, object, key) {
          if (value && value.length > 0) {
            // return value.join(" | ");
            return value.reduce(function(prev, newitem) {
              return `${prev +
                (prev ? ' | ' : '') +
                moment(newitem.start).format(
                  CNF.FORMAT_TIME
                )} - ${moment(newitem.end).format(CNF.FORMAT_TIME)}`;
            }, '');
          }
        },
        // sortByValue: true,
        sortable: false,
        cellClass: 'hidden-print',
        headerClass: 'hidden-print',
      },
      {
        key: 'daysoffcount',
        label: 'Days Off',
        fn(value, object, key) {
          if (object.daysoff && object.daysoff.length > 0) {
            // return value.join(" | ");
            return `${object.daysoff.length} day${
              object.daysoff.length > 1 ? 's' : ''
            }`;
          }
        },
        // sortByValue: true,
        sortable: true,
      },
      {
        key: 'daysoff',
        label: 'Days Off Dates',
        fn(value, object, key) {
          if (value && value.length > 0) {
            // return value.join(" | ");
            return value.reduce(function(prev, newitem) {
              return (
                prev +
                (prev ? ', ' : '') +
                moment(newitem).format(CNF.FORMAT_DATE_SHORT)
              );
            }, '');
          }
        },
        // sortByValue: true,
        sortable: true,
      },
      {
        key: 'violations',
        label: 'working hours violations',
        tmpl: Template.workinghoursviolations,
        fn(violations, object, key) {
          if (violations) {
            /*
            // return value.join(" | ");
            let violation_string = '';

            for (var groupkey in violations) {
              violation_string += '<span class="text-'+ violations[groupkey].alert +'">'+ violations[groupkey].message +'</span>';
            }
            return Blaze.toHTMLWithData(violation_string;*/

            return Blaze.toHTMLWithData(Template.workinghoursviolations, {
              violations,
            });
          }
        },
        // sortByValue: true,
        sortable: true,
        cellClass: 'hidden-print',
        headerClass: 'hidden-print',
      },
    ],
  };
};
