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
      test.equal(thing.other.get("name"), "myotherThing")
      test.done()
    })
  })
}

tests['find embedded document'] = function(test) {
  var OtherThing = FreshDocuments("otherThings")
  var Thing = FreshDocuments("things"
                            , Embed({other: OtherThing}))
  var other = OtherThing.create({name: "myotherThing"}, function() {
    Thing.create({title:"thingything", other:other}, function() {
      Thing.findOne({title:"thingything"}, function(thing) {
        test.equal(thing.other.get("name"), "myotherThing")
        test.done()
      })
    })
  })
} 

tests['embed a collection'] = function(test) {
  var OtherThing = FreshDocuments("otherThings")
  var Thing = FreshDocuments("things"
                            , Embed({other: [OtherThing]}))
  var other = OtherThing.create({name: "myotherThing"}, function() {
    var other2 = OtherThing.create({name: "myotherThing2"}, function() {
      var thing = Thing.create({title:"thingything", other:[other, other2]}, function() {
        test.equal(thing.other[0].get("name"), "myotherThing")
        test.equal(thing.other[1].get("name"), "myotherThing2")
        test.done()
      })
    })
  })
}

tests['find an embedded collection'] = function(test) {
  var OtherThing = FreshDocuments("otherThings")
  var Thing = FreshDocuments("things"
                            , Embed({other: [OtherThing]}))
  var other = OtherThing.create({name: "myotherThing"}, function() {
    var other2 = OtherThing.create({name: "myotherThing2"}, function() {
      var thing = Thing.create({title:"thingything", other:[other, other2]}, function() {
        Thing.findOne({title: "thingything"}, function(thing) {
          test.equal(thing.other[0].get("name"), "myotherThing")
          test.equal(thing.other[1].get("name"), "myotherThing2")

          var things = Thing.find({title: "thingything"}, function() {
            test.equal(things[0].other[0].get("name"), "myotherThing")
            test.equal(things[0].other[1].get("name"), "myotherThing2")
            test.done()
          }) 
        })
      })
    })
  })
}
 

module.exports = testCase(tests)
