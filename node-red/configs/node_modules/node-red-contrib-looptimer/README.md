Loop Timer for node-red
----------------------------

Sends the `msg` through the first output, then continues to do so in a loop, once per the timer duration specified, until a payload of `stop` or `STOP` is received, at which time the second output will automatically send a payload of `stopped`.

You can also stop the loop by specifying a maximum number of loops, which when reached, will stop the loop and timer, as well as sending a payload of `max loops reached` through the second output. Keep in mind, the first `msg` simply passes through, and is therefore not part of the loop. So if you set the max loops to `5`, you will get `6 messages`, which is 1 original message, and 5 messages from the loop.

Finally, to ensure you do not end up with an infinite loop, you can set a maximum timeout in seconds, minutes or hours, and when that time is reached, the loop and timer will also be stopped.

Setting the Max Loops and Max Timeout settings to high values can, for all intents, ensure that the loop can only be stopped by an incoming `stop` payload, however, the stability of the loop has not been tested over an extended number of hours.

0.0.1 - Initial Release

0.0.2 - Updated the info panel instructions inside of node-red

0.0.3 - Fixed a glaring bug that could allow the loop to continue even after being stopped, and in some cases, even after removing the node and re-deploying.

0.0.4 - Fixed the status only showing `running` on the first loop. Also, clarified the instructions in reference to the first `msg` not being part of the actual loop.

0.0.5 - Changed dependencies to only require the `loop` package rather than the entire `future` package.

0.0.6 - Minor bug fix.

0.0.7 - Changed the wording in the Edit Panel to clear up confusion.

0.0.8 - Fixed a bug that could allow an additional msg to pass through after the Max Timeout. The fix for this will also stop the loop before the Max Timeout is reached if an additional loop duration would have exceeded the Max Timeout anyway. This should save resources by not having the loop timer continue counting down for an additional loop that wouldn't result in a msg being sent through in the first place.
