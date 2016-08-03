
CNF = {};
CNF.FORMAT_DATETIME = 'DD.MM.YYYY HH:mm';
CNF.FORMAT_TIMEFRAME_LONG = 'w[w] d[d] h[h] m[m] s[s]';
//CNF.FORMAT_TIMEFRAME_LONG = '%sd %sh %sm %ss';
CNF.FORMAT_TIMEFRAME_SHORT = 'H:M';
//CNF.FORMAT_TIMEFRAME_SHORT = '%s:%s:%s';

CNF.APPNAME = "TimeApp";

CNF.timeslots = {
	today: {
		label: "Today",
		usage: "normal",
		start: {
			$gte: moment().startOf("day").toDate(),
			$lte: moment().endOf("day").toDate(),
		}
	},
	yesterday: {
		label: "Yesterday",
		usage: "normal",
		start: {
			$gte: moment().subtract(1, 'days').startOf("day").toDate(),
			$lte: moment().subtract(1, 'days').endOf("day").toDate(),
		}
	},
	thisweek: {
		label: "this week",
		usage: "normal",
		start: {
			$gte: moment().startOf("isoWeek").toDate(),
			$lte: moment().endOf("isoWeek").toDate(),
		}
	},
	prevweek: {
		label: "previous week",
		usage: "normal",
		start: {
			$gte: moment().subtract(1, 'weeks').startOf("isoWeek").toDate(),
			$lte: moment().subtract(1, 'weeks').endOf("isoWeek").toDate(),
		}
	},
	thismonth: {
		label: "this month",
		usage: "normal",
		start: {
			$gte: moment().startOf("month").toDate(),
			$lte: moment().endOf("month").toDate(),
		}
	},
	prevmonth: {
		label: "previous month",
		usage: "normal",
		start: {
			$gte: moment().subtract(1, 'months').startOf("month").toDate(),
			$lte: moment().subtract(1, 'months').endOf("month").toDate(),
		}
	},
	total: {
		label: "Total",
		usage: "normal",
		start: {
			$gte: new Date(0)
		}
	}
	
};


for (index = 0; index < 12; index++) {
	var month = moment().locale('en').month(index).format("MMMM");
	CNF.timeslots[month] = {
		label: month,
		usage: "report",
		start: {
			$gte: moment().month(index).startOf("month").toDate(),
			$lte: moment().month(index).endOf("month").toDate(),
		}
	};
}