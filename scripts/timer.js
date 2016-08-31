var H5P = H5P || {};

/**
 * H5P-Timer
 *
 * General purpose timer that can be used by other H5P libraries.
 *
 * TODO: clean code
 * TODO: countdown feature
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
      var interval = Timer.DEFAULT_INTERVAL;
    }

    var clockTimeMilliSeconds, playingTimeMilliSeconds;

    var firstDate, startDate, lastDate;

    var loop;
    
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
     * Get the total running time from start() (until stop()).
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
     * @param {Number} time - The time in milliSeconds or timecode.
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
      update(Timer.PLAYING);
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
      if ((status === Timer.STOPPED)) {
        clearTimeout(loop);
        return;
      }

      if (status === Timer.PLAYING) {
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