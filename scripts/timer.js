var H5P = H5P || {};

/**
 * H5P-Timer
 *
 * General purpose timer that can be used by other H5P libraries.
 *
 * TODO: possibly something like dehumanize, so you could enter timecode for notifications
 *
 * @param {H5P.jQuery} $
 */
H5P.Timer = (function($) {
  /**
   * Create a timer.
   * @constructor
   * @param {number} [interval=Timer.DEFAULT_INTERVAL] - The update interval.
   */
  function Timer(interval = Timer.DEFAULT_INTERVAL) {
    var self = this;

    // time on clock and the time the clock has run
    var clockTimeMilliSeconds, playingTimeMilliSeconds;

    // indicators for total running time of the timer
    var firstDate, startDate, lastDate;

    // update loop
    var loop;

    // timer status
    var status = Timer.STOPPED;

    // indicate counting direction
    var mode;

    // notifications
    var notifications = [];

    // counter for notifications;
    var notificationsIdCounter = 0;

    /**
     * Get the timer status.
     * @return {number} The timer status.
     */
    self.getStatus = function() {
      return status;
    }

    /**
     * Get the time that's on the clock.
     * @return {number} The time on the clock.
     */
    var getClockTime = function() {
      return clockTimeMilliSeconds;
    }

    /**
     * Get the time the timer was playing so far.
     * @return {number} The time played.
     */
    var getPlayingTime = function() {
      return playingTimeMilliSeconds;
    }

    /**
     * Get the total running time from play() until stop().
     * @return {number} The total running time.
     */
    var getRunningTime = function() {
      if (status !== Timer.STOPPED) {
        return (new Date().getTime() - firstDate);
      }
      else {
        return (!lastDate) ? 0 : lastDate.getTime() - firstDate;
      }
    }

    /**
     * Get one of the times
     * @param {number} [type] - Type of the time to get.
     * @returns {number} Clock Time, Playing Time or Running Time.
     */
    self.getTime = function(type = Timer.TYPE_CLOCK) {
      if (!Number.isInteger(type)) {
        return;
      }
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
    }

    /**
     * Set the starting time.
     * @param {number} time - The time in milliseconds.
     */
    self.setClockTime = function(time) {
      if (Number.isInteger(time)) {
        clockTimeMilliSeconds = time;
      }
    }

    /**
     * Initialize the timer.
     */
    self.reset = function() {
      if (status === Timer.STOPPED) {
        if ((mode === Timer.FORWARD) || (!clockTimeMilliSeconds)) {
          clockTimeMilliSeconds = 0;
        }
        playingTimeMilliSeconds = 0;
        firstDate = undefined;
      }
    }

    /**
     * Start the timer.
     * @param {number} [direction=Timer.FORWARD] - Indicate counting up or down.
     */
    self.play = function(direction = Timer.FORWARD) {
      if (status === Timer.PLAYING) {
        return;
      }
      mode = (!Number.isInteger(direction)) ? Timer.FORWARD : direction;
      if (status === Timer.STOPPED) {
        self.reset();
      }
      if (!firstDate) {
        firstDate = new Date();
      }
      startDate = new Date();
      status = Timer.PLAYING;
      update();
    }

    /**
     * Pause the timer.
     */
    self.pause = function() {
      if (status !== Timer.PLAYING) {
        return;
      }
      status = Timer.PAUSED;
    }

    /**
     * Stop the timer.
     */
    self.stop = function() {
      if (status !== Timer.STOPPED) {
        lastDate = new Date();
        status = Timer.STOPPED;
      }
    }

    /**
     * Update the timer until Timer.STOPPED.
     */
    var update = function() {
      // stop because requested
      if (status === Timer.STOPPED) {
        clearTimeout(loop);
        return;
      }

      //stop because countdown reaches 0
      if ((mode === Timer.BACKWARD) && (clockTimeMilliSeconds <= 0)) {
        self.stop();
        return;
      }

      if (status === Timer.PLAYING) {
        var currentMilliSeconds = (new Date().getTime() - startDate);
        clockTimeMilliSeconds += currentMilliSeconds * mode;
        playingTimeMilliSeconds += currentMilliSeconds;
      }
      startDate = new Date();

      checkNotifications();

      loop = setTimeout(function() {
        update();
      }, interval);
    }

    /**
     * Get next notification id.
     * @returns {Number} id - The next id.
     */
    var getNextNotificationId = function() {
      return notificationsIdCounter++;
    }

    /**
     * Set a notification at a particular point in time.
     * @param {Number} type - Clock time, Playing time or Running time.
     * @param {number} calltime - Time when notification is triggered.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @returns {Number} ID of the notification passed by notify().
     */
    self.notifyAt = function(type, calltime, callback, params) {
      return notify(
        getNextNotificationId(),
        type,
        calltime,
        undefined,
        callback,
        params
      );
    }

    /**
     * Set a notification in a particular time distance.
     * @param {Number} type - Clock time, Playing time or Running time.
     * @param {number} time - Time distance for triggering.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @returns {Number} ID of the notification passed by notify().
     */
    self.notifyIn = function(type, time, callback, params) {
      if (!Number.isInteger(time)) {
        return;
      }
      time = Math.max(time, interval);
      if (type === Timer.TYPE_CLOCK) {
        // clock could run running backwards
        time *= mode;
      }
      time += self.getTime(type);

      return notify(
        getNextNotificationId(),
        type,
        time,
        undefined,
        callback,
        params
      );
    }

    /**
     * Set a notification repeatedly (starting from a particular point in time).
     * @param {Number} type - Clock time, Playing time or Running time.
     * @param {number} [startTime] - Time for first triggering.
     * @param {number} repeat - Time interval after which to repeat the notification.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @returns {Number} ID passed by notify().
     */
    self.notifyEvery = function(type, startTime = new Date().getTime(),
      repeat, callback, params) {
      return notify(
        getNextNotificationId(),
        type,
        startTime,
        repeat,
        callback,
        params);
    }

    /**
     * Add a notification.
     * @param {number} type - Clock Time, Playing Time or Running Time.
     * @param {number} calltime - Time when notification is triggered.
     * @param {number} [repeat] - Time interval after which to repeat the notification.
     * @callback callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @return {number} The ID of the notification.
     */
    var notify = function(id, type, calltime, repeat, callback, params) {
      //type checks
      if (!Number.isInteger(type)) {
        return;
      }
      if (!Number.isInteger(calltime)) {
        return;
      }
      // callback must be a function
      if (!callback instanceof Function) {
        return;
      }
      // repeat must be >= interval (ideally multiple of interval)
      if (repeat !== undefined) {
        if (!Number.isInteger(repeat)) {
          return;
        }
        repeat = Math.max(repeat, interval);
      }
      /*
       * only accept notification if its set for the future
       * which means calltime >= Clock Time if mode is BACKWARD (= -1)
       */
      var backwards = (type === Timer.TYPE_CLOCK) ? mode : 1;
      if (calltime <= self.getTime(type) * backwards) {
        return;
      }

      // add notification to existing ones
      var notification = {
        'id': id,
        'type': type,
        'calltime': calltime,
        'repeat': repeat,
        'callback': callback,
        'params': params
      };
      notifications.push(notification);

      return id;
    }

    /**
     * Remove a notification.
     * @param {number} id - The id of the notification.
     */
    self.clearNotification = function(id) {
      notifications = $.grep(notifications, function(item) {
        return item.id === id;
      }, true);
    }

    /**
     * Check notifications for necessary callbacks
     */
    var checkNotifications = function() {
      notifications.forEach(function(element) {
        /*
         * only trigger if clock time is in the past
         * which means calltime >= Clock Time if mode is BACKWARD (= -1)
         */
        var backwards = (element.type === Timer.TYPE_CLOCK) ? mode : 1;
        if (element.calltime <= self.getTime(element.type) * backwards) {
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
              element.params
            );
          }
        }
      });
    }
  }

  /**
   * Generate timecode elements from milliseconds.
   * @param {number} milliSeconds - The milliseconds.
   * @return {Object} The timecode elements.
   */
  var toTimecodeElements = function(milliSeconds) {
    if (!Number.isInteger(milliSeconds)) {
      return;
    }
    milliSeconds = Math.round(milliSeconds / 100);
    var tenthSeconds = milliSeconds - Math.floor(milliSeconds / 10) * 10;
    var seconds = Math.floor(milliSeconds / 10);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
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
   * @param {number} milliSeconds - The milliSeconds.
   * @param {string} element - Time element: hours, minutes, seconds or tenthSeconds.
   * @param {boolean} [rounded=false] - If true, element value will be rounded.
   * @return {number} The time element.
   */
  Timer.extractTimeElement = function(milliSeconds, element, rounded =
    false) {
    if (!Number.isInteger(milliSeconds)) {
      return;
    }
    if ($.type(element) !== 'string') {
      return;
    }
    if ($.type(rounded) !== 'boolean') {
      return;
    }

    var timeElements;
    if (rounded) {
      timeElements = {
        hours: Math.round(milliSeconds / 3600000),
        minutes: Math.round(milliSeconds / 60000),
        seconds: Math.round(milliSeconds / 1000),
        tenthSeconds: Math.round(milliSeconds / 100)
      }
    }
    else {
      timeElements = toTimecodeElements(milliSeconds);
    }

    return timeElements[element];
  };

  /**
   * Convert time in milliseconds to timecode.
   * @param {number} milliSeconds - The time in milliSeconds.
   * @return {string} The humanized timecode.
   */
  Timer.toTimecode = function(milliSeconds) {
    if (!Number.isInteger(milliSeconds)) {
      return;
    }

    var timecodeElements = toTimecodeElements(milliSeconds);

    // create timecode
    var timecode = '';

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
})(H5P.jQuery);