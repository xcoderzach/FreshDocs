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

tests["validate incorrect length gives error on create"] = function(test) {
  var Things = FreshDocuments("things", 
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
  var Things = FreshDocuments("things", 
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
  var Things = FreshDocuments("things", 
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
  var Things = FreshDocuments("things", 
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
  var Things = FreshDocuments("things", 
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
 
tests["validate regex AND length"] = function(test) {
  var Things = FreshDocuments("things", 
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
  
module.exports = testCase(tests)
