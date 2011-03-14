var FreshCollection = require("./FreshCollection").FreshCollection
  , noop = function() {}
  , PubHub = require("./ConditionalPublisher").PubHub
  , freshDocuments = {}
  , EventEmitter = require("events").EventEmitter
  , sys = require("sys")
function merge(obj, other) {
  var keys = Object.keys(other)
    , i
    , key
  for (i = 0, len = keys.length; i < len; ++i) {
    key = keys[i]
    obj[key] = other[key]
  }
  return obj
}

exports.FreshDocument = function(collection, middlewares) {

  var FreshDocument = function(document) {
    this._isNew = true
    this.document = {}
    this.pending = document
  }
  sys.inherits(FreshDocument, EventEmitter)

  FreshDocument.prototype._executeMiddleware = function(callback, done) {
    if(middlewares.length != 0) {
      var i = 0
      middlewares[0].call(this, next)
      function next(err) {
        i++
        if(err) {
          callback(err)
        } else {
          if(middlewares[i]) {
            middlewares[i](next)
          } else {
            done(callback)
          }
        }
      }
    } else {
      done(callback)
    }
  }

  FreshDocument.prototype._indexById = function() {

    if(Array.isArray(freshDocuments[this.document._id])) {
      freshDocuments[this.document._id].push(this)
    } else {
      freshDocuments[this.document._id] = [this]
    } 
  }

  FreshDocument._wrapDocument = function(item) {
    doc = new FreshDocument(item)
    doc._isNew = false
    doc.document = doc.pending
    doc.pending = {}
    doc._indexById()
    return doc
  }

  FreshDocument.findOne = function(conditions, fn) {
    collection.findOne(conditions, function(err, item) {
      var doc = FreshDocument._wrapDocument(item)
      fn(doc)
    })
  }

  FreshDocument.find = function(conditions, fn) {
    var cursor = collection.find(conditions)
      , freshColl = new FreshCollection(conditions, cursor)
      , that = this
    
    cursor.toArray(function(err, arr) {
      if(arr) {
        arr.forEach(function(item) {
          var doc = FreshDocument._wrapDocument(item)
          freshColl._addDocument(doc) 
        })
        fn(freshColl)
      }
    })

    return freshColl
  } 

  FreshDocument.create = function(doc, fn) {
    var document = new FreshDocument(doc);
    document.save(fn || noop)
    return document
  } 

  FreshDocument.prototype.get = function(key) {
    return this.pending[key] || this.document[key]
  }

  FreshDocument.prototype.set = function(key, value) {
    var i
    if(typeof key === "object") {
      for(i in key) {
        if(key.hasOwnProperty(i)) {
          this.set(i, key[i])
        }
      }
    } else {
      this.pending[key] = value
    }
  }

  FreshDocument.prototype.update = function(doc, fn) {
    var that = this
    this.document = merge(this.document, doc)
    collection.update({_id: this.document._id}, this.document, function(err) {
      freshDocuments[that.document._id].forEach(function(doc) {
        doc._onUpdate(that)
      })
      ;(fn || noop)() 
    })  
  }

  FreshDocument.prototype.insert = function(doc, fn) {
    var that = this
    this._isNew = false
    this.document = merge(this.document, doc)
    this._executeMiddleware(fn, function(callback) {
      collection.insert(that.document, function(err, obj) {
        that._indexById()
        PubHub.pub(that, "add")
        ;(callback || noop)() 
      }) 
    })
  }

  FreshDocument.prototype.save = function(fn) {
    var that = this
    if(this._isNew) {
      this.insert(this.pending, fn)
    } else {
      this.update(this.pending, fn)
    }
    this.pending = {}
    return this
  }

  FreshDocument.prototype._onUpdate = function(item) {
    this.document = item.document
    this.emit("update")
  } 

  FreshDocument.prototype._onRemove = function(item) {
    this.emit("remove")
  } 

  FreshDocument.prototype.remove = function(fn) {
    var that = this
    collection.remove({"_id": this.document._id}, function() {
      PubHub.pub(that, "remove")
      freshDocuments[that.document._id].forEach(function(doc) {
        doc._onRemove(that)
      })
      ;(fn || noop)()
    })
    return this
  }

  FreshDocument.prototype.toJSON = function() {
    return this.data
  }

  return FreshDocument
} 
