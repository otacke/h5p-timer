var H5P = H5P || {};

/**
 * Timer
 *
 * TODO: make some methods private, clean the code
 * TODO: something like "callMeAfterPlaying(milliSeconds, callback, params)"
 * TODO: something like "callMeEvery(milliSeconds, callback, params)"
 *
 * @param {H5P.jQuery} $
 */
H5P.Timer = (function ($) {
  /**
   * @class H5P.Timer
   */
  function Timer(interval) {
    var self = this;

    if (!interval) {
      interval = 100;
    }

    var timerStatus = Timer.STOPPED;
    
    // TODO: There's probably a way to use only two variables for the timing...
    var cacheMilliSeconds = 0;
    var lapMilliSeconds = 0;
    var totalMilliSeconds = 0;

    // TODO: There's probably a way to use only two variables for the dates...
    var firstDate;
    var lastDate;
    var startDate;

    var timerLoop;
    
    /**
     * return the timer status
     *
     * @returns {Number} timer status
     */
    this.getStatus = function() {
      return timerStatus;
    }

    /**
     * get the time the timer was playing
     *
     * @returns {Number} time played
     */
    this.getPlayingTime = function() {
      if (timerStatus === Timer.PLAYING) {
        return lapMilliSeconds;
      }
      if (timerStatus === Timer.PAUSED) {
        return cacheMilliSeconds;
      }
      if (timerStatus === Timer.STOPPED) {
        return totalMilliSeconds;
      }      
    }

    /**
     * get the total running time (until stopped)
     *
     * @returns {Number} total running time
     */
    this.getTotalTime = function() {
      if (timerStatus !== Timer.STOPPED) {
        return (new Date().getTime() - startDate);
      } else {
        return lastDate.getTime() - firstDate;
      }
    }

    /**
     * start the timer
     */
    this.play = function() {
      if (timerStatus === Timer.PLAYING) {
        return;
      }
      if (timerStatus === Timer.STOPPED) {
        cacheMilliSeconds = 0;
        lapMilliSeconds = 0;
        totalMilliSeconds = 0;
        firstDate = undefined;
      }
      if (!firstDate) {
        firstDate = new Date();
      }
      startDate = new Date();
      timerStatus = Timer.PLAYING;
      update(Timer.PLAYING);
    }

    /**
     * pause the timer
     */
    this.pause = function() {
      if (timerStatus !== Timer.PLAYING) {
        return;
      }
      cacheMilliSeconds += update(Timer.PAUSED);
      startDate = undefined;
      timerStatus = Timer.PAUSED;      
    }

    /**
     * stop the timer
     */    
    this.stop = function() {
      if (timerStatus !== Timer.PLAYING) {
        return;
      }        
      
      totalMilliSeconds = cacheMilliSeconds + update(Timer.STOPPED);
      lastDate = new Date();
      timerStatus = Timer.STOPPED;      
    }
    
   /**
     * Update the timer until final call
     *
     * @private
     * @param {Number} target status
     */
    var update = function (targetStatus) {
      var currentMilliSeconds = (new Date().getTime() - startDate);
      lapMilliSeconds = cacheMilliSeconds + currentMilliSeconds;

      if (targetStatus === Timer.PLAYING) {
        timerLoop = setTimeout(function () {
          update(Timer.PLAYING);
        }, interval);        
      } else {
        clearTimeout(timerLoop);
        return currentMilliSeconds;
      }
    }
    
    /**
     * humanize time down to tenth of seconds
     *
     * @param {Number} milliSeconds
     * @returns {String} humanized Timer
     */
    var humanize = function(milliSeconds) {
    }
    
    /**
     * humanize time down to tenth of seconds
     *
     * @param {Number} milliSeconds
     * @returns {String} humanized Timer
     */
    var humanize = function(milliSeconds) {
    }    
  }
  
  // Timer states
  /** @constant {Number} */
  Timer.STOPPED = 0;
  /** @constant {Number} */
  Timer.PLAYING = 1;
  /** @constant {Number} */
  Timer.PAUSED = 2;
  
  return Timer;  
})(H5P.jQuery);