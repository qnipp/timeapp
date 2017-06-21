import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.itemcontainer.helpers({
  running() {
    // returns the ids of the current running items of the actual user
    return Times.find(
      {
        createdBy: Meteor.userId(),
        end: {
          $not: { $ne: null }
        }
      },
      { fields: { item: 1 } }
    )
      .fetch()
      .map(doc => doc.item);
  }
});
