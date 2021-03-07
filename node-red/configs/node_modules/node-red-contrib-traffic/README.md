# node-red-contrib-traffic
"Traffic light" like node for node-red. It sends or it drops messages according to its state, controlled by messages.

![alt tag](https://cloud.githubusercontent.com/assets/18165555/14190982/a7a5bd26-f795-11e5-8e27-740d8b1aa1d7.png)

## Installation
```bash
npm install node-red-contrib-traffic
```

## Usage

  This nodes accepts a `msg` and sends it according to its internal state. Its state may be `passing` or `blocking`

  If in passing mode, a green circle is shown under the node and any incoming message is allowed and be ``sent``
  If in blocking mode, a red circle is shown under the node and any incoming message is ``dropped``.

  The `passing mode` is set by sending a message which fit the configuration based on a property name and a regex.
  The `blocking mode` is also set by configuration

  It's possible to let the control messages pass by checking the right checkbox

  I's also possible to configure the node in passing mode or blocking at startup

## Example flow files

  Try pasting in the flow file below that shows the node behaviour 

```json
[{"id":"a724df44.58db2","type":"comment","z":"8d67b3ee.72985","name":"STOP configuration","info":"STOP message is configured to be also sent to the COP","x":226,"y":259,"wires":[]},{"id":"67d26698.982d98","type":"traffic","z":"8d67b3ee.72985","name":"Traffic sample","property_allow":"payload","filter_allow":"GO","ignore_case_allow":false,"send_allow":false,"property_stop":"payload","filter_stop":"stop","ignore_case_stop":true,"send_stop":true,"default_start":false,"x":362.5,"y":145,"wires":[["9513a40c.6aec58"]]},{"id":"16fff6d4.e90009","type":"inject","z":"8d67b3ee.72985","name":"","topic":"I'm a car","payload":"Cheers !","payloadType":"str","repeat":"2","crontab":"","once":true,"x":147.5,"y":141,"wires":[["67d26698.982d98"]]},{"id":"b822b6d3.47dd48","type":"inject","z":"8d67b3ee.72985","name":"GO","topic":"","payload":"GO","payloadType":"str","repeat":"","crontab":"","once":false,"x":117.5,"y":197,"wires":[["67d26698.982d98"]]},{"id":"70ef37c7.8f10c8","type":"inject","z":"8d67b3ee.72985","name":"","topic":"","payload":"STOP","payloadType":"str","repeat":"","crontab":"","once":false,"x":117.5,"y":238,"wires":[["67d26698.982d98"]]},{"id":"9513a40c.6aec58","type":"debug","z":"8d67b3ee.72985","name":"COP","active":true,"console":"false","complete":"payload","x":530.5,"y":186,"wires":[]},{"id":"1f216cdb.e0de93","type":"comment","z":"8d67b3ee.72985","name":"Traffic Light sample","info":"","x":187.5,"y":68,"wires":[]}]
```
![alt tag](https://cloud.githubusercontent.com/assets/18165555/14190981/a7a24420-f795-11e5-8fcf-ea4e19efe2d1.png)

## Author

  - Jacques W

## License

This code is Open Source under an Apache 2 License.

You may not use this code except in compliance with the License. You may obtain an original copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Please see the
License for the specific language governing permissions and limitations under the License.

## Feedback and Support

Please report any issues or suggestions via the [Github Issues list for this repository](https://github.com/Jacques44/node-red-contrib-traffic/issues).

For more information, feedback, or community support see the Node-Red Google groups forum at https://groups.google.com/forum/#!forum/node-red


