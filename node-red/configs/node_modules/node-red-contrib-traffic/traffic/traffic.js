/*
  Copyright (c) 2016 Jacques W.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

module.exports = function(RED) {

  function TrafficNode(config) {

    RED.nodes.createNode(this, config);
    var node = this;

    // context is necessary to store the node state
    var context = this.context();

    // changing state function
    this.state = function(passing) {

      // store the new state
			context.set('pass', passing);

      // change the circle below to reflect the new state
			if (passing) {
				this.status({fill: "green", shape: "dot", text: "allow"});
			} else {
				this.status({fill: "red", shape: "dot", text: "stop"});
			}
		}

    // Default state according to the configuration
    this.state(config.default_start);

    // Build "allow" regex
    var options = (config.ignore_case_allow)?"i":"";
    var rx_allow = null;
    try {
      rx_allow  = new RegExp(config.filter_allow, options);
    }
    catch (exception) {
      node.error(exception);
    }

    // Build "stop" regex
    var options = (config.ignore_case_stop)?"i":"";
    var rx_stop = null;
    try {
      rx_stop  = new RegExp(config.filter_stop, options);
    }
    catch (exception) {
      node.error(exception);
    }    

    // Source: http://stackoverflow.com/questions/6906108/in-javascript-how-can-i-dynamically-get-a-nested-property-of-an-object
    function getPropByString(obj, propString) {
        if (!propString)
            return obj;

        var prop, props = propString.split('.');

        for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
            prop = props[i];

            var candidate = obj[prop];
            if (candidate !== undefined) {
                obj = candidate;
            } else {
                break;
            }
        }
        return obj[props[i]];
    }

    // If new message...
    this.on('input', function(msg) {

      var other = true;

      var value = getPropByString(msg, config.property_allow);

      // If value for the "allow" property for the incoming message has the right "allow" value ... 
      if (rx_allow != null && value !== undefined && !!(rx_allow.test(value) ^ config.negate_allow)) {
        // State is changed to "allow"
    		this.state(true);
        // If needed, also send the input message
    		if (config.send_allow) node.send(msg);

        other = false;
    	}

      value = getPropByString(msg, config.property_stop);

      // If value for the "stop" property for the incoming message has the right "stop" value ...
    	if (other && rx_stop != null && value !== undefined && !!(rx_stop.test(value) ^ config.negate_stop)) {
        // State is changed to "stop"
		    this.state(false);
        // If needed, also send the input message
    		if (config.send_stop) node.send(msg);

        other = false;
    	}

      // Other cases, the message is sent only if in "allow" state
    	if (context.get('pass')) {
        // any stack?
        (context.get('stack')||[]).forEach(function(msg) {
          node.send(msg);
        });
        context.set('stack', []);
    		if (other) node.send(msg);	
    	} else {
        if (other && config.differ) {
          var store; (store = context.get('stack') || []).push(msg);
          context.set('stack', store);
        }
      }
        
    });

  }

  RED.nodes.registerType("traffic", TrafficNode);
}
