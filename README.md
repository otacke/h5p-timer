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

**`setMode(direction:Number):Void`**

Sets the mode or direction for the clock counter. Possible values for the `direction` parameter are:

- -1 (`Timer.BACKWARD`)
- 1 (`Timer.FORWARD`)

**`setClockTime(time:String|Number):Void`**
    
Sets the clock counter to a particular position. For example, this can be used to setup a countdown. Setting the clock is also possible while the timer is playing. This could e.g. be used for giving a time bonus to a player or something similar.
  
The `time` parameter can either be milliseconds or a timecode.

#### Interactions
**`play():Void`**

Starts all counters or restarts clock counter and playing counter them after being paused. The event `play` will be dispatched.

**`pause():Void`**

Pauses clock counter and playing counter. The event `pause` will be dispatched.

**`stop():Void`**

Stops all counters including the running counter. The event `stop` will be dispatched.

**`reset():Void`**

Resets all counters to their default values and removes all notifications. The timer's mode/direction will not be changed though. The event `reset` will be dispatched.

#### Information
**`getStatus():Number`**

Gets the current status of the timer. The return value can be:

- 0 (`Timer.STOPPED`)
- 1 (`Timer.RUNNING`)
- 2 (`Timer.PAUSED`)

**`getMode():Number`**

Get the current mode that the timer is set to. Return value can be:

- -1 (`Timer.BACKWARD`)
- 1 (`Timer.FORWARD`)

**`getTime():Number`**
Get the current time in milliseconds that is on a counter. By default, the time on the clock counter will be returned. An optional parameter `type` can be given to specify the counter. It accepts:

- 0 (`Timer.TYPE_CLOCK`)
- 1 (`Timer.TYPE_PLAYING`)
- 2 (`Timer.TYPE_RUNNING`)

If the parameter `type` is not an integer, `undefined` will be returned.

#### Notifications
**`notifyAt(type:Number, calltime:String|Number, callback:Function, params:Object):Number`**

**`notifyIn(type:Number, time:String:Number, callback:Function, params:Object):Number`**

**`notifyEvery(type:Number, startTime:String|Number, repeat:String|Number, callback:Function, params:Object):Number`**

**`clearNotification(id:Number)`**

#### Utility Functions
**`extractTimeElement(time:Number, element:String):Number`**

Retrieves an element from a timecode / time such as days or minutes. This could be useful when you are in need of a diffent format than a timecode for displaying elapsed or remaining time. Mandatory arguments are `time` in milliseconds or as timecode and the `element` to be retrived (years, month, weeks, days, hours, minutes, seconds, or tenthSeconds).

You can also set an optional parameter `rounded` that is set to false by default. If set to true, you will not get the time element floored, but rounded. This could be useful if you want to use just one element to show the time that has passed.

If the function doesn't receive valid parameters, it will return `undefined`.

**`toTimecode(milliSeconds:Number):String`**

Converts milliseconds to timecode. Will return `undefined` if `milliSeconds` is smaller than zero or not even an integer.

**`toMilliseconds(timecode:String):Number`**

Converts a timecode to milliseconds. Will return `undefined` if no valid timecode is given.

**`isTimecode(value:String):Boolean`**

Checks whether a given string is a timecode or not and will return `true` or `false`. Will return `undefined` if the given value is not a string.

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