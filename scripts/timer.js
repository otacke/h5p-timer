var H5P = H5P || {};

/**
 * H5P-Timer
 *
 * General purpose timer that can be used by other H5P libraries.
 *
 * TODO: countdown feature
 * TODO: humanize() and dehumanize()
 * TODO: notifications class
 * TODO: something like "notifyAfter(milliSeconds, callback, params)"
 * TODO: something like "notifyIn(milliSeconds, callback, params)"
 * TODO: something like "notifyEvery(milliSeconds, callback, params)"
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
  function Timer(interval) {
    var self = this;

    if (!interval) {
      // determines the timing precision (kind of)
      var interval = Timer.DEFAULT_INTERVAL;
    }

    // time on clock and the time the clock has run
    var clockTimeMilliSeconds, playingTimeMilliSeconds;

    // indicators for total running time of the timer
    var firstDate, startDate, lastDate;

    // update loop
    var loop;

    // timer status    
    var status = Timer.STOPPED;

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
      } else {
        return lastDate.getTime() - firstDate;
      }
    }

    /**
     * Set the starting time.
     *
     * @param {Number} time - The time in milli seconds.
     */
    this.setClockTime = function(time) {
      clockTimeMilliSeconds = time;
    }

    /**
     * Initialize the timer.
     */
    var reset = function() {
      clockTimeMilliSeconds = 0;
      playingTimeMilliSeconds = 0;
      firstDate = undefined;
    }

    /**
     * Start the timer.
     */
    this.play = function() {
      if (status === Timer.PLAYING) {
        return;
      }
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
      if (status === Timer.STOPPED) {
        clearTimeout(loop);
        return;
      }

      if (status === Timer.PLAYING) {
        // TODO: Check if this is better than using interval as delta
        var currentMilliSeconds = (new Date().getTime() - startDate);
        clockTimeMilliSeconds   += currentMilliSeconds;
        playingTimeMilliSeconds += currentMilliSeconds;
      }
      startDate = new Date();

      loop = setTimeout(function () {
        update();
      }, interval);
    }

    /**
     * Humanize time down to tenth of seconds.
     *
     * @param {Number} milliSeconds - The time in milliSeconds.
     * @return {String} The humanized time.
     */
    var humanize = function(milliSeconds) {
    }

    /**
     * Dehumanize time from down to tenth of seconds.
     *
     * @param {String} timecode - The humanized time.
     * @return {Number} The time in milliSeconds.
     */
    var dehumanize = function(timecode) {
    }
  }

  // Timer states
  /** @constant {Number} */
  Timer.STOPPED = 0;
  /** @constant {Number} */
  Timer.PLAYING = 1;
  /** @constant {Number} */
  Timer.PAUSED = 2;

  // Timer direction
  /** @constant {Number} */
  Timer.FORWARD = 1;
  /** @constant {Number} */
  Timer.BACKWARD = -1;

  /** @constant {Number} */
  Timer.DEFAULT_INTERVAL = 10;

  return Timer;
})(H5P.jQuery);