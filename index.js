var mongodb = require("mongodb"),
  Db = mongodb.Db,
  Server = mongodb.Server, 
  client = new Db('blogTest', new Server("127.0.0.1", 27017, {})),
  FreshDocument = require("./src/FreshDocument").FreshDocument

exports.FreshDocuments = function(name, fn) {
  client.open(function(err) {
    if(err) {
      console.log(err.stack)
    }
    client.collection(name, function(err, collection) {
      if(err) {
        console.log(err.stack)
      }
      if(collection !== null) {
        fn(FreshDocument(collection))
      }
    })
  })
}

exports.FreshDocuments.close = function() {
  client.close()
}
