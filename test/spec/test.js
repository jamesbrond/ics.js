/*global describe, it, cal, assert */

(function () {
  'use strict';

  var stamp = new Date().toISOString();
  stamp = stamp.substring(0, stamp.length - 13).replace(/[-]/g, '') + '000000Z';

  describe('Load ics Object', function () {
    describe('Calendar Events Array', function () {
      it('should be an empty array initially', function () {
        assert.isArray(cal.events(), 'calendarEvents not an array');
        assert.lengthOf(cal.events(), '0');
      });
    });
    describe('Calendar String', function () {
      it('should be a string with no events', function () {
        assert.strictEqual(cal.calendar(), 'BEGIN:VCALENDAR\r\nPRODID:Calendar\r\nVERSION:2.0\r\n\r\nEND:VCALENDAR', 'calendar does not match');
      });
    });
  });
  describe('Add 1 Event', function () {
    describe('Calendar Events Array', function () {
      it('should have one event', function () {
        cal.addEvent('Christmas', 'Christian holiday celebrating the birth of Jesus Christ', 'Bethlehem', '12/25/2013', '12/25/2013');
        assert.isArray(cal.events(), 'calendarEvents not an array');
        assert.lengthOf(cal.events(), '1');
        assert.strictEqual(cal.events()[0], 'BEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:Christian holiday celebrating the birth of Jesus Christ\r\nDTSTART:20131225T000000\r\nDTEND:20131225T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:Bethlehem\r\nSUMMARY;LANGUAGE=en-us:Christmas\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT');
      });
    });
    describe('Calendar String', function () {
      it('should have one event', function () {
        assert.strictEqual(cal.calendar(), 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:Christian holiday celebrating the birth of Jesus Christ\r\nDTSTART:20131225T000000\r\nDTEND:20131225T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:Bethlehem\r\nSUMMARY;LANGUAGE=en-us:Christmas\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT\r\nEND:VCALENDAR', 'calendar does not match');
      });
    });
    describe('Calendar String of Single Digit Months', function () {
      it('should have one event', function () {
        cal.addEvent('Easter', 'Christian holiday celebrating the resurrection of Jesus Christ', 'Jerusalem', '04/20/2014', '04/20/2014');
        assert.strictEqual(cal.events()[1], 'BEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:Christian holiday celebrating the resurrection of Jesus Christ\r\nDTSTART:20140420T000000\r\nDTEND:20140420T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:Jerusalem\r\nSUMMARY;LANGUAGE=en-us:Easter\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT');
      });
    });
    describe('Calendar String of Single Digit Day', function () {
      it('should have one event', function () {
        cal.addEvent('April Fools Day', 'What isn\'t is', 'America', '4/1/2014', '4/1/2014');
        assert.strictEqual(cal.events()[2], 'BEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:What isn\'t is\r\nDTSTART:20140401T000000\r\nDTEND:20140401T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:America\r\nSUMMARY;LANGUAGE=en-us:April Fools Day\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT');
      });
    });

    describe('Recurring Events', function () {
      it('should add recurring events using frequency and until', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', until: '08/18/2014'});
      assert.strictEqual(cal.events()[3], 'BEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\r\nDTSTART:20140818T000000\r\nRRULE:FREQ=WEEKLY;UNTIL=20140818T000000Z\r\nDTEND:20140918T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:Soccer field\r\nSUMMARY;LANGUAGE=en-us:Soccer Practice\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT');
      });

      it('should add recurring events using interval and count', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', interval: 2, count: 10});
      assert.strictEqual(cal.events()[4], 'BEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\r\nDTSTART:20140818T000000\r\nRRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=10\r\nDTEND:20140918T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:Soccer field\r\nSUMMARY;LANGUAGE=en-us:Soccer Practice\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT');
      });

      it('should add recurring events using interval and until and byday', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', interval: 1, until: '08/18/2014', byday: ['MO','WE','FR']});
      assert.strictEqual(cal.events()[5], 'BEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\r\nDTSTART:20140818T000000\r\nRRULE:FREQ=WEEKLY;UNTIL=20140818T000000Z;INTERVAL=1;BYDAY=MO,WE,FR\r\nDTEND:20140918T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:Soccer field\r\nSUMMARY;LANGUAGE=en-us:Soccer Practice\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT');
      });

      it('should add recurring events using interval and until and ignore duplicates in byday array', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', interval: 1, until: '08/18/2014', byday: ['MO', 'WE', 'MO']});
      assert.strictEqual(cal.events()[6], 'BEGIN:VEVENT\r\nCLASS:PUBLIC\r\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\r\nDTSTART:20140818T000000\r\nRRULE:FREQ=WEEKLY;UNTIL=20140818T000000Z;INTERVAL=1;BYDAY=MO,WE\r\nDTEND:20140918T000000\r\nDTSTAMP:' + stamp + '\r\nLOCATION:Soccer field\r\nSUMMARY;LANGUAGE=en-us:Soccer Practice\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT');
      });
    });
  });
})();
