CNF = {};
CNF.FORMAT_DATETIME = 'DD.MM.YYYY HH:mm';
CNF.FORMAT_DATETIME_SORT = 'YYYY-MM-DD HH:mm'; // yes > _SORT for sorting
CNF.FORMAT_DATE = 'dd DD.MM.YYYY';
CNF.FORMAT_DATE_SHORT = 'DD.MM.';
CNF.FORMAT_MONTH = 'YYYY MMMM';
CNF.FORMAT_WEEK = 'YYYY [KW]WW';
CNF.FORMAT_TIME = 'HH:mm';

CNF.FORMAT_TIMEFRAME_LONG = 'w[w] d[d] h[h] m[m] s[s]';
// CNF.FORMAT_TIMEFRAME_LONG = '%sd %sh %sm %ss';
CNF.FORMAT_TIMEFRAME_SHORT = 'H:M';
// CNF.FORMAT_TIMEFRAME_SHORT = '%s:%s:%s';

CNF.REACTIVEDATE_REFRESH = 15000;

CNF.APPNAME = 'TimeApp';

// all plugins should go to plugins part
CNF.PLUGIN = {};

// JIRA Plugin, can load title, description, status and estimate from jira
CNF.PLUGIN.JIRA = {};

CNF.PLUGIN.JIRA.URL = 'https://jira.super-fi.net';
CNF.PLUGIN.JIRA.SESSION = {};
CNF.PLUGIN.JIRA.SESSION.AUTH = 'sessionkey';
CNF.PLUGIN.JIRA.ATTRIBUTES = {};
CNF.PLUGIN.JIRA.ATTRIBUTES.KEY = 'JIRA ID';
// CNF.PLUGIN.JIRA.ATTRIBUTES.PROJECT = 'JIRA Project';
// CNF.PLUGIN.JIRA.ATTRIBUTES.STATE = 'Itemstate';
// CNF.PLUGIN.JIRA.ATTRIBUTES.ORDERSTATE = 'Orderstate';
CNF.PLUGIN.JIRA.ATTRIBUTES.ESTIMATE = 'Estimate (hours)';

// REDMINE plugin, can load title, description, status and estimate from redmine
CNF.PLUGIN.REDMINE = {};
CNF.PLUGIN.REDMINE.ATTRIBUTES = {};
CNF.PLUGIN.REDMINE.URL = 'https://redmine.qnipp.com/';
CNF.PLUGIN.REDMINE.ATTRIBUTES.KEY = 'REDMINE ID';
CNF.PLUGIN.REDMINE.ATTRIBUTES.PROJECT = 'REDMINE Project';
CNF.PLUGIN.REDMINE.ATTRIBUTES.ESTIMATE = 'Estimate (hours)';

CNF.timeslots = {
  today: {
    label: 'Today',
    usage: 'normal',
    start: {
      $gte: moment()
        .startOf('day')
        .toDate(),
      $lte: moment()
        .endOf('day')
        .toDate(),
    },
  },
  yesterday: {
    label: 'Yesterday',
    usage: 'normal',
    start: {
      $gte: moment()
        .subtract(1, 'days')
        .startOf('day')
        .toDate(),
      $lte: moment()
        .subtract(1, 'days')
        .endOf('day')
        .toDate(),
    },
  },
  thisweek: {
    label: 'this week',
    usage: 'normal',
    start: {
      $gte: moment()
        .startOf('isoWeek')
        .toDate(),
      $lte: moment()
        .endOf('isoWeek')
        .toDate(),
    },
  },
  prevweek: {
    label: 'previous week',
    usage: 'normal',
    start: {
      $gte: moment()
        .subtract(1, 'weeks')
        .startOf('isoWeek')
        .toDate(),
      $lte: moment()
        .subtract(1, 'weeks')
        .endOf('isoWeek')
        .toDate(),
    },
  },
  thismonth: {
    label: 'this month',
    usage: 'normal',
    start: {
      $gte: moment()
        .startOf('month')
        .toDate(),
      $lte: moment()
        .endOf('month')
        .toDate(),
    },
  },
  prevmonth: {
    label: 'previous month',
    usage: 'normal',
    start: {
      $gte: moment()
        .subtract(1, 'months')
        .startOf('month')
        .toDate(),
      $lte: moment()
        .subtract(1, 'months')
        .endOf('month')
        .toDate(),
    },
  },
  total: {
    label: 'Total',
    usage: 'normal',
    start: {
      $gte: new Date(0),
    },
  },
};

// Set year manually to retrieve old years
const year = moment()
  .locale('en')
  .format('YYYY');
const startMonth = moment().subtract(11, 'months');

for (index = 0; index < 12; index++) {
  const month = startMonth.clone().add(index, 'months');

  CNF.timeslots[month.locale('en').format('MMMM_YYYY')] = {
    label: month.locale('en').format('MMMM'),
    usage: 'report',
    start: {
      $gte: month.startOf('month').toDate(),
      $lte: month.endOf('month').toDate(),
    },
  };
}

CNF.timeslots[`Total ${year}`] = {
  label: `Total ${year}`,
  usage: 'report',
  start: {
    $gte: moment()
      .year(year)
      .startOf('year')
      .toDate(),
    $lte: moment()
      .year(year)
      .endOf('year')
      .toDate(),
  },
};

CNF.timeslots[`Total ${year - 1}`] = {
  label: `Total ${year - 1}`,
  usage: 'report',
  start: {
    $gte: moment()
      .year(year - 1)
      .startOf('year')
      .toDate(),
    $lte: moment()
      .year(year - 1)
      .endOf('year')
      .toDate(),
  },
};

CNF.timeslots['Total Overall'] = {
  label: 'Total overall',
  usage: 'report',
  start: {
    $gte: new Date(0),
  },
};
