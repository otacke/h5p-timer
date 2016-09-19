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
