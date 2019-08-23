CNF.workinghours = {};
/* minimum 6 minutes pause */
CNF.workinghours.pause_minimum = 0.1;
/* minimum main pause is 30minutes  */
CNF.workinghours.pause_main_minimum = 0.5;

CNF.workinghours.ruleset = [
  /**
   * variables to be used:
   * time.: start, end, workingtime, pauses, continuouswork
   *  pauses: [] .. pause time
   *  continuouswork: [] .. uninterupted working times
   * previous.: start, end, workingtime
   */
  // days
  {
    context: 'days',
    groupkey: 'workinghours',
    fn() {
      return this.time.workingtime > 8 * this.hours;
    },
    alert: 'warning',
    message: 'Working time is over 8 hours per day.',
  },
  {
    context: 'days',
    groupkey: 'workinghours',
    fn() {
      return this.time.workingtime > 10 * this.hours;
    },
    alert: 'danger',
    message: 'Working time is over 10 hours per day.',
  },
  {
    context: 'days',
    groupkey: 'start',
    fn() {
      return (
        moment(this.time.start).hour() < 7 || moment(this.time.end).hour() < 7
      );
    },
    alert: 'danger',
    message: 'Worked before 7:00.',
  },
  {
    context: 'days',
    groupkey: 'end',
    fn() {
      return (
        moment(this.time.start).hour() >= 21 ||
        moment(this.time.end).hour() >= 21
      );
    },
    alert: 'danger',
    message: 'Worked after 21:00.',
  },
  {
    context: 'days',
    groupkey: 'sparetime',
    fn() {
      return this.time.start - this.previous.end < 11 * this.hours;
    },
    alert: 'warning',
    message: 'Resting time is shorter than 11 hours.',
  },
  {
    context: 'days',
    groupkey: 'sparetime',
    fn() {
      return this.time.start - this.previous.end < 10 * this.hours;
    },
    alert: 'danger',
    message: 'Resting time is shorter than 10 hours.',
  },
  {
    context: 'days',
    groupkey: 'pauses',
    fn() {
      return (
        this.time.workingtime > 6 * this.hours &&
        Math.max(...this.time.pauses) <
          CNF.workinghours.pause_main_minimum * this.hours
      );
    },
    alert: 'danger',
    message:
      `The pause is shorter than ${ 
      CNF.workinghours.pause_main_minimum
    } hours.`,
  },
  // Problem: continuouswork is depending on pause times - if 45min is minimum pause
  // the continuous work parts will change.
  {
    context: 'days',
    groupkey: 'pausestart',
    fn() {
      return Math.max(...this.time.continuouswork) > 5.5 * this.hours;
    },
    alert: 'warning',
    message: 'No pause after 5.5 hours of work.',
  },
  {
    context: 'days',
    groupkey: 'pausestart',
    fn() {
      return Math.max(...this.time.continuouswork) > 6 * this.hours;
    },
    alert: 'danger',
    message: 'No pause after 6 hours of work.',
  },

  // weeks
  {
    context: 'weeks',
    groupkey: 'workinghours',
    fn() {
      return this.time.workingtime > 38.5 * this.hours;
    },
    alert: 'warning',
    message: 'Working time is over 38.5 hours per week.',
  },
  {
    context: 'weeks',
    groupkey: 'workinghours',
    fn() {
      return this.time.workingtime > 50 * this.hours;
    },
    alert: 'danger',
    message: 'Working time is over 50 hours per week.',
  },
];
