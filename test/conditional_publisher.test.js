require.paths.unshift('/usr/local/lib/node')

var testCase = require('nodeunit').testCase
  , DatabaseCleaner = require('/usr/local/lib/node/database-cleaner/lib/database-cleaner') 
  , databaseCleaner = new DatabaseCleaner("mongodb")
  , tests = {} 
  , mongodb = require("mongodb")
  , Db = mongodb.Db
  , Server = mongodb.Server
  , client = new Db('publisherTest', new Server("127.0.0.1", 27017, {}))
  , ConditionalPublisher = require('../src/ConditionalPublisher').ConditionalPublisher
 
 
tests.setUp = function(startTest) {
  client.open(function(err) {
    startTest()
  })
}
 
tests.tearDown = function(done) {
  done()
}
 
tests['test equals calls publish method'] = function(test) {
  ConditionalPublisher(function(hub) {
    hub.sub("docs", {x: 20}, function(obj) {
      test.equal("w00t", obj.name)
      test.done()
    })
    hub.pub("docs", {x: 20, name: "w00t"})
  })
}

module.exports = testCase(tests)
