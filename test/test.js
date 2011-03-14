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
/*
tests['adding things'] = function(test) {
  test.expect(2)
  var Thing = FreshDocuments("things")
    , thing = new Thing({title:"My title", published: true})
    , run = false

  thing.save(function() {
    var things = Thing.find({published: true}, function() {
      test.equal("My title", things[0].get("title"))
      test.equal(1, things.length)
      test.done()
    })
  })
}

tests['creating things'] = function(test) {
  test.expect(2)
  var Thing = FreshDocuments("things")
  Thing.create({title:"My title", published: true}, function() {
    var things = Thing.find({published: true}, function() {
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

  var things = Thing.find({published: true}, function() {
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
    var things = Thing.find({published: true}, function() {
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
    var things = Thing.find({title: "Myitle"}, function() {
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
  var things = Thing.find({published: true}, function() {
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
      test.deepEqual(thing.document._id.id, removed.document._id.id) 
      test.done()
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

tests['Collection should fire event when a member gets updated'] = function(test) {
  test.expect(1)
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"Myitle", published: true})
  thing.save(function() {
    var things = Thing.find({published: true}, function() {
      thing.set({"w00t": "boot"})
      thing.save()
      things.on("update", function(newThing) {
        test.deepEqual(thing.document, newThing.document)
        test.done()
      })
    })
  })
}  

tests['test inserting with a self generated _id'] = function(test) {
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"w00t", published: true, _id: {id: "4d7d244deb6eb0505800000a"} })
  thing.save(function() {
    var things = Thing.find({title:"w00t"}, function() {
      test.equal(things[0].document._id.id, "4d7d244deb6eb0505800000a") 
      test.done()
    })
  })
}

tests['test findOne'] = function(test) {
  var Thing = FreshDocuments("things")
  var thing = new Thing({title:"w00t", author: "dudeguy"})
  thing.save(function() {
    Thing.findOne({title:"w00t"}, function(found) {
      test.deepEqual(found.document, thing.document)
      test.done()
    })
  })
} 

tests['test find with limit'] = function(test) {
  var Thing = FreshDocuments("things")
    , i = 0
    , saveThing = function(done) {
    if(i < 10) {
      var thing = new Thing({title:"w00t" + i, awesome:true})
      thing.save(function() {
        saveThing(done) 
      })
      i++
    } else {
      done()
    }
  }
  saveThing(function() {
    var things = Thing.find({awesome:true}, function() {
      test.equal(5, things.length)
      test.done()
    }).limit(5)
  })
} 

tests['test inserting maintains limits'] = function(test) {
  var Thing = FreshDocuments("things")
    , i
    , j = 0

  var things = Thing.find({awesome:true}, function() {
    for(i = 0 ; i < 10 ; i++) {
      new Thing({title:"w00t" + i, awesome:true}).save(function() {
        test.equals(things.length <= 5, true)
        if(++j == 10) {
          test.done()
        }
      })
    }
  }).limit(5)
}  
 
tests['test removing maintains limit'] = function(test) {
  var Thing = FreshDocuments("things")
    , i = 0
    , saveThing = function(done) {
    if(i < 10) {
      var thing = new Thing({title:"w00t" + i, awesome:true})
      thing.save(function() { saveThing(done) })
      i++
    } else {
      done()
    }
  }
  saveThing(function() {
    var things = Thing.find({awesome:true}, function() {
      test.equal(5, things.length)
      things[0].remove(function() {
        test.equal(5, things.length)
        test.done()
      })
    }).limit(5)
  })
} 
*/
tests['test sorting'] = function(test) {
  var Thing = FreshDocuments("things")
    , i = 0

  Thing.create({order:2}, function() {
    Thing.create({order:5}, function() {
      Thing.create({order:3}, function() {
        Thing.create({order:1}, function() {
          Thing.create({order:4}, function() {
            var things = Thing.find({}, function() {
              test.equal(things[0].get("order"), 1)
              test.equal(things[1].get("order"), 2)
              test.equal(things[2].get("order"), 3)
              test.equal(things[3].get("order"), 4)
              test.equal(things[4].get("order"), 5)
              test.done()
            }).sort({order: 1})
          })
        })
      })
    })
  })
}
 
module.exports = testCase(tests)
