var mongodb = require("mongodb"),
    Db = mongodb.Db,
    Server = mongodb.Server, 
    client = new Db('blogTest', new Server("127.0.0.1", 27017, {})),
    LiveRecord = require("./src/LiveRecord").LiveRecord;

exports.LiveModel = function(name, fn) {
  client.open(function(err) {
    client.collection(name, function(err, collection) {
      if(collection !== null) {
        //clear it for the tests ;->
        collection.remove(function(err, collection){
          fn(LiveRecord(collection));
        });
      }
    });
  });
};

exports.LiveModel.close = function() {
  client.close();
};
