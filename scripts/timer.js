var H5P = H5P || {};

/**
 * Timer
 *
 * TODO: something like "notifyAfterPlaying(milliSeconds, callback, params)"
 * TODO: something like "notifyEvery(milliSeconds, callback, params)"
 * TODO: countdown feature
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
      interval = Timer.DEFAULT_INTERVAL;
    }

    var status = Timer.STOPPED;

    var cacheMilliSeconds = 0;
    var playingMilliSeconds = 0;

    var firstDate, startDate, lastDate;

    var loop;

    /**
     * Get the timer status.
     *
     * @return {Number} The timer status.
     */
    this.getStatus = function() {
      return status;
    }

    /**
     * Get the time the timer was playing so far.
     *
     * @return {Number} The time played.
     */
    this.getPlayingTime = function() {
      return playingMilliSeconds;
    }

    /**
     * Get the total running time from start() (until stop()).
     *
     * @return {Number} The total running time.
     */
    this.getTotalTime = function() {
      if (status !== Timer.STOPPED) {
        return (new Date().getTime() - startDate);
      } else {
        return lastDate.getTime() - firstDate;
      }
    }

    /**
     * Set the starting time.
     *
     * @param {Number} time - The time in milliSeconds or timecode.
     */
    this.setTime = function(time) {
      if (status === Timer.STOPPED) {
      }
    }

    /**
     * Initialize the timer.
     */
    var init = function() {
      cacheMilliSeconds = 0;
      playingMilliSeconds = 0;
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
        init();
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
      cacheMilliSeconds += update(Timer.PAUSED);
      playingMilliSeconds = cacheMilliSeconds;
      startDate = undefined;
      status = Timer.PAUSED;
    }

    /**
     * Stop the timer.
     */
    this.stop = function() {
      if (status !== Timer.PLAYING) {
        return;
      }

      playingMilliSeconds = cacheMilliSeconds + update(Timer.STOPPED);
      lastDate = new Date();
      status = Timer.STOPPED;
    }

   /**
     * Update the timer until final call.
     *
     * @param {Number} targetStatus - The target Status.
     */
    var update = function (targetStatus) {
      var currentMilliSeconds = (new Date().getTime() - startDate);
      playingMilliSeconds = cacheMilliSeconds + currentMilliSeconds;

      if (targetStatus === Timer.PLAYING) {
        loop = setTimeout(function () {
          update(Timer.PLAYING);
        }, interval);
      } else {
        clearTimeout(loop);
        return currentMilliSeconds;
      }
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
    var humanize = function(timecode) {
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