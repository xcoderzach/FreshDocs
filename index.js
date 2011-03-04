var mongodb = require("mongodb"),
    Db = mongodb.Db,
    Server = mongodb.Server, 
    client = new Db('blogTest', new Server("127.0.0.1", 27017, {})),
    liveCollections = [];

var LiveCollection = function(docs, conditions) {
  var i;
  this.docs = docs;
  this.conditions = conditions;
  this.__defineGetter__("length", function() { return docs.length; });
  for(i = 0 ; i < this.docs.length ; i++) {
    this[i] = docs[i];
  }
};

LiveCollection.prototype._onCreate = function(item) {
  var key;
  for(key in this.conditions) {
    if(this.conditions.hasOwnProperty(key) &&
       item[key] == this.conditions[key]) {
       this.docs.push(item);
       this[this.length-1] = item;
    }
  }
};

var createLiveRecord = function(collection) {

  var LiveRecord = function(data) {
    this.data = data;
  };

  LiveRecord.find = function(conditions, fn) {
    collection.find(conditions, function(err, cursor) {
      if(cursor !== null) {
        cursor.toArray(function(err, docs) {
          var liveCollection = new LiveCollection(docs, conditions);
          liveCollections.push(liveCollection);
          fn(liveCollection);
        });
      }
    });
  }; 

  LiveRecord.prototype.save = function(fn) {
    collection.insert(this.data, function(err, docs) {
      liveCollections.forEach(function(liveCollection) {
        liveCollection._onCreate(docs[0]);
      });
      fn();
    });
    return this;
  };
  return LiveRecord;
}; 

exports.LiveModel = function(name, fn) {
  client.open(function(err) {
    client.collection(name, function(err, collection) {
      if(collection !== null) {
        //clear it for the tests ;->
        collection.remove(function(err, collection){
          fn(createLiveRecord(collection));
        });
      }
    });
  });
};

exports.LiveModel.close = function() {
  client.close();
};


