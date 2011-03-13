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

tests['adding things'] = function(test) {
  test.expect(2)
  var Thing = FreshDocuments("things")
    , thing = new Thing({title:"My title", published: true})
    , run = false

  thing.save(function(docs) {
    Thing.find({published: true}, function(things) {
      test.equal("My title", things[0].get("title"))
      test.equal(1, things.length)
      test.done()
    })
  })
}

tests['test adding thing updates collection'] = function(test) {
  test.expect(3)
  var Thing = FreshDocuments("things")
    , thing = new Thing({title:"Myitle", published: true})
    , newThing = new Thing({title:"Another title", published: true})
    , unpubd = new Thing({title:"Not ready", published: false})

  Thing.find({published: true}, function(things) {
    thing.save(function() {
      test.equal("Myitle", things[0].get("title"))
      newThing.save(function() {
        test.equal("Another title", things[1].get("title"))
        unpubd.save(function() {
          test.equal(2, things.length)
          test.done()
        })
      })
    })
  }) 
}

tests['test removing thing updates collection'] = function(test) {
  test.expect(2)
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"Myitle", published: true})
  thing.save(function() {
    Thing.find({published: true}, function(things) {
      test.equal(1, things.length)
      thing.remove(function() {
        test.equal(0, things.length)
        test.done()
      })
    })  
  })
}

tests['test changing a thing updates all instances of the thing'] = function(test) {
  test.expect(2)
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"Myitle", published: true})

  thing.save(function() {
    Thing.find({title: "Myitle"}, function(things) {
      things[0].set({title: "different title"})
      things[0].save(function() {
        test.deepEqual("different title", thing.get("title")) 
        test.deepEqual("different title", things[0].get("title")) 
        test.done()
      })
    }) 
  })
}

tests['create events are called'] = function(test) {
  test.expect(1)
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"Myitle", published: true})
  //add a thing
  Thing.find({published: true}, function(things) {
    things.once("add", function(evtThing) {
      test.deepEqual(thing.get("_id"), evtThing.get("_id")) 
      test.done()
    })
    thing.save()
  })
}

tests['remove events are called'] = function(test) {
  test.expect(1)
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"Myitle", published: true})
  Thing.find({published: true}, function(things) {
    things.once("remove", function(removed) {
      try {
        test.deepEqual(thing.document._id.id, removed.document._id.id) 
        test.done()
      } catch(e) {
        console.log(e.stack)
      }
    })
    thing.save()
    thing.remove()
  })
}

tests['Document should fire event when it gets removed'] = function(test) {
  test.expect(1)
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"Myitle", published: true})
  thing.on("remove", function() {
    test.equal("w00t", "w00t")
    test.done()
  })
  thing.save(function() {
    thing.remove()
  })
}
 
tests['Document should fire event when it gets updated'] = function(test) {
  test.expect(1)
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"Myitle", published: true})
  thing.on("update", function() {
    test.equal("w00t", "w00t")
    test.done()
  })
  thing.save(function() {
    thing.set({"w00t": "boot"})
    thing.save()
  })
} 

module.exports = testCase(tests)
