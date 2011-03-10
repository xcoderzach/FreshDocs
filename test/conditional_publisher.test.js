require.paths.unshift('/usr/local/lib/node')

var testCase = require('nodeunit').testCase
  , tests = {} 
  , PubHub = require('../src/ConditionalPublisher').PubHub
 
 
tests.setUp = function(startTest) {
  startTest()
}
 
tests.tearDown = function(done) {
  done()
}

tests['test equals calls publish method'] = function(test) {
  var hub = new PubHub()
  test.expect(1)

  hub.sub({x: 20}, function(obj) {
    test.equal("w00t", obj.name)
    test.done()
  })
  hub.pub({x: 20, name: "w00t"})
}
tests['test inequalities calls publish method'] = function(test) {
  var hub = new PubHub()
  test.expect(3)

  hub.sub({powerLevel: {"$gt": 9000}}, function(obj) {
    test.equal("Goku", obj.name)
    test.done()
  })
  hub.sub({powerLevel: 9000}, function(obj) {
    test.equal("Vegeta", obj.name)
  })
  hub.sub({powerLevel: {"$lt": 9000}}, function(obj) {
    test.equal("Raditz", obj.name)
  })
  hub.pub({powerLevel: 2000, name: "Raditz"})
  hub.pub({powerLevel: 9000, name: "Vegeta"})
  hub.pub({powerLevel: 10000, name: "Goku"})
} 

module.exports = testCase(tests)
