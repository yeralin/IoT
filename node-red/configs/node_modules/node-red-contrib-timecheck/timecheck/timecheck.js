/**
* timecheck node
*
* Copyright 2015, Jorne Roefs.
* All rights reserved.
*
*/

module.exports = function(RED) {
  'use strict';
  function TimecheckNode(n) {
    RED.nodes.createNode(this, n);

    var _this = this;
    var time = n.time || '12:00';
    var timeParts;
    var hours = 0;
    var minutes = 0;

    try {
      timeParts = n.time.split(':');
      hours = parseInt(timeParts[0]);
      minutes = parseInt(timeParts[1]);

      if (hours > 23 || minutes > 59) {
        throw new Error();
      }
    } catch (e) {
      this.error('Invalid time given.');
    }

    this.on('input', function(msg) {
      var now = new Date();
      var checktime = new Date();

      checktime.setHours(hours);
      checktime.setMinutes(minutes);

      if (now < checktime) {
        _this.send([null, msg]);
      } else {
        _this.send([msg, null]);
      }
    });
  }

  RED.nodes.registerType('timecheck', TimecheckNode);
};
