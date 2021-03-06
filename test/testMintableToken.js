TestHarness2 = require('../js/testHarness')
testHarness2 = new TestHarness2('MintableToken')

const assert = require('assert')

promise1 = null;
describe('Suite MintableToken', () => {
  it('should deploy a token and with zero initial supply', function(done) {
    promise1 =
      testHarness2.deployPromise().then((harness) => {
        assert.equal(harness.instance.totalSupply(), 0)
        assert.equal(harness.instance.owner(), harness.accounts[0])
        return harness // return harness so we can keep chaining
      })
    promise1.then(() => { done(); })
  })

  promise2 = null;

  it('should mint an initial amount', function(done) {
    promise2 = promise1.then((harness) => {
      assert.equal(harness.instance.totalSupply(), 0)
      assert.equal(harness.instance.balanceOf(harness.accounts[1]), 0)
      return harness.runFunc((options, callback) => {
          console.log(`TokenAddr ${harness.address}`)
          harness.instance.mint(harness.accounts[1], 1e18, options, callback)
      })
    })
    .then((harness) => {
      assert.equal(harness.instance.balanceOf(harness.accounts[1]), 1e18)
      assert.equal(harness.instance.totalSupply(), 1e18)
      return harness // return harness so we can keep chaining
    })

    promise2.then(() => { done(); })
  })

  promise3 = null;

  it('should transfer tokens from one account to another', function(done) {
    promise3 = promise2.then((harness) => {
      return harness.runFunc((options, callback) => {
          options["from"] = harness.accounts[1]
          harness.instance.transfer(harness.accounts[2], 5e17, options, callback)
      })
    })
    .then((harness) => {
      assert.equal(harness.instance.balanceOf(harness.accounts[1]), 5e17)
      assert.equal(harness.instance.balanceOf(harness.accounts[2]), 5e17)
      assert.equal(harness.instance.allowance(harness.accounts[1], harness.accounts[0]), 0)
      return harness // return harness so we can keep chaining
    })

    promise3.then(() => { done(); })
  })

  it('should approve a certain amount', (done) => {
    promise3.then((harness) => {
      return harness.runFunc((options, callback) => {
        options['from'] = harness.accounts[2]
        harness.instance.approve(harness.accounts[0], 1e18, options, callback)
      })
    })
    .then((harness) => {
      assert.equal(harness.instance.allowance(harness.accounts[2], harness.accounts[0]),
        1e18, "Approval for account 2 should have been increased.")
      assert.equal(harness.instance.allowance(harness.accounts[1], harness.accounts[0]),
        0, "Approval for account 1 should not have changed.")
    })
    .then(() => {done()})
  })

})
