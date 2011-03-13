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

exports.FreshDocument = function(collection) {

  var FreshDocument = function(document) {
    var i
    if(document._id) {
      this._isNew = false
      this.document = document
      this._indexById()
      this.pending = {}
    } else {
      this._isNew = true
      this.document = {}
      this.pending = document
    }
  }
  sys.inherits(FreshDocument, EventEmitter)

  FreshDocument.prototype._indexById = function() {
    if(Array.isArray(freshDocuments[this.document._id])) {
      freshDocuments[this.document._id].push(this)
    } else {
      freshDocuments[this.document._id] = [this]
    } 
  }

  FreshDocument.find = function(conditions, fn) {
    var freshColl = new FreshCollection(conditions)
    collection.find(conditions).toArray(function(err, arr) {
      if(arr) {
        arr.forEach(function(item) {
          var doc = new FreshDocument(item)
          freshColl._addDocument(doc)
        })
        fn(freshColl)
      }
    })
    return freshColl
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

  FreshDocument.prototype.save = function(fn) {
    var that = this
    this.document = merge(this.document, this.pending)
    this.pending = {}
    if(this._isNew) {
      this._isNew = false
      collection.insert(this.document, function(err, obj) {
        that._indexById()
        PubHub.pub(that, "create")
        ;(fn || noop)() 
      })
    } else {
      collection.update({_id: this.document._id}, this.document, function(err) {
        freshDocuments[that.document._id].forEach(function(doc) {
          doc._onUpdate(that)
        })
        ;(fn || noop)() 
      }) 
    }
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
