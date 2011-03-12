var FreshCollection = require("./FreshCollection").FreshCollection
  , noop = function() {}
  , PubHub = require("./ConditionalPublisher").PubHub
  , freshDocuments = []

exports.FreshDocument = function(collection) {

  var FreshDocument = function(data) {
    var i
    this.data = data
    this._isNew = true
    freshDocuments.push(this)
    for(i in this.data) {
      this[i] = this.data[i]
    }
  }

  FreshDocument.find = function(conditions, fn) {
    collection.find(conditions, function(err, cursor) {
      if(cursor !== null) {
        var arr = []
        cursor.each(function(err, item) {
          if(item !== null) {
            var rec = new FreshDocument(item)
            rec._isNew = false
            arr.push(rec)
          } else {
            var freshCollection = new FreshCollection(arr, conditions)
            fn(freshCollection)
          }
        })
      }
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
      collection.insert(this.data, function(err, cursor) {
        if(cursor !== null) {
          PubHub.pub(new FreshDocument(that.data), "create")
          ;(fn || noop)() 
        }
      })
    } else {
      collection.update({_id: this.data._id}, this.data, function(err, cursor) {
        if(cursor !== null) {
          freshDocuments.forEach(function(freshDocument) {
            freshDocument._onUpdate(that.data)
          }, this)
          
          ;(fn || noop)() 
        }
      }) 
    }
    return this
  }

  FreshDocument.prototype._onUpdate = function(item) {
    var i
    if(this.get("_id").id === item._id.id) {
      this.set(item)
    }
  } 

  FreshDocument.prototype.remove = function(fn) {
    var that = this
    collection.remove({"_id": that.data._id}, function() {
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
