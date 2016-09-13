var H5P = H5P || {};

/**
 * H5P-Timer
 *
 * General purpose timer that can be used by other H5P libraries.
 *
 * @param {H5P.jQuery} $
 */
H5P.Timer = function ($) {
  /**
   * Create a timer.
   * @constructor
   *
   * @param {number} [interval=Timer.DEFAULT_INTERVAL] - The update interval.
   */
  function Timer() {
    var interval = arguments.length <= 0 || arguments[0] === undefined
      ? Timer.DEFAULT_INTERVAL : arguments[0];

    var self = this;

    // time on clock and the time the clock has run
    var clockTimeMilliSeconds = 0;
    var playingTimeMilliSeconds = 0;

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

    /**
     * Get the timer status.
     *
     * @public
     * @return {number} The timer status.
     */
    self.getStatus = function () {
      return status;
    };

    /**
     * Get the timer mode.
     *
     * @public
     * @return {number} The timer mode.
     */
    self.getMode = function () {
      return mode;
    };

    /**
     * Get the time that's on the clock.
     *
     * @public
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
    self.getTime = function () {
      var type = arguments.length <= 0 || arguments[0] === undefined
        ? Timer.TYPE_CLOCK : arguments[0];

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
     * Set the starting time.
     *
     * @public
     * @param {number} time - The time in milliseconds.
     */
    self.setClockTime = function (time) {
      if ($.type(time) === 'string') {
        time = Timer.toMilliseconds(time);
      }
      if (!Number.isInteger(time)) {
        return;
      }
      clockTimeMilliSeconds = time;
    };

    /**
     * Reset the timer.
     *
     * @public
     */
    self.reset = function () {
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
    };

    /**
     * Set timer mode.
     *
     * @public
     * @param {number} mode - The timer mode.
     */
    self.setMode = function (direction) {
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
    self.play = function () {
      if (status === Timer.PLAYING) {
        return;
      }
      if (!firstDate) {
        firstDate = new Date();
      }
      startDate = new Date();
      status = Timer.PLAYING;
      update();
    };

    /**
     * Pause the timer.
     *
     * @public
     */
    self.pause = function () {
      if (status !== Timer.PLAYING) {
        return;
      }
      status = Timer.PAUSED;
    };

    /**
     * Stop the timer.
     *
     * @public
     */
    self.stop = function () {
      if (status === Timer.STOPPED) {
        return;
      }
      lastDate = new Date();
      status = Timer.STOPPED;
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

      loop = setTimeout(function () {
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
    self.notifyAt = function (type, calltime, callback, params) {
      return notify(getNextNotificationId(),
        type, calltime, undefined, callback, params);
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
    self.notifyIn = function (type, time, callback, params) {
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

      return notify(getNextNotificationId(),
        type, time, undefined, callback, params);
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
    self.notifyEvery = function (type, startTime, repeat, callback, params) {
      if (startTime === undefined) {
        startTime = self.getTime(type);
      }

      return notify(getNextNotificationId(),
        type, startTime, repeat, callback, params);
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
      if ($.type(calltime) === 'string') {
        calltime = Timer.toMilliseconds(calltime);
      }
      if (!Number.isInteger(calltime)) {
        return;
      }
      if (!callback instanceof Function) {
        return;
      }
      // repeat must be >= interval (ideally multiple of interval)
      if ($.type(repeat) === 'string') {
        repeat = Timer.toMilliseconds(repeat);
      }
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
    self.clearNotification = function (id) {
      notifications = $.grep(notifications, function (item) {
        return item.id === id;
      }, true);
    };

    /**
     * Check notifications for necessary callbacks.
     *
     * @private
     */
    var checkNotifications = function checkNotifications() {
      var backwards = 1;
      notifications.forEach(function (element) {
        /*
         * trigger if notification time is in the past
         * which means calltime >= Clock Time if mode is BACKWARD (= -1)
         */
        backwards = element.type === Timer.TYPE_CLOCK ? mode : 1;
        if (element.calltime * backwards <= self.getTime(element.type) * backwards) {
          // notify callback function
          element.callback.apply(this, element.params);

          // remove notification
          self.clearNotification(element.id);

          // rebuild notification if it should be repeated
          if (element.repeat) {
            notify(
              element.id,
              element.type,
              self.getTime(element.type) + element.repeat * backwards,
              element.repeat,
              element.callback,
              element.params);
          }
        }
      });
    };
  }

  /**
   * Generate timecode elements from milliseconds.
   *
   * @private
   * @param {number} milliSeconds - The milliseconds.
   * @return {Object} The timecode elements.
   */
  var toTimecodeElements = function toTimecodeElements(milliSeconds) {
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
    minutes = Math.floor(minutes % 60);
    seconds = Math.floor(seconds % 60);

    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      tenthSeconds: tenthSeconds
    };
  };

  /**
   * Extract humanized time element from time.
   *
   * @public
   * @param {number} milliSeconds - The milliSeconds.
   * @param {string} element - Time element: hours, minutes, seconds or tenthSeconds.
   * @param {boolean} [rounded=false] - If true, element value will be rounded.
   * @return {number} The time element.
   */
  Timer.extractTimeElement = function (milliSeconds, element) {
    var rounded = arguments.length <= 2 || arguments[2] === undefined
      ? false : arguments[2];

    var timeElements = null;
    if (!Number.isInteger(milliSeconds)) {
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
        hours: Math.round(milliSeconds / 3600000),
        minutes: Math.round(milliSeconds / 60000),
        seconds: Math.round(milliSeconds / 1000),
        tenthSeconds: Math.round(milliSeconds / 100)
      };
    }
    else {
      timeElements = toTimecodeElements(milliSeconds);
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
  Timer.toTimecode = function (milliSeconds) {
    var timecodeElements = null;
    var timecode = '';

    if (!Number.isInteger(milliSeconds)) {
      return;
    }

    timecodeElements = toTimecodeElements(milliSeconds);

    // create timecode
    if (timecodeElements['hours'] > 0) {
      timecode += timecodeElements['hours'] + ":";
    }
    if (timecodeElements['minutes'] < 10) {
      timecode += "0";
    }
    timecode += timecodeElements['minutes'] + ":";
    if (timecodeElements['seconds'] < 10) {
      timecode += "0";
    }
    timecode += timecodeElements['seconds'] + ".";
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
  Timer.toMilliseconds = function (timecode) {
    var head = [];
    var tail = '';

    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    var tenthSeconds = 0;

    if (!isTimecode(timecode)) {
      return;
    }

    // We can now be sure everything can be converted to a legit integer in range
    head = timecode.split('.')[0].split(':');
    while (head.length < 3) {
      head = ['0'].concat(head);
    }
    hours = parseInt(head[0]);
    minutes = parseInt(head[1]);
    seconds = parseInt(head[2]);

    tail = timecode.split('.')[1];
    if (tail) {
      tenthSeconds = Math.round(parseInt(tail) / Math.pow(10, tail.length - 1));
    }

    return (hours * 36000 + minutes * 600 + seconds * 10 + tenthSeconds) * 100;
  };

  /**
   * Check if a string is a timecode.
   *
   * @private
   * @param {string} value - String to check
   * @return {boolean} true, if string is a timecode
   */
  var isTimecode = function isTimecode(value) {
    // Don't insist on leading zeros for minutes and seconds
    var reg_timecode = /((\d+:)?(([0-5])?\d:)?(([0-5])?\d)(\.\d+)?)/;

    if ($.type(value) !== 'string') {
      return;
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
}(H5P.jQuery);
