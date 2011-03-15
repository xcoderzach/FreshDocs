require.paths.unshift('/usr/local/lib/node')
var FreshDocuments = require("../index").FreshDocuments
  , testCase = require('nodeunit').testCase
  , DatabaseCleaner = require('/usr/local/lib/node/database-cleaner/lib/database-cleaner') 
  , databaseCleaner = new DatabaseCleaner("mongodb")
  , tests = {} 
  , mongodb = require("mongodb")
  , Db = mongodb.Db
  , Server = mongodb.Server
  , client = new Db('awesome', new Server("127.0.0.1", 27017, {}))
  , Embed = require("../lib/middleware/embeddedDocuments")
 
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

tests['embed a document'] = function(test) {
  var OtherThing = FreshDocuments("otherThings")
  var Thing = FreshDocuments("things"
                            , Embed({other: OtherThing}))
  var other = OtherThing.create({name: "myotherThing"}, function() {
    var thing = Thing.create({title:"thingything", other:other}, function() {
      test.equal(thing.get("other").get("name"), "myotherThing")
      test.done()
    })
  })
}

module.exports = testCase(tests)
