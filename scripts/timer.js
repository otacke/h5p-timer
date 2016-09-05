var H5P = H5P || {};

/**
 * H5P-Timer
 *
 * General purpose timer that can be used by other H5P libraries.
 *
 * TODO: notifications class
 * TODO: something like "notifyAfter(milliSeconds, callback, params)"
 * TODO: something like "notifyIn(milliSeconds, callback, params)"
 * TODO: something like "notifyEvery(milliSeconds, callback, params)"
 * TODO: something like "killNotification(id)"
 *
 * @param {H5P.jQuery} $
 */
H5P.Timer = (function ($) {
  /**
   * Create a timer.
   * @constructor
   *
   * @param {Number} interval - The update interval.
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
     *
     * @return {Number} The timer status.
     */
    this.getStatus = function() {
      return status;
    }

    /**
     * Get the time that's on the clock.
     *
     * @return {Number} The time on the clock.
     */
    this.getClockTime = function() {
      return clockTimeMilliSeconds;
    }

    /**
     * Get the time the timer was playing so far.
     *
     * @return {Number} The time played.
     */
    this.getPlayingTime = function() {
      return playingTimeMilliSeconds;
    }

    /**
     * Get the total running time from play() until stop().
     *
     * @return {Number} The total running time.
     */
    this.getRunningTime = function() {
      if (status !== Timer.STOPPED) {
        return (new Date().getTime() - firstDate);
      }
      else {
        return lastDate.getTime() - firstDate;
      }
    }

    /**
     * Set the starting time.
     *
     * @param {Number} time - The time in milliseconds.
     */
    this.setClockTime = function(time) {
      if (Number.isInteger(time)) {
        clockTimeMilliSeconds = time;
      }
    }

    /**
     * Initialize the timer.
     */
    var reset = function() {
      if ((mode === Timer.FORWARD) || (!clockTimeMilliSeconds)) {
        clockTimeMilliSeconds = 0;
      }
      playingTimeMilliSeconds = 0;
      firstDate = undefined;
    }

    /**
     * Start the timer.
     *
     * @param {Number} direction - Indicate counting up or down.
     */
    this.play = function(direction = Timer.FORWARD) {
      if (status === Timer.PLAYING) {
        return;
      }
      mode = direction;
      if (status === Timer.STOPPED) {
        reset();
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
    this.pause = function() {
      if (status !== Timer.PLAYING) {
        return;
      }
      status = Timer.PAUSED;
    }

    /**
     * Stop the timer.
     */
    this.stop = function() {
      if (status !== Timer.STOPPED) {
        lastDate = new Date();
        status = Timer.STOPPED;
      }
    }

    /**
     * Update the timer until Timer.STOPPED.
     */
    var update = function () {
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
        clockTimeMilliSeconds   += currentMilliSeconds * mode;
        playingTimeMilliSeconds += currentMilliSeconds;
      }
      startDate = new Date();

      loop = setTimeout(function () {
        update();
      }, interval);
    }
    
    /**
     * Add a notification.
     *
     * @param {Number} type - Clock Time, Playing Time or Running Time.
     * @param {Number} calltime - Time when notification is triggered.
     * @param {Number} repeat - Time interval after which to repeat the notification.
     * @param {Function} callback - Callback function.
     * @param {Object} params - parameters for the callback function.
     * @return {Number} The ID of the notification.
     */
    this.notify = function(type, calltime, repeat, callback, params) {
      var id = notificationsIdCounter;
      notificationsIdCounter++;

      //type checks
      if (!Number.isInteger(type)) {
        return;
      }
      if (!Number.isInteger(calltime)) {
        return;
      }
      if (!Number.isInteger(repeat)) {
        return;
      }
      if (!callback instanceof Function) {
        return;
      }

      // TODO: Do some research about what might be the best way to store the notifications
      var data = {'type':type, 'calltime':calltime, 'repeat':repeat, 'callback':callback, 'params':params};
      var notification = {'id':id, 'data':data};
      notifications.push(notification); // is an array the best choice?

      return id;
    }

    /**
     * Remove a notification.
     *
     * @param {Number} id - The id of the notification.
     */    
    this.clearNotification = function(id) {
      // TODO: find the notification in notifications and delete it
    }

    /**
     * Check notifications for necessary callbacks
     */     
    var checkNotifications = function() {
      // TODO: walk all notifications, execute if time matches, delete or repeat
    }
  }

  /**
   * Generate timecode elements from milliseconds.
   *
   * @param {Number} milliSeconds - The milliseconds.
   * @return {Object} The timecode elements.
   */
  var toTimecodeElements = function(milliSeconds) {
    if (!Number.isInteger(milliSeconds)) {
      return;
    }
    milliSeconds = Math.round(milliSeconds/100);
    var tenthSeconds = milliSeconds - Math.floor(milliSeconds / 10) * 10;
    var seconds = Math.floor(milliSeconds / 10);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    minutes = Math.floor(minutes % 60);
    seconds = Math.floor(seconds % 60);

    return {hours:hours, minutes:minutes, seconds:seconds, tenthSeconds:tenthSeconds};
  };

  /**
   * Extract humanized time element from time.
   *
   * @param {Number} milliSeconds - The milliSeconds.
   * @param {String} element - Time element: hours, minutes, seconds or tenthSeconds.
   * @return {Number} The time element.
   */
  Timer.extractTimeElement = function(milliSeconds, element, rounded = false) {
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
          hours:Math.round(milliSeconds/3600000),
          minutes:Math.round(milliSeconds/60000),
          seconds:Math.round(milliSeconds/1000),
          tenthSeconds:Math.round(milliSeconds/100)
      }
    }
    else {
      timeElements = toTimecodeElements(milliSeconds);
    }

    return timeElements[element];
  };

  /**
   * Convert time in milliseconds to timecode.
   *
   * @param {Number} milliSeconds - The time in milliSeconds.
   * @return {String} The humanized timecode.
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
  /** @constant {Number} */
  Timer.STOPPED = 0;
  /** @constant {Number} */
  Timer.PLAYING = 1;
  /** @constant {Number} */
  Timer.PAUSED = 2;

  // Timer directions
  /** @constant {Number} */
  Timer.FORWARD = 1;
  /** @constant {Number} */
  Timer.BACKWARD = -1;

  /** @constant {Number} */
  Timer.DEFAULT_INTERVAL = 10;

  // Notification types
  /** @constant {Number} */
  Timer.TYPE_CLOCK = 0;
  /** @constant {Number} */
  Timer.TYPE_PLAYING = 1;
  /** @constant {Number} */
  Timer.TYPE_RUNNING = 2;

  return Timer;
})(H5P.jQuery);