var FreshCollection = require("./FreshCollection").FreshCollection
  , noop = function() {}
  , PubHub = require("./ConditionalPublisher").PubHub
  , freshDocuments = {}

exports.FreshDocument = function(collection) {

  var FreshDocument = function(data) {
    var i
    if(freshDocuments[data._id]) {
      return freshDocuments[data._id]
    }
    this.data = data
    this._isNew = true
    for(i in this.data) {
      this[i] = this.data[i]
    }
  }

  FreshDocument.find = function(conditions, fn) {
    var arr = []
    collection.find(conditions).toArray(function(err, arr) {
      arr = arr.map(function(item) {
        var rec = new FreshDocument(item)
        rec._isNew = false
        return rec
      })
      fn(new FreshCollection(arr, conditions))
    })
  } 

  FreshDocument.prototype.get = function(key) {
    return this.data[key]
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
      this.data[key] = value
      this[key] = value
    }
  }

  FreshDocument.prototype.save = function(fn) {
    var that = this
    if(this._isNew) {
      this._isNew = false
      collection.insert(this.data, function(err, obj) {

        freshDocuments[obj._id] = that
        PubHub.pub(that, "create")
        ;(fn || noop)() 
      })
    } else {
      collection.update({_id: this.data._id}, this.data, function(err, cursor) {
        freshDocuments[that.data._id]._onUpdate(that.data)
        ;(fn || noop)() 
      }) 
    }
    return this
  }

  FreshDocument.prototype._onUpdate = function(item) {
    if(this.get("_id").id === item._id.id) {
      this.set(item)
    }
  } 

  FreshDocument.prototype.remove = function(fn) {
    var that = this
    collection.remove({"_id": this.data._id}, function() {
      PubHub.pub(that.data, "remove")
      ;(fn || noop)()
    })
    return this
  }

  FreshDocument.prototype.toJSON = function() {
    return this.data
  }

  return FreshDocument
} 
