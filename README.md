H5P Timer
==========
General purpose timer that can be used by other H5P libraries.

The timer is not intended for time critical applications, but it can easily be used to keep track of time in games, to set a time limit for tasks, or to create other innovative content libraries that need triggers based on time. What about a mod-player that can handle ProTracker files for example? ;-)


## Features
- can count up and down
- can use milliseconds internally but only "displays" tenths of seconds and above
- can be paused
- keeps track of three different types of counters
  - clock time (can be modified even if running, e.g to give a time bonus)
  - playing time (the amount of time that the clock has been ticking)
  - running time (the total running time ignoring pauses)
- offers three types of notifications using callback functions for each type of counter
  - notification at a particular point in time
  - notification after a certain time period has passed
  - recurring notifications in fixed intervals
- dispatches events for play, pause, stop and reset
- offers some static utility functions
  - check if something is a timecode
  - convert timecodes to milliseconds and vice versa
  - extract single time elements like days or seconds from timecode or milliseconds


## How you can use it

### First steps

### Functions

#### Configuration and setup
**`Timer():Timer`**

Creates a Timer with three different counters.

There's an optional `interval` paramter that is set to 10 milliseconds (`Timer.DEFAULT_INTERVAL`) by default. It indicates the interval for updating the counters.

*Examples*
- `myTimer = Timer();` will create a timer that uses the internal default update interval of 10 milliseconds.
- `myTimer = Timer(100);` will create a timer that uses an internal update interval of 100 milliseconds.


**`setMode(direction:Number):Void`**

Sets the mode or direction for the clock counter. Possible values for the `direction` parameter are:

- -1 (`Timer.BACKWARD`)
- 1 (`Timer.FORWARD`)

*Examples*
- `myTimer.setMode(H5P.Timer.BACKWARD);` can be used to set up a countdown than runs backwards or even for changing the direction while the timer is running.
- `myTimer.setMode(H5P.Timer.FORWARD);` can be used to change the direction of the timer if it had been changed to backwards before.

**`setClockTime(time:String|Number):Void`**
    
Sets the clock counter to a particular position. For example, this can be used to setup a countdown. Setting the clock is also possible while the timer is playing. This could e.g. be used for giving a time bonus to a player or something similar.
  
The `time` parameter can either be milliseconds or a timecode.

*Examples*
- `myTimer.setClockTime('1:30');` will set the clock counter to 1 minute and 30 seconds.*
- `myTimer.setClockTime('1:23:45.6');` will set the clock counter to 1 hour, 23 minutes, 45 seconds and 6 tenth of seconds.
- `myTimer.setClockTime(123456);` will set the clock counter 123456 milliseconds which equal 2 minutes, 3 seconds and 5 tenth of seconds (the 456 milliseconds will be rounded).


#### Interactions
**`play():Void`**

Starts all counters or restarts clock counter and playing counter them after being paused. The event `play` will be dispatched.

*Example*
- `myTimer.play();` will start to play the timer.


**`pause():Void`**

Pauses clock counter and playing counter. The event `pause` will be dispatched.

*Example*
- `myTimer.pause();` will pause the clock counter and the playing counter. The timer or the running counter will still be active though.


**`stop():Void`**

Stops all counters including the running counter. The event `stop` will be dispatched.

*Example*
- `myTimer.stop();` will stop all counters.


**`reset():Void`**

Resets all counters to their default values and removes all notifications. The timer's mode/direction will not be changed though. The event `reset` will be dispatched.

*Example*
- `myTimer.reset();` will set all counters to 0 and remove all notifications.


#### Information
**`getStatus():Number`**

Gets the current status of the timer. The return value can be:

- 0 (`Timer.STOPPED`)
- 1 (`Timer.RUNNING`)
- 2 (`Timer.PAUSED`)

*Example*
- `console.log(myTimer.getStatus());` will get the status of the timer and show 0, 1 or 2 in the console.


**`getMode():Number`**

Get the current mode that the timer is set to. Return value can be:

- -1 (`Timer.BACKWARD`)
- 1 (`Timer.FORWARD`)

*Example*
- `console.log(myTimer.getMode());` will get the mode of the timer and show -1 or 1 in the console.


**`getTime():Number`**
Get the current time in milliseconds that is on a counter. By default, the time on the clock counter will be returned. An optional parameter `type` can be given to specify the counter. It accepts:

- 0 (`Timer.TYPE_CLOCK`)
- 1 (`Timer.TYPE_PLAYING`)
- 2 (`Timer.TYPE_RUNNING`)

If the parameter `type` is not an integer, `undefined` will be returned.

*Examples*
- `console.log(getTime());` will output the current time on the clock counter.
- `console.log(getTime(H5P.Timer.TYPE_RUNNING));` will output the current time on the running counter.
- `console.log(getTime(1));` will output the current time on the playing counter (although you'd better not use integers as parameters but the constants instead).


#### Notifications
**`notifyAt(type:Number, calltime:String|Number, callback:Function, params:Object):Number`**

Make the timer trigger a callback function at a certain point in time on a counter of your choice. It will return a unique id to identify the notification later if necessary.

The function expects:
- `type` of the counter to trigger the notification (`Timer.TYPE_CLOCK`, `Timer.TYPE_PLAYING` or `Timer.TYPE_RUNNING`)
- `calltime` the time when the notification shall be triggered in milliseconds or as a timecode
- `callback` the callback function to be notified
- `params` the parameters for the callback function which may be undefined

The notification will be triggered if the counter reaches the `calltime`. It will also trigger if the `calltime` lies in the past (if going forward) or in the future (if going backwards). This can be relevant when setting the clock counter manually.

The function will return `undefined` if `type` cannot be set correctly, `calltime` is neither a timecode nor time in milliseconds, or if `callback` is not a function.

*Examples*
- `id = timer.notifyAt(H5P.Timer.TYPE_CLOCK, '2:00', playTwoMinuteWarning);` will trigger the function `playTwoMinuteWarning()` at 2:00 on the clock counter.
- `id = timer.notifyAt(H5P.Timer.TYPE_PLAYING, 10000, runTenSeconds, ['foo', bar]);` will trigger the function `runTenSeconds('foo', bar)` at 10 seconds on the playing counter.


**`notifyIn(type:Number, time:String|Number, callback:Function, params:Object):Number`**

Make the timer trigger a callback function after a certain period of time has passed on the counter of your choice. It will return a unique id to identify the notification later if necessary.

The function expects:
- `type` of the counter to trigger the notification (`Timer.TYPE_CLOCK`, `Timer.TYPE_PLAYING` or `Timer.TYPE_RUNNING`)
- `time` the time period after the notification should trigger in milliseconds or as a timecode
- `callback` the callback function to be notified
- `params` the parameters for the callback function which may be undefined

The notification will calculate the absolute `calltime` immediately, so it might actually trigger before or after the time period has actually passed if the clock counter was changed meanwhile.

The function will return `undefined` if `type` cannot be set correctly, `time` is neither a timecode nor time in milliseconds, or if `callback` is not a function.

*Examples*
- `id = timer.notifyIn(H5P.Timer.TYPE_CLOCK, '2:00', beep);` will trigger the function `beep()` as soon as 2 minutes have passed on the clock counter.
- `id = timer.notifyIn(H5P.Timer.TYPE_RUNNING, 10000, inTenSeconds, ['foo']);` will trigger the function `inTenSeconds('foo')` after 10 seconds have elapsed on the running counter.


**`notifyEvery(type:Number, startTime:String|Number, repeat:String|Number, callback:Function, params:Object):Number`**

Make the timer trigger a callback function in regular intervals starting from a particular point in time. It will return a unique id to identify the notification later if necessary.

The function expects:
- `type` of the counter to trigger the notification (`Timer.TYPE_CLOCK`, `Timer.TYPE_PLAYING` or `Timer.TYPE_RUNNING`)
- `startTime` the time for first triggering in milliseconds or as a timecode
- `repeat` the time interval for repeated triggering in milliseconds or as a timecode
- `callback` the callback function to be notified
- `params` the parameters for the callback function which may be undefined

The `repeat` interval will never be smaller than the `interval` paramter set when creating the timer.

The function will return `undefined` if `type` cannot be set correctly, `time` is neither a timecode nor time in milliseconds, or if `callback` is not a function.

*Examples*
- `id = timer.notifyEvery(H5P.Timer.TYPE_CLOCK, 0, '00:01', tick);` will trigger the function `tick()` every second that passes on the clock counter right from the start.
- `id = timer.notifyIn(H5P.Timer.TYPE_CLOCK, '02:00', 5000, foo, ['bar']);` will trigger the function `foo('bar')` every 5 seconds that pass on the clock counter as of 2 minutes on the counter.


**`clearNotification(id:Number)`**

Deletes a notification. The notification is identified by the `id` that was obtained from one of the notification functions.

*Example*
- `clearNotification(5);`will remove the notification with ID 5.


#### Utility Functions
**`extractTimeElement(time:String|Number, element:String):Number`**

Retrieves an element from a timecode / time such as the floored total number of days or minutes. Mandatory arguments are `time` in milliseconds or as timecode and the `element` to be retrived (years, month, weeks, days, hours, minutes, seconds, or tenthSeconds).

You can also set an optional parameter `rounded` that is set to false by default. If set to true, you will not get the time element floored, but rounded.

If the function doesn't receive valid parameters, it will return `undefined`.

*Examples*
- `console.log(H5P.Timer.extractTimeElement('1:23:45.6', 'minutes'));`will output 83 (1 hour + 23 minutes).
- `console.log(H5P.Timer.extractTimeElement('1:23:45.6', 'minutes', true));`will output 84 (1 hour + 24 minutes rounded).
- `console.log(H5P.Timer.extractTimeElement('1:23:45.6', 'days'));` will output 0.
- `console.log(H5P.Timer.extractTimeElement(1234567890, 'weeks'));` will output 2.


**`toTimecode(milliSeconds:Number):String`**

Converts milliseconds to timecode. Will return `undefined` if `milliSeconds` is smaller than zero or not even an integer.

*Examples*
- `console.log(H5P.Timer.toTimecode(123456));` will output 02:03.5.
- `console.log(H5P.Timer.toTimecode(123456.1));` will output `undefined`.


**`toMilliseconds(timecode:String):Number`**

Converts a timecode to milliseconds. Will return `undefined` if no valid timecode is given.

*Examples*
- `console.log(H5P.Timer.toMilliseconds('02:03.5'));` will output 123500.
- `console.log(H5P.Timer.toMilliseconds('1:02'));` will output 62000.
- `console.log(H5P.Timer.toMilliseconds('1.9'));` will output 1900.
- `console.log(H5P.Timer.toMilliseconds('123456'));` will output `undefined`.


**`isTimecode(value:String):Boolean`**

Checks whether a given string is a timecode or not and will return `true` or `false`. Will return `undefined` if the given value is not a string.

*Examples*
- `console.log(H5P.Timer.isTimecode('02:03.5'));` will output `true`.
- `console.log(H5P.Timer.isTimecode('1.9'));` will output `true`.
- `console.log(H5P.Timer.isTimecode('87:59:43.9'));` will output `true`.
- `console.log(H5P.Timer.isTimecode('87:01.9'));` will output `false`.
- `console.log(H5P.Timer.isTimecode('123456'));` will output `false`.


### Events
**`play`**

Triggered when `play` is called.

**`pause`**

Triggered when `pause` is called.

**`stop`**

Triggered when `stop` is called. This means it is also triggered when the clock counter reaches 0 while counting down.

**`reset`**

Triggered when `reset` is called.


## License

(WTFPL)

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
                    Version 2, December 2004 

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 

 Everyone is permitted to copy and distribute verbatim or modified 
 copies of this license document, and changing it is allowed as long 
 as the name is changed. 

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

  0\. You just DO WHAT THE FUCK YOU WANT TO.
