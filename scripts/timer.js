var H5P = H5P || {};

/**
 * H5P-Timer
 *
 * General purpose timer that can be used by other H5P libraries.
 *
 * @param {H5P.jQuery} $
 */
H5P.Timer = (function($, EventDispatcher) {
  /**
   * Create a timer.
   * @constructor
   *
   * @param {number} [interval=Timer.DEFAULT_INTERVAL] - The update interval.
   */
  function Timer() {
    var interval = arguments.length <= 0 || arguments[0] === undefined ?
      Timer.DEFAULT_INTERVAL : arguments[0];

    var self = this;

    // time on clock and the time the clock has run
    var clockTimeMilliSeconds = 0;
    var playingTimeMilliSeconds = 0;

    // used to update recurring notifications
    var clockUpdateMilliSeconds = 0;

    // indicators for total running time of the timer
    var firstDate = null;
    var startDate = null;
    var lastDate = null;

    // update loop
    var loop = null;

    // timer status
    var status = Timer.STOPPED;

    // indicate counting direction
    var mode = Timer.FORWARD;

    // notifications
    var notifications = [];

    // counter for notifications;
    var notificationsIdCounter = 0;

    // Inheritance
    H5P.EventDispatcher.call(self);

    // sanitize interval
    if (Number.isInteger(interval)) {
      interval = Math.max(interval, 1);
    }
    else {
      interval = Timer.DEFAULT_INTERVAL;
    }

    /**
     * Get the timer status.
     *
     * @public
     * @return {number} The timer status.
     */
    self.getStatus = function() {
      return status;
    };

    /**
     * Get the timer mode.
     *
     * @public
     * @return {number} The timer mode.
     */
    self.getMode = function() {
      return mode;
    };

    /**
     * Get the time that's on the clock.
     *
     * @private
     * @return {number} The time on the clock.
     */
    var getClockTime = function getClockTime() {
      return clockTimeMilliSeconds;
    };

    /**
     * Get the time the timer was playing so far.
     *
     * @private
     * @return {number} The time played.
     */
    var getPlayingTime = function getPlayingTime() {
      return playingTimeMilliSeconds;
    };

    /**
     * Get the total running time from play() until stop().
     *
     * @private
     * @return {number} The total running time.
     */
    var getRunningTime = function getRunningTime() {
      if (!firstDate) {
        return 0;
      }
      if (status !== Timer.STOPPED) {
        return new Date().getTime() - firstDate.getTime();
      }
      else {
        return !lastDate ? 0 : lastDate.getTime() - firstDate;
      }
    };

    /**
     * Get one of the times.
     *
     * @public
     * @param {number} [type=Timer.TYPE_CLOCK] - Type of the time to get.
     * @return {number} Clock Time, Playing Time or Running Time.
     */
    self.getTime = function() {
      var type = arguments.length <= 0 || arguments[0] === undefined ?
        Timer.TYPE_CLOCK : arguments[0];

      if (!Number.isInteger(type)) {
        return;
      }
      // break will never be reached, but for consistency...
      switch (type) {
        case Timer.TYPE_CLOCK:
          return getClockTime();
          break;
        case Timer.TYPE_PLAYING:
          return getPlayingTime();
          break;
        case Timer.TYPE_RUNNING:
          return getRunningTime();
          break;
        default:
          return getClockTime();
      }
    };

    /**
     * Set the clock time.
     *
     * @public
     * @param {number} time - The time in milliseconds.
     */
    self.setClockTime = function(time) {
      if ($.type(time) === 'string') {
        time = Timer.toMilliseconds(time);
      }
      if (!Number.isInteger(time)) {
        return;
      }
      // notifications only need an update if changing clock against direction
      clockUpdateMilliSeconds = (time - clockTimeMilliSeconds) * mode < 0 ?
        time - clockTimeMilliSeconds : 0;
      clockTimeMilliSeconds = time;
    };

    /**
     * Reset the timer.
     *
     * @public
     */
    self.reset = function() {
      if (status !== Timer.STOPPED) {
        return;
      }
      clockTimeMilliSeconds = 0;
      playingTimeMilliSeconds = 0;

      firstDate = null;
      lastDate = null;

      loop = null;

      notifications = [];
      notificationsIdCounter = 0;
      self.trigger('reset');
    };

    /**
     * Set timer mode.
     *
     * @public
     * @param {number} mode - The timer mode.
     */
    self.setMode = function(direction) {
      if (direction !== Timer.FORWARD && direction !== Timer.BACKWARD) {
        return;
      }
      mode = direction;
    };

    /**
     * Start the timer.
     *
     * @public
     */
    self.play = function() {
      if (status === Timer.PLAYING) {
        return;
      }
      if (!firstDate) {
        firstDate = new Date();
      }
      startDate = new Date();
      status = Timer.PLAYING;
      self.trigger('play');
      update();
    };

    /**
     * Pause the timer.
     *
     * @public
     */
    self.pause = function() {
      if (status !== Timer.PLAYING) {
        return;
      }
      status = Timer.PAUSED;
      self.trigger('pause');
    };

    /**
     * Stop the timer.
     *
     * @public
     */
    self.stop = function() {
      if (status === Timer.STOPPED) {
        return;
      }
      lastDate = new Date();
      status = Timer.STOPPED;
      self.trigger('stop');
    };

    /**
     * Update the timer until Timer.STOPPED.
     *
     * @private
     */
    var update = function update() {
      var currentMilliSeconds = 0;
      // stop because requested
      if (status === Timer.STOPPED) {
        clearTimeout(loop);
        return;
      }

      //stop because countdown reaches 0
      if (mode === Timer.BACKWARD && clockTimeMilliSeconds <= 0) {
        self.stop();
        return;
      }

      // update times
      if (status === Timer.PLAYING) {
        currentMilliSeconds = new Date().getTime() - startDate;
        clockTimeMilliSeconds += currentMilliSeconds * mode;
        playingTimeMilliSeconds += currentMilliSeconds;
      }
      startDate = new Date();

      checkNotifications();

      loop = setTimeout(function() {
        update();
      }, interval);
    };

    /**
     * Get next notification id.
     *
     * @private
     * @return {number} id - The next id.
     */
    var getNextNotificationId = function getNextNotificationId() {
      return notificationsIdCounter++;
    };

    /**
     * Set a notification at a particular point in time.
     *
     * @public
     * @param {number} type - Clock time, Playing time or Running time.
     * @param {number} calltime - Time when notification is triggered.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @return {number} ID of the notification passed by notify().
     */
    self.notifyAt = function(type, calltime, callback, params) {
      return notify(getNextNotificationId(), type, calltime, undefined,
        callback, params);
    };

    /**
     * Set a notification in a particular time distance.
     *
     * @public
     * @param {number} type - Clock time, Playing time or Running time.
     * @param {number} time - Time distance for triggering.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @return {number} ID of the notification passed by notify().
     */
    self.notifyIn = function(type, time, callback, params) {
      if ($.type(time) === 'string') {
        time = Timer.toMilliseconds(time);
      }
      if (!Number.isInteger(time)) {
        return;
      }
      time = Math.max(time, interval);
      if (type === Timer.TYPE_CLOCK) {
        // clock could be running backwards
        time *= mode;
      }
      time += self.getTime(type);

      return notify(getNextNotificationId(), type, time, undefined,
        callback, params);
    };

    /**
     * Set a notification repeatedly (starting from a particular point in time).
     *
     * @public
     * @param {number} type - Clock time, Playing time or Running time.
     * @param {number} startTime - Time for first triggering.
     * @param {number} repeat - Time interval after which to repeat the notification.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @return {number} ID passed by notify().
     */
    self.notifyEvery = function(type, startTime, repeat, callback, params) {
      if (startTime === undefined) {
        startTime = self.getTime(type);
      }

      return notify(getNextNotificationId(), type, startTime, repeat,
        callback, params);
    };

    /**
     * Add a notification.
     *
     * @private
     * @param {number} type - Clock Time, Playing Time or Running Time.
     * @param {number} calltime - Time when notification is triggered.
     * @param {number} [repeat] - Time interval after which to repeat the notification.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @return {number} The ID of the notification.
     */
    var notify = function notify(id, type, calltime, repeat, callback, params) {
      //type checks
      if (!Number.isInteger(type)) {
        return;
      }
      if (type < Timer.TYPE_CLOCK || type > Timer.TYPE_RUNNING) {
        return;
      }
      if ($.type(calltime) === 'string') {
        calltime = Timer.toMilliseconds(calltime);
      }
      if (!Number.isInteger(calltime)) {
        return;
      }
      if (calltime < 0) {
        return;
      }
      if (!callback instanceof Function) {
        return;
      }
      if ($.type(repeat) === 'string') {
        repeat = Timer.toMilliseconds(repeat);
      }
      // repeat must be >= interval (ideally multiple of interval)
      if (repeat !== undefined) {
        if (!Number.isInteger(repeat)) {
          return;
        }
        repeat = Math.max(repeat, interval);
      }

      // add notification to existing ones
      notifications.push({
        'id': id,
        'type': type,
        'calltime': calltime,
        'repeat': repeat,
        'callback': callback,
        'params': params
      });

      return id;
    };

    /**
     * Remove a notification.
     *
     * @public
     * @param {number} id - The id of the notification.
     */
    self.clearNotification = function(id) {
      notifications = $.grep(notifications, function(item) {
        return item.id === id;
      }, true);
    };

    /**
     * Set a new starting time for notifications.
     *
     * @private
     * @param elements {Object] elements - The notifications to be updated.
     * @param deltaMilliSeconds {Number} - The time difference to be set.
     */
    var updateNotificationTime = function updateNotificationTime(elements,
      deltaMilliSeconds) {
      if (!Number.isInteger(deltaMilliSeconds)) {
        return;
      }
      elements.forEach(function(element) {
        // remove notification
        self.clearNotification(element.id);

        //rebuild notification with new data
        notify(element.id, element.type, self.getTime(element.type) +
          deltaMilliSeconds, element.repeat, element.callback,
          element.params);
      });
    };

    /**
     * Check notifications for necessary callbacks.
     *
     * @private
     */
    var checkNotifications = function checkNotifications() {
      var backwards = 1;
      var elements = [];

      // update recurring clock notifications if clock was changed
      if (clockUpdateMilliSeconds !== 0) {
        elements = $.grep(notifications, function(item) {
          return item.type === Timer.TYPE_CLOCK && item.repeat !=
            undefined;
        });
        updateNotificationTime(elements, clockUpdateMilliSeconds);
        clockUpdateMilliSeconds = 0;
      }

      // check all notifications for triggering
      notifications.forEach(function(element) {
        /*
         * trigger if notification time is in the past
         * which means calltime >= Clock Time if mode is BACKWARD (= -1)
         */
        backwards = element.type === Timer.TYPE_CLOCK ? mode : 1;
        if (element.calltime * backwards <= self.getTime(element.type) *
          backwards) {
          // notify callback function
          element.callback.apply(this, element.params);

          // remove notification
          self.clearNotification(element.id);

          // You could use updateNotificationTime() here, but waste some time

          // rebuild notification if it should be repeated
          if (element.repeat) {
            notify(element.id, element.type, self.getTime(element.type) +
              element.repeat * backwards, element.repeat, element.callback,
              element.params);
          }
        }
      });
    };
  }

  // Inheritance
  Timer.prototype = Object.create(H5P.EventDispatcher.prototype);
  Timer.prototype.constructor = Timer;

  /**
   * Generate timecode elements from milliseconds.
   *
   * @private
   * @param {number} milliSeconds - The milliseconds.
   * @return {Object} The timecode elements.
   */
  var toTimecodeElements = function toTimecodeElements(milliSeconds) {
    var years = 0;
    var month = 0;
    var weeks = 0;
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    var tenthSeconds = 0;

    if (!Number.isInteger(milliSeconds)) {
      return;
    }
    milliSeconds = Math.round(milliSeconds / 100);
    tenthSeconds = milliSeconds - Math.floor(milliSeconds / 10) * 10;
    seconds = Math.floor(milliSeconds / 10);
    minutes = Math.floor(seconds / 60);
    hours = Math.floor(minutes / 60);
    days = Math.floor(hours / 24);
    weeks = Math.floor(days / 7);
    month = Math.floor(days / 30.4375); // roughly (30.4375 = mean of 4 years)
    years = Math.floor(days / 365); // roughly (no leap years considered)
    return {
      years: years,
      month: month,
      weeks: weeks,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      tenthSeconds: tenthSeconds
    };
  };

  /**
   * Extract humanized time element from time for concatenating.
   *
   * @public
   * @param {number} milliSeconds - The milliSeconds.
   * @param {string} element - Time element: hours, minutes, seconds or tenthSeconds.
   * @param {boolean} [rounded=false] - If true, element value will be rounded.
   * @return {number} The time element.
   */
  Timer.extractTimeElement = function(time, element) {
    var rounded = arguments.length <= 2 || arguments[2] === undefined ?
      false : arguments[2];

    var timeElements = null;

    if ($.type(time) === 'string') {
      time = Timer.toMilliseconds(time);
    }
    if (!Number.isInteger(time)) {
      return;
    }
    if ($.type(element) !== 'string') {
      return;
    }
    if ($.type(rounded) !== 'boolean') {
      return;
    }

    if (rounded) {
      timeElements = {
        years: Math.round(time / 31536000000),
        month: Math.round(time / 2629800000),
        weeks: Math.round(time / 604800000),
        days: Math.round(time / 86400000),
        hours: Math.round(time / 3600000),
        minutes: Math.round(time / 60000),
        seconds: Math.round(time / 1000),
        tenthSeconds: Math.round(time / 100)
      };
    } else {
      timeElements = toTimecodeElements(time);
    }

    return timeElements[element];
  };

  /**
   * Convert time in milliseconds to timecode.
   *
   * @public
   * @param {number} milliSeconds - The time in milliSeconds.
   * @return {string} The humanized timecode.
   */
  Timer.toTimecode = function(milliSeconds) {
    var timecodeElements = null;
    var timecode = '';

    var minutes = 0;
    var seconds = 0;

    if (!Number.isInteger(milliSeconds)) {
      return;
    }
    if (milliSeconds < 0) {
      return;
    }

    timecodeElements = toTimecodeElements(milliSeconds);
    minutes = Math.floor(timecodeElements['minutes'] % 60);
    seconds = Math.floor(timecodeElements['seconds'] % 60);

    // create timecode
    if (timecodeElements['hours'] > 0) {
      timecode += timecodeElements['hours'] + ':';
    }
    if (minutes < 10) {
      timecode += '0';
    }
    timecode += minutes + ':';
    if (seconds < 10) {
      timecode += '0';
    }
    timecode += seconds + '.';
    timecode += timecodeElements['tenthSeconds'];

    return timecode;
  };

  /**
   * Convert timecode to milliseconds.
   *
   * @public
   * @param {string} timecode - The timecode.
   * @return {number} Milliseconds derived from timecode
   */
  Timer.toMilliseconds = function(timecode) {
    var head = [];
    var tail = '';

    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    var tenthSeconds = 0;

    if (!Timer.isTimecode(timecode)) {
      return;
    }

    // thx to the regexp we know everything can be converted to a legit integer in range
    head = timecode.split('.')[0].split(':');
    while (head.length < 3) {
      head = ['0'].concat(head);
    }
    hours = parseInt(head[0]);
    minutes = parseInt(head[1]);
    seconds = parseInt(head[2]);

    tail = timecode.split('.')[1];
    if (tail) {
      tenthSeconds = Math.round(parseInt(tail) / Math.pow(10, tail.length -
        1));
    }

    return (hours * 36000 + minutes * 600 + seconds * 10 + tenthSeconds) *
      100;
  };

  /**
   * Check if a string is a timecode.
   *
   * @public
   * @param {string} value - String to check
   * @return {boolean} true, if string is a timecode
   */
  Timer.isTimecode = function (value) {
    var reg_timecode = /((((((\d+:)?([0-5]))?\d:)?([0-5]))?\d)(\.\d+)?)/;

    if ($.type(value) !== 'string') {
      return false;
    }

    return value === value.match(reg_timecode)[0] ? true : false;
  };

  // Timer states
  /** @constant {number} */
  Timer.STOPPED = 0;
  /** @constant {number} */
  Timer.PLAYING = 1;
  /** @constant {number} */
  Timer.PAUSED = 2;

  // Timer directions
  /** @constant {number} */
  Timer.FORWARD = 1;
  /** @constant {number} */
  Timer.BACKWARD = -1;

  /** @constant {number} */
  Timer.DEFAULT_INTERVAL = 10;

  // Notification types
  /** @constant {number} */
  Timer.TYPE_CLOCK = 0;
  /** @constant {number} */
  Timer.TYPE_PLAYING = 1;
  /** @constant {number} */
  Timer.TYPE_RUNNING = 2;

  return Timer;
}) (H5P.jQuery, H5P.EventDispatcher);