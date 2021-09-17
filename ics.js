var ics = function (uidDomain, prodId) {
  const SEPARATOR = "\n";
  const BYDAY_VALUES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const RRULE_FREQ = ["YEARLY", "MONTHLY", "WEEKLY", "DAILY"];

  this.uidDomain = uidDomain ?? "default";
  this.prodId = prodId ?? "Calendar";

  this.calendarEvents = [];
  this.calendarStart = ["BEGIN:VCALENDAR", `PRODID:${this.prodId}`, "VERSION:2.0"].join(SEPARATOR);
  this.calendarEnd = 'END:VCALENDAR';

  /**
   * Returns events array
   * @return {array} Events
   */
  this.events = function () {
    return this.calendarEvents;
  };

  /**
   * Returns calendar
   * @return {string} Calendar in iCalendar format
   */
  this.calendar = function () {
    return this.calendarStart + SEPARATOR + this.calendarEvents.join(SEPARATOR) + SEPARATOR + this.calendarEnd;
  };

  /**
   * Add event to the calendar
   * @param  {string} subject     Subject/Title of event
   * @param  {string} description Description of event
   * @param  {string} location    Location of event
   * @param  {mixed}  day         Beginning date of event
   * @param  {object} rules       Repeat rules
   * @param  {object} custom_fields Custom fields
   */
  this.addAllDayEvent = function (subject, description, location, day, rules, custom_fields) {
    return this.addEvent(subject, description, location, true, day, day, rules, custom_fields);
  };

  /**
   * Add event to the calendar
   * @param  {string} subject     Subject/Title of event
   * @param  {string} description Description of event
   * @param  {string} location    Location of event
   * @param  {boolean} isFullDay Is full day event
   * @param  {mixed} start       Beginning date of event
   * @param  {mixed} end        Ending date of event
   * @param  {object} rules       Repeat rules
   * @param  {object} custom_fields Custom fields
   */
  this.addEvent = function (subject, description, location, isFullDay, start, end, rules, custom_fields) {
    if (!subject || !description || !location || !start || !end) {
      return false;
    }

    let format = isFullDay ? "YYYYMMDD" : "YYYYMMDDTHHmmss";
    let date_value = isFullDay ? "DATE" : "DATE-TIME";
    let sstart = moment(start).format(format);
    let send = moment(end).format(format);
    let snow = moment().format("YYYYMMDDTHHmmss");

    var calendarEvent = [
      "BEGIN:VEVENT",
      `UID:${this.calendarEvents.length}@${this.uidDomain}`,
      "CLASS:PUBLIC",
      `DESCRIPTION:${description}`,
      `DTSTAMP;VALUE=DATE-TIME:${snow}`,
      `DTSTART;VALUE=${date_value}:${sstart}`,
      `DTEND;VALUE=${date_value}:${send}`,
      `LOCATION:${location}`,
      `SUMMARY;LANGUAGE=en-us:${subject}`,
      "TRANSP:TRANSPARENT",
    ];

    if (rules ) {
      rules = this._validate_repeat_rules(rules);
      calendarEvent.splice(4, 0, this._compose_repeat_rules(rules));
    }

    if (custom_fields) {
      for (const key in custom_fields) {
        if (custom_fields.hasOwnProperty(key)) {
          calendarEvent.push(`${key.toUpperCase()}:${custom_fields[key]}`);
        }
      }
    }

    calendarEvent.push("END:VEVENT");

    this.calendarEvents.push(calendarEvent.join(SEPARATOR));
    return calendarEvent;
  };

  /**
   * Download calendar using the saveAs function from filesave.js
   * @param  {string} filename Filename
   * @param  {string} ext      Extention
   */
  this.download = function (filename, ext) {
    let calendar = this.build();
    if (!calendar) {
      return null;
    }

    ext = ext ?? "ics";
    filename = filename ?? "calendar";

    let blob = new Blob([calendar], {
      type: 'text/x-vCalendar;charset=UFT-8',
    });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.${ext}`);
    link.click();
    return calendar;
  };

  /**
   * Build and return the ical contents
   */
  this.build = function () {
    if (this.calendarEvents.length === 0) {
      return null;
    }

    return this.calendar();
  };

  this._validate_repeat_rules = function (rrule) {
    if (RRULE_FREQ.indexOf(rrule.rrule) === -1) {
      throw new Error("Recurrence rrule frequency must be provided and be one of the following: " + RRULE_FREQ.join(", "));
    }

    if (rrule.until && isNaN(Date.parse(rrule.until))) {
      throw new Error("Recurrence rrule 'until' must be a valid date string");
    }

    if (rrule.interval && isNaN(parseInt(rrule.interval))) {
      throw new Error("Recurrence rrule 'interval' must be an integer");
    }

    if (rrule.count && isNaN(parseInt(rrule.count))) {
      throw new Error("Recurrence rrule 'count' must be an integer");
    }

    if (rrule.byday) {
      if (!Array.isArray(rrule.byday)) {
        throw new Error("Recurrence rrule 'byday' must be an array");
      }

      if (rrule.byday.length > 7) {
        throw new Error("Recurrence rrule 'byday' array must not be longer than the 7 days in a week");
      }

      // Filter any possible repeats
      rrule.byday = rrule.byday.filter((elem, pos) => rrule.byday.indexOf(elem) == pos);

      for (let b of  rrule.byday) {
        if (BYDAY_VALUES.indexOf(b) === -1) {
          throw new Error("Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'");
        }
      }
    }
    return rrule;
  };

  this._compose_repeat_rules = function(rrule) {
    let rruleString;
    if (rrule.rrule) {
      return rrule.rrule;
    } else {
      rruleString = `rrule:FREQ=${rrule.freq}`;

      if (rrule.until) {
        rruleString += `;UNTIL=${moment(rrule.until).format('YYYYMMDD[000000Z]')}`;
      }

      if (rrule.interval) {
        rruleString += `;INTERVAL=${rrule.interval}`;
      }

      if (rrule.count) {
        rruleString += `;COUNT=${rrule.count}`;
      }

      if (rrule.byday && rrule.byday.length > 0) {
        rruleString += `;BYDAY=${rrule.byday.join(",")}`;
      }
      return rruleString;
    }
  }
};
