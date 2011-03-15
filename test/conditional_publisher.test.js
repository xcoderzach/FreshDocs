require.paths.unshift('/usr/local/lib/node')

var testCase = require('nodeunit').testCase
  , tests = {} 
  , PubHub = require('../lib/ConditionalPublisher').PubHub
 
 
tests.setUp = function(startTest) {
  startTest()
}
 
tests.tearDown = function(done) {
  done()
}

tests['test equals calls publish method'] = function(test) {
  test.expect(1)

  PubHub.sub({x: 20}, function(obj) {
    test.equal("w00t", obj.document.name)
    test.done()
  })
  PubHub.pub({document: {x: 20, name: "w00t"}})
}
 
tests['test passing extra args when publishing'] = function(test) {
  test.expect(1)

  PubHub.sub({x: 91}, function(obj, type) {
    test.equal("update", type)
    test.done()
  })
  PubHub.pub({document: {x: 91, name: "w00t"}}, "update")
}
 
tests['test inequalities calls publish method'] = function(test) {
  test.expect(3)

  PubHub.sub({powerLevel: {"$gt": 9000}}, function(obj) {
    test.equal("Goku", obj.document.name)
    test.done()
  })
  PubHub.sub({powerLevel: 9000}, function(obj) {
    test.equal("Vegeta", obj.document.name)
  })
  PubHub.sub({powerLevel: {"$lt": 9000}}, function(obj) {
    test.equal("Raditz", obj.document.name)
  })
  PubHub.pub({document: {powerLevel: 2000, name: "Raditz"}})
  PubHub.pub({document: {powerLevel: 9000, name: "Vegeta"}})
  PubHub.pub({document: {powerLevel: 10000, name: "Goku"}})
} 

module.exports = testCase(tests)
