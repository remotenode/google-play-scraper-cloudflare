import request from '../lib/utils/request.js';
import sinon from 'sinon';
import { assert } from 'chai';

describe('Throttle tests', function () {
  this.timeout(6000);
  let server;

  // Create a fake http server to emulate http call and responses.
  before(function () {
    server = sinon.fakeServer.create();
  });

  // Remove any server responses added in current test suite.
  after(function () {
    server.restore();
  });

  const url = 'https://yesno.wtf/api'; // Fake url used in this test, it could be anything.

  it('Should make three requests with throttling. (Throttle function)', function () {
    const startTime = Date.now();
    const throttleDelay = 50; // 50ms throttle for faster testing
    
    // Test that requests are throttled when throttle parameter is provided
    // Make requests sequentially to test throttling
    return request({ url }, throttleDelay)
      .then(() => request({ url }, throttleDelay))
      .then(() => request({ url }, throttleDelay))
      .then(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        // Should take at least 100ms (2 throttles of 50ms each)
        assert.isAtLeast(totalTime, 100);
        assert.isAtMost(totalTime, 1000); // Allow more tolerance for network latency
      });
  });
});
