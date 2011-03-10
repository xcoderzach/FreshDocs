var mongodb = require("mongodb")
  , Db = mongodb.Db
  , Server = mongodb.Server
  , client = new Db('publisherTest', new Server("127.0.0.1", 27017, {}))

var PubHub = function(db) {
   this._subscriptions = {}
   this.db = db;
}

PubHub.prototype.pub = function(context, object) {
  var that = this
  client.collection("__" + context + "__", function(err, collection) {
    var query
      , equals
      , exists
      , i
    if(collection !== null) { 
      var query
        , equals
        , exists
      for(i in object) {
        if(object.hasOwnProperty(i)) {
          equals = {}
          equals[i] = object[i]
          exists = {}
          exists[i] = {"$exists": false}
          query = {"$or": [equals, exists]}
        }
      }
      collection.find(query, function(err, cursor) {
        cursor.each(function(err, item) {
          if(item !== null) {
            that._notifySubscribers(item._id, object)
          }
        })
      })
    }
  })
}

PubHub.prototype._notifySubscribers = function(id, object) {
  var i
    , subs = this._subscriptions[id]
  if(subs) {
    subs.forEach(function(sub) {
      sub(object)
    })
  }
}

PubHub.prototype.sub = function(context, conditions, fn) {
  var that = this;
  client.collection("__" + context + "__", function(err, collection) {
    var id = conditions._id = collection.db.pkFactory.createPk()
      , subs = that._subscriptions[id] = that._subscriptions[id] || []
    if(collection !== null) {
      collection.insert(conditions, function(err, cursor) {
        subs.push(fn)
      })
    }
  })
}

var ConditionalPublisher = exports.ConditionalPublisher = function(fn) {
  client.open(function(err) {
    fn(new PubHub())
  }) 
}

