var should = require('should');
var timecheckNode = require('../timecheck/timecheck.js');
var helper = require('../node_modules/node-red/test/nodes/helper.js');

describe('Timecheck Node', function() {

  before(function(done) {
    helper.startServer(done);
  });

  afterEach(function() {
    helper.unload();
    helper.stopServer();
  });

  it('should be loaded', function(done) {
    var flow = [{id:'n1', type:'timecheck', name:'timecheckNode' }];
    helper.load(timecheckNode, flow, function() {
      var timecheckNode1 = helper.getNode('n1');
      timecheckNode1.should.have.property('name', 'timecheckNode');
      done();
    });
  });

  it('should send a message to output 1 if the time has passed', function(done) {
    var flow = [{id:'n1', type:'timecheck', name:'timecheckNode', wires:[['h1'], []], time:'00:00'}, {id:'h1', type:'helper', wires:[]}];
    helper.load(timecheckNode, flow, function() {
      var timecheckNode1 = helper.getNode('n1');
      var helperNode1 = helper.getNode('h1');

      helperNode1.on('input', function(msg) {
        done();
      });

      timecheckNode1.receive();
    });

  });

  it('should not send a message to output 2 if the time has passed', function(done) {
    var flow = [{id:'n1', type:'timecheck', name:'timecheckNode', wires:[[], ['h1']], time:'00:00'}, {id:'h1', type:'helper', wires:[]}];
    helper.load(timecheckNode, flow, function() {
      var timecheckNode1 = helper.getNode('n1');
      var helperNode1 = helper.getNode('h1');

      helperNode1.on('input', function(msg) {
        done(Error('Should not get an input'));
      });

      timecheckNode1.receive();

      setTimeout(function() {
        done();
      }, 200);
    });

  });

  it('should send a message to output 2 if the time has not yet passed', function(done) {
    var flow = [{id:'n1', type:'timecheck', name:'timecheckNode', wires:[[], ['h1']], time:'23:59'}, {id:'h1', type:'helper', wires:[]}];
    helper.load(timecheckNode, flow, function() {
      var timecheckNode1 = helper.getNode('n1');
      var helperNode1 = helper.getNode('h1');

      helperNode1.on('input', function(msg) {
        done();
      });

      timecheckNode1.receive();
    });

  });

  it('should not send a message to output 1 if the time has not yet passed', function(done) {
    var flow = [{id:'n1', type:'timecheck', name:'timecheckNode', wires:[['h1'], []], time:'23:59'}, {id:'h1', type:'helper', wires:[]}];
    helper.load(timecheckNode, flow, function() {
      var timecheckNode1 = helper.getNode('n1');
      var helperNode1 = helper.getNode('h1');

      helperNode1.on('input', function(msg) {
        done(Error('We should never get an input!'));
      });

      timecheckNode1.receive();

      setTimeout(function() {
        done();
      }, 200);
    });

  });
});
