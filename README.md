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

* 1 (`Timer.FORWARD`)
* -1 (`Timer.BACKWARD`)

**`setClockTime(time:String|Number):Void`**
    
Sets the clock counter to a particular position. For example, this can be used to setup a countdown. Setting the clock is also possible while the timer is playing. This could e.g. be used for giving a time bonus to a player or something similar.
  
The `time` parameter can either be milliseconds or a timecode.

#### Interactions
**`play():Void`**

**`pause():Void`**

**`stop():Void`**

**`reset():Void`**

#### Information
**`getStatus():Number`**

**`getMode():Number`**

**`getTime():Number`**

#### Notifications
**`notifyAt(type:Number, calltime:String|Number, callback:Function, params:Object):Number`**

**`notifyIn(type:Number, time:String:Number, callback:Function, params:Object):Number`**

**`notifyEvery(type:Number, startTime:String|Number, repeat:String|Number, callback:Function, params:Object):Number`**

**`clearNotification(id:Number)`**

#### Utility Functions
**`extractTimeElement(time:Number, element:String):Number`**

**`toTimecode(milliSeconds:Number):String`**

**`toMilliseconds(timecode:String):Number`**

**`isTimecode(value:String):Boolean`**

### Events
**`play`**

**`pause`**

**`stop`**

**`reset`**

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
