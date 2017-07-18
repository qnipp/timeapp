(function(undefined) {
  /**
     * moment.easter
     * Source: https://github.com/zaygraveyard/moment-easter
     * License: MIT
     */
  moment.easter = function Easter20ops(year) {
    var a = ((year / 100) | 0) * 1483 - ((year / 400) | 0) * 2225 + 2613;
    var b = (((year % 19 * 3510 + ((a / 25) | 0) * 319) / 330) | 0) % 29;
    var c = 148 - b - (((year * 5 / 4) | 0) + a - b) % 7;

    return moment({ year: year, month: ((c / 31) | 0) - 1, day: c % 31 + 1 });
  };

  moment.fn.easter = function() {
    return moment.easter(this.year());
  };

/**
 * moment.isWorkday
 * Comment: These are National Holidays for Austria.
 * License: MIT
 */
moment.fn.isWorkday = function() {
  var easter = moment().easter(this.year());
  /* Exclude constrant holidays */
  return (
    !(this.isoWeekday() === 6) && // exclude Saturday (Weekend)
    !(this.isoWeekday() === 7) && // exclude Sunday (Weekend)
    !(this.dayOfYear() === 1) && // exclude New Year's Day (National holiday)
    !(this.dayOfYear() === 6) && // exclude Epiphany (National holiday)
    !(this.date() === 1 && this.month() === 4) && // exclude Labor Day (National holiday)
    !(this.date() === 15 && this.month() === 7) && // exclude Mariahimmelfahrt (National holiday)
    !(this.date() === 26 && this.month() === 9) && // exclude Constitution Day (National holiday)
    !(this.date() === 1 && this.month() === 10) && // exclude All Saints' Day (National holiday)
    !(this.date() === 8 && this.month() === 11) && // exclude Independence Day (National holiday)
    !(this.date() === 24 && this.month() === 11) && // exclude Christmas Day (National holiday)
    !(this.date() === 25 && this.month() === 11) && // exclude Christmas First Day (National holiday)
    !(this.date() === 26 && this.month() === 11) && // exclude Christmas Second Day (National holiday)
    
    /* Exclude moveing holidays */
    /* no need to exclude Easter Day - it's always on Sunday */
    //!this.isSame(easter.clone().add(-2, "days")) && // exclude Karfreitag (Religious holiday)
    !this.isSame(easter.clone().add(1, "days"), 'day') && // exclude Easter Monday (National holiday)
    /* no need to exclude Pfingst Sunday - it's always on Sunday */
    !this.isSame(easter.clone().add(39, "days"), 'day') && // exclude Christi Himmelfahrt (National holiday)
    !this.isSame(easter.clone().add(50, "days"), 'day') && // exclude Pfingstmontag (National holiday)
    !this.isSame(easter.clone().add(60, "days"), 'day') // exclude Fronleichnam (National holiday)
    
  );
};

  /**
     * moment.add/subtract workdays
     * Comment: Uses moment.isWorkday to determine if 
     * License: MIT
     */
  var oldAdd = moment.fn.add;
  var oldSubtract = moment.fn.subtract;
  moment.fn.add = function(input, val) {
    if (val === "workdays") {
      var increment = input / Math.abs(input);
      var date = this.clone().add(
        Math.floor(Math.abs(input) / 5) * 7 * increment,
        "days"
      );
      var remaining = input % 5;
      while (remaining != 0) {
        date.add(increment, "days");
        if (date.isWorkday()) {
          remaining -= increment;
        }
      }
      return date;
    }

    return oldAdd.call(this, input, val);
  };

  moment.fn.subtract = function(input, val) {
    if (val === "workdays") {
      var decrement = input / Math.abs(input);
      var date = this.clone().subtract(
        Math.floor(Math.abs(input) / 5) * 7 * decrement,
        "days"
      );
      var remaining = input % 5;
      while (remaining != 0) {
        date.subtract(decrement, "days");
        if (date.isWorkday()) {
          remaining -= decrement;
        }
      }
      return date;
    }

    return oldSubtract.call(this, input, val);
  };
}.call(this));
