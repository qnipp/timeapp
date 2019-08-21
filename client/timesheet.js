import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// is called every time when page is reloaded
Template.timesheetlist.onCreated(function() {
  const self = this;
  self.asyncTimesheet = new ReactiveVar({
    days: [{ index: 'Waiting for response from server...' }],
    weeks: [{ index: 'Waiting for response from server...' }],
    months: [{ index: 'Waiting for response from server...' }],
  });

  /*
  Meteor.call('calculateTimesheet', Router.current().params._id, (error, result) => {
    console.log("itemreport onCreated with result: "+ Router.current().params._id);
    self.asyncTimesheet.set(result);
  });
  */

  self.autorun(() => {
    const year = Router.current().params.year;

    const date = year ? moment({ year }).toDate() : null;

    const enddate = year
      ? moment(date)
          .add(12, 'months')
          .toDate()
      : null;

    Meteor.call(
      'calculateTimesheet',
      Router.current().params._id,
      date,
      enddate,
      (error, result) => {
        console.log(
          `itemreport autorun with result: ${Router.current().params._id}`,
          result
        );
        self.asyncTimesheet.set(result);
      }
    );
  });
});

Template.userlist.events({
  // 'click .reactive-table tbody tr': function (event) {
  'click .jsuserload'(event) {
    Router.go(Router.path('timesheet.detail', { _id: this._id }));
  },
});

Template.userlist.helpers({
  users() {
    /* if (this._id) {
      return Meteor.users.find(
        { _id: this._id },
        { fields: { _id: 1, emails: 1 } }
      );
    }*/
    return Meteor.users.find({}, { fields: { _id: 1, emails: 1 } });

    // return [{ _id: Meteor.userId(),  'emails.0.address': 'andreas@qnipp.com', 'timetoday': 123 }];
  },
  username(user) {
    return (
      user &&
      ((user.profile && user.profile.name) ||
        (user.emails && user.emails[0].address))
    );
  },
});

Template.timesheetlist.helpers({
  timesheets() {
    return Template.instance().asyncTimesheet.get();

    // console.log(k + ": "+ workingtime);
  },

  // current user (TODO: add all other users)
  users() {
    if (this._id) {
      return Meteor.users.find(
        { _id: this._id },
        { fields: { _id: 1, emails: 1 } }
      );
    }
    return Meteor.users.find({}, { fields: { _id: 1, emails: 1 } });

    // return [{ _id: Meteor.userId(),  'emails.0.address': 'andreas@qnipp.com', 'timetoday': 123 }];
  },

  tableSettingsTimesheet() {
    return tableSettingsTimesheet();
  },
  tableSettingsTimesheetDays() {
    const settings = tableSettingsTimesheet();
    settings.fields[0].label = 'Day';
    settings.fields[0].fn = function(value, object, key) {
      if (moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
        return moment(value, CNF.FORMAT_DATETIME_SORT).format(CNF.FORMAT_DATE);
      }
      return value;
    };
    settings.fields = settings.fields.filter(field =>
      [
        'index',
        'start',
        'end',
        'break',
        'workingtime',
        'pauses',
        'violations',
      ].includes(field.key)
    );
    return settings;
  },
  tableSettingsTimesheetWeeks() {
    const settings = tableSettingsTimesheet();
    settings.fields[0].label = 'Week';
    settings.fields[0].fn = function(value, object, key) {
      if (moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
        return moment(value, CNF.FORMAT_DATETIME_SORT).format(CNF.FORMAT_WEEK);
      }
      return value;
    };
    settings.fields = settings.fields.filter(field =>
      ['index', 'workingtime', 'violations'].includes(field.key)
    );
    return settings;
  },
  tableSettingsTimesheetMonths() {
    const settings = tableSettingsTimesheet();
    settings.fields[0].label = 'Month';
    settings.fields[0].fn = function(value, object, key) {
      if (moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
        return moment(value, CNF.FORMAT_DATETIME_SORT).format(CNF.FORMAT_MONTH);
      }
      return value;
    };
    settings.fields = settings.fields.filter(field =>
      ['index', 'workingtime', 'daysoff', 'daysoffcount'].includes(field.key)
    );
    return settings;
  },

  /*
	isReady: function() {
		return Template.instance().currentUserId.get();
	},
	*/
});
