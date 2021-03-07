/**
 * Copyright jbardi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var Looper = require('loop');

    function LoopTimer(n) {
        RED.nodes.createNode(this, n);

        this.units = n.units || "Second";
        this.duration = n.duration || 5;
        this.maxloops = n.maxloops || 100;
        this.maxtimeoutunits = n.maxtimeoutunits || "Hour";
        this.maxtimeout = n.maxtimeout || 1;

        if (this.duration <= 0) {
            this.duration = 0;
        } else {
            if (this.units == "Second") {
                this.duration = this.duration * 1000;
            }
            if (this.units == "Minute") {
                this.duration = this.duration * 1000 * 60;
            }
            if (this.units == "Hour") {
                this.duration = this.duration * 1000 * 60 * 60;
            }
        }

        if (this.maxtimeout <= 0) {
            this.maxtimeout = 0;
        } else {
            if (this.maxtimeoutunits == "Second") {
                this.maxtimeout = this.maxtimeout * 1000;
            }
            if (this.maxtimeoutunits == "Minute") {
                this.maxtimeout = this.maxtimeout * 1000 * 60;
            }
            if (this.maxtimeoutunits == "Hour") {
                this.maxtimeout = this.maxtimeout * 1000 * 60 * 60;
            }
        }

        var node = this;
        var loop = null;
        var timeout = null;
        var stopped = false;
        var cpmsg = null;
        var stopmsg = null;
        var mlmsg = null;
        this.on("input", function(msg) {
            loop = Looper();
            loop.setTimeout(node.maxtimeout);
            loop.setMaxLoop(node.maxloops);
            node.status({});
            if (stopped === false || msg._timerpass !== true) {
                stopped = false;
                clearTimeout(timeout);
                timeout = null;
                if (msg.payload == "stop" || msg.payload == "STOP") {
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: "stopped"
                    });
                    stopped = true;
                    stopmsg = RED.util.cloneMessage(msg);
                    stopmsg.payload = "stopped";
                    node.send([null, stopmsg]);
                } else {
                    cpmsg = RED.util.cloneMessage(msg);
                    node.send([cpmsg, null]);
                    msg._timerpass = true;
                    loop.run(function(next, err, data) {
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: "running"
                        });
                        data++;
                        timeout = setTimeout(function() {
                            if (stopped === false) {
                                cpmsg = RED.util.cloneMessage(msg);
                                if (data == node.maxloops) {
                                    mlmsg = RED.util.cloneMessage(msg);
                                    mlmsg.payload = "max loops reached";
                                    node.send([cpmsg, mlmsg]);
                                    node.status({
                                        fill: "red",
                                        shape: "ring",
                                        text: "max loops reached"
                                    });
                                    timeout = null;
                                    next("break");
                                } else {
                                    node.status({});
                                    if ((data * node.duration) <= node.maxtimeout) {
                                        node.send([cpmsg, null]);
                                        timeout = null;
                                        if (((data + 1) * node.duration) > node.maxtimeout) {
                                            next("break");
                                        } else {
                                            next(undefined, data);
                                        }
                                    } else {
                                        timeout = null;
                                        next("break");
                                    }
                                }
                            } else {
                                timeout = null;
                                next("break");
                            }
                        }, node.duration);
                    }, 0);
                }
            }
        });
        this.on("close", function() {
            if (timeout) {
                clearTimeout(timeout);
            }
            node.status({});
        });
    }
    RED.nodes.registerType("looptimer", LoopTimer);
}
