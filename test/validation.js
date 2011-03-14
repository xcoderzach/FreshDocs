require.paths.unshift('/usr/local/lib/node')
var FreshDocuments = require("../index").FreshDocuments
  , Validations = require("../src/middleware/validation")
  , testCase = require('nodeunit').testCase
  , DatabaseCleaner = require('/usr/local/lib/node/database-cleaner/lib/database-cleaner') 
  , databaseCleaner = new DatabaseCleaner("mongodb")
  , tests = {} 
  , mongodb = require("mongodb")
  , Db = mongodb.Db
  , Server = mongodb.Server
  , client = new Db('awesome', new Server("127.0.0.1", 27017, {}))

tests.setUp = function(startTest) {
  client.open(function(err) {
    databaseCleaner.clean(client, function() {
        startTest()
    })
  })
}

tests.tearDown = function(done) {
  done()
}
tests["validate incorrect length gives error"] = function(test) {
  var Things = FreshDocuments("things", 
                 Validations({ title: {length: [4, 100], message: "Invalid length"} }))
  Things.create({title: "asd"}, function(err) {
    console.log("w00t")
    test.equal(err.message, "Invalid length")
    var things = Things.find({}, function() {
      test.equal(things.length, 0)
      test.done()
    })
  })
}

module.exports = testCase(tests)
