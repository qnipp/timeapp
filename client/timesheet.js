import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';


// is called every time when page is reloaded
Template.timesheetlist.onCreated(function() {
  const self = this;
  self.asyncTimesheet = new ReactiveVar({
    days:  [{ index : 'Waiting for response from server...' }],
    weeks: [{ index : 'Waiting for response from server...' }], 
    months:[{ index : 'Waiting for response from server...' }],
  });

  /*
  Meteor.call('calculateTimesheet', Router.current().params._id, (error, result) => {
    console.log("itemreport onCreated with result: "+ Router.current().params._id);
    self.asyncTimesheet.set(result);
  });
  */
  
  self.autorun(() => {
    date = moment().subtract(24, 'months').toDate();

    Meteor.call('calculateTimesheet', Router.current().params._id, date, (error, result) => {
      console.log("itemreport autorun with result: "+ Router.current().params._id);
      self.asyncTimesheet.set(result);
    });
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
    /*if (this._id) {
      return Meteor.users.find(
        { _id: this._id },
        { fields: { _id: 1, emails: 1 } }
      );
    }*/
    return Meteor.users.find({}, { fields: { _id: 1, emails: 1 } });

    // return [{ _id: Meteor.userId(),  'emails.0.address': 'andreas@qnipp.com', 'timetoday': 123 }];
  },
});



Template.timesheetlist.helpers({
  timesheets() {
    return Template.instance().asyncTimesheet.get();

    //console.log(k + ": "+ workingtime);
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
        if(moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
          return moment(value, CNF.FORMAT_DATETIME_SORT).format(CNF.FORMAT_DATE);
        } else {
          return value;
        }
      };
      settings.fields.splice(5, 2); // days off, days off dates
      return settings;
  },
  tableSettingsTimesheetWeeks() {
    const settings = tableSettingsTimesheet();
    settings.fields[0].label = 'Week';
    settings.fields[0].fn = function(value, object, key) {
      if(moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
        return moment(value, CNF.FORMAT_DATETIME_SORT).format(CNF.FORMAT_WEEK);
      } else {
        return value;
      }
    };
    settings.fields.splice(4, 3); // pauses, days off, days off dates
    settings.fields.splice(1, 2); // start, end
    return settings;
  },
  tableSettingsTimesheetMonths() {
    const settings = tableSettingsTimesheet();
    settings.fields[0].label = 'Month';
    settings.fields[0].fn = function(value, object, key) {
      if(moment(value, CNF.FORMAT_DATETIME_SORT).isValid()) {
        return moment(value, CNF.FORMAT_DATETIME_SORT).format(CNF.FORMAT_MONTH);
      } else {
        return value;
      }
    };
    settings.fields.splice(4, 1);
    settings.fields.splice(1, 2); // start, end
    return settings;
  },

  /*
	isReady: function() {
		return Template.instance().currentUserId.get();
	},
	*/
});
