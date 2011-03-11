var LiveCollection = require("./LiveCollection").LiveCollection
  , noop = function() {}
  , PubHub = require("./ConditionalPublisher").PubHub
  , liveRecords = []

exports.LiveRecord = function(collection) {

  var LiveRecord = function(data) {
    var i
    this.data = data
    this._isNew = true
    liveRecords.push(this)
    for(i in this.data) {
      this[i] = this.data[i]
    }
  }

  LiveRecord.find = function(conditions, fn) {
    collection.find(conditions, function(err, cursor) {
      if(cursor !== null) {
        var arr = []
        cursor.each(function(err, item) {
          if(item !== null) {
            var rec = new LiveRecord(item)
            rec._isNew = false
            arr.push(rec)
          } else {
            var liveCollection = new LiveCollection(arr, conditions)
            fn(liveCollection)
          }
        })
      }
    })
  } 

  LiveRecord.prototype.get = function(key) {
    return this.data[key]
  }

  LiveRecord.prototype.set = function(key, value) {
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

  LiveRecord.prototype.save = function(fn) {
    var that = this
    if(this._isNew) {
      this._isNew = false
      collection.insert(this.data, function(err, cursor) {
        if(cursor !== null) {
          PubHub.pub(new LiveRecord(that.data), "create")
          ;(fn || noop)() 
        }
      })
    } else {
      collection.update({_id: this.data._id}, this.data, function(err, cursor) {
        if(cursor !== null) {
          liveRecords.forEach(function(liveRecord) {
            liveRecord._onUpdate(that.data)
          }, this)
          
          ;(fn || noop)() 
        }
      }) 
    }
    return this
  }

  LiveRecord.prototype._onUpdate = function(item) {
    var i
    if(this.get("_id").id === item._id.id) {
      this.set(item)
    }
  } 

  LiveRecord.prototype.remove = function(fn) {
    var that = this
    collection.remove({"_id": that.data._id}, function() {
      PubHub.pub(that.data, "remove")
      ;(fn || noop)()
    })
    return this
  }

  return LiveRecord
} 
