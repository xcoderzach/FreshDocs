var FreshDocuments = require("../index").FreshDocuments
  , Validations = require("../lib/middleware/validation")
  , testCase = require('nodeunit').testCase
  , DatabaseCleaner = require('database-cleaner') 
  , databaseCleaner = new DatabaseCleaner("mongodb")
  , tests = {} 
  , mongodb = require("mongodb")
  , Db = mongodb.Db
  , Server = mongodb.Server
  , client = new Db('awesome', new Server("127.0.0.1", 27017, {}))
   
function randomCollectionName () {
  var s = ""
    , rand
  for (var i = 0; i < 12; i++) {
    rand = 97 + Math.floor(Math.random()*(122 - 97))
    s += String.fromCharCode(rand)
  };
  return s
}
 
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

tests["validate incorrect length gives error on create"] = function(test) {
  test.expect(2)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: {length: {between: [4, 100], message: "Invalid length"}}}))
  Things.create({title: "asd"}, function(err) {
    test.equal(err.message, "Invalid length")
    var things = Things.find({}, function() {
      test.equal(things.length, 0)
      test.done()
    })
  })
}


tests["validate correct length gives no error and saves on create"] = function(test) {
  test.expect(3)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: {length: {between: [4, 100], message: "Invalid length"}}}))
  Things.create({title: "valid"}, function(err) {
    test.equal(err, null)
    var things = Things.find({}, function() {
      test.equal(things.length, 1)
      test.equal(things[0].get("title"), "valid") 
      test.done()
    })
  })
} 
 
tests["validate correct length gives no error on update"] = function(test) {
  test.expect(1)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: {length: {between: [4, 100], message: "Invalid length"}}}))
  var thing = Things.create({title: "this is valid"}, function(err) {
    thing.set("title", "another valid one")
    thing.save(function() {
      var things = Things.find({}, function() {
        test.equal(things.length, 1)
        test.done()
      })
    })
  })
}

tests["validate incorrect length gives error on update"] = function(test) {
  test.expect(3)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: {length: {between: [4, 100], message: "Invalid length"}}}))
  var thing = Things.create({title: "valid"}, function(err) {
    thing.set("title", "x")
    thing.save(function(err) {
      test.equal(err.message, "Invalid length")
      var things = Things.find({}, function() {
        test.equal(things.length, 1)
        test.equal(things[0].get("title"), "valid") 
        test.done()
      })
    })
  })
} 

tests["validate with regex"] = function(test) {
  test.expect(3)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: {regex: {match:/^title.*$/i, message: "Invalid length"}}}))
  Things.create({title: "title10"}, function(err) {
    test.equal(err, null)
    var things = Things.find({}, function() {
      test.equal(things.length, 1)
      test.equal(things[0].get("title"), "title10") 
      test.done()
    })
  })
}    
 
tests["invalidate with regex"] = function(test) {
  test.expect(2)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: {regex: {match:/^title.*$/i, message: "Does not match pattern"}}}))
  Things.create({title: "bitle10"}, function(err) {
    test.equal(err.message, "Does not match pattern")
    var things = Things.find({}, function() {
      test.equal(things.length, 0)
      test.done()
    })
  })
}    
 
tests["validate regex AND length"] = function(test) {
  test.expect(2)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: { regex: {match:/^title.*$/i, message: "Invalid length"}
                                      , length: { between: [4, 100], message: "Doesn't Match"}}}))
    , testCount = 0
  Things.create({title: "x"}, function(err) {
    if(err.message === "Doesn't Match") {
      test.equal(err.message, "Doesn't Match")
      testCount++
    } else if (err.message === "Invalid length") {
      test.equal(err.message, "Invalid length")
      testCount++
    } else {
      test.equal(true, false) //Failamanjaro!
      testCount++
    }

    if(testCount === 2) {
      test.done()
    }
  })
}    

tests["validate with custom function"] = function(test) {
  test.expect(4)
  var Things = FreshDocuments(randomCollectionName(), 
                 Validations({ title: {custom: {fn: function(field) { if(field == "good") return true }, message: "Does not match fn"}}}))
  Things.create({title: "good"}, function(err) {
    test.equal(err, null)
    var things = Things.find({}, function() {
      test.equal(things.length, 1)
      Things.create({title: "bad"}, function(err) {
        test.equal(err.message, "Does not match fn")
        var things = Things.find({title: "bad"}, function() {
          test.equal(things.length, 0)
          test.done()
        })
      }) 
    })
  })
  
}    
 
  
module.exports = testCase(tests)
