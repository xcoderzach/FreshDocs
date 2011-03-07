var LC = require("./LiveCollection"),
    LiveCollection = LC.LiveCollection,
    liveCollections = LC.liveCollections,
    liveRecords = [];

exports.LiveRecord = function(collection) {

  var LiveRecord = function(data) {
    this.data = data;
    this._isNew = true;
    liveRecords.push(this);
  };

  LiveRecord.find = function(conditions, fn) {
    collection.find(conditions, function(err, cursor) {
      if(cursor !== null) {
        var arr = [];
        cursor.each(function(err, item) {
          if(item !== null) {
            var rec = new LiveRecord(item);
            rec._isNew = false;
            arr.push(rec);
          } else {
            var liveCollection = new LiveCollection(arr, conditions);
            fn(liveCollection);
          }
        });
      }
    });
  }; 

  LiveRecord.prototype.get = function(key) {
    return this.data[key];
  };

  LiveRecord.prototype.set = function(key, value) {
    var i;
    if(typeof key === "object") {
      for(i in key) {
        if(key.hasOwnProperty(i)) {
          this.set(i, key[i]);
        }
      }
    } else {
      this.data[key] = value;
    }
  };

  LiveRecord.prototype.save = function(fn) {
    var that = this;
    if(this._isNew) {
      this._isNew = false;
      collection.insert(this.data, function(err, cursor) {
        if(cursor !== null) {
          liveCollections.forEach(function(liveCollection) {
            liveCollection._onCreate(new LiveRecord(cursor[0]));
          });
          fn(); 
        }
      });
    } else {
      collection.update({_id: this.data._id}, this.data, function(err, cursor) {
        if(cursor !== null) {
          liveRecords.forEach(function(liveRecord) {
            liveRecord._onUpdate(that.data);
          }, this);
          fn(); 
        }
      }); 
    }
    return this;
  };

  LiveRecord.prototype._onUpdate = function(item) {
    var i;
    if(this.get("_id").id === item._id.id) {
      this.set(item);
    }
  }; 

  LiveRecord.prototype.remove = function(fn) {
    var that = this;
    collection.remove({"_id": that.data._id}, function() {
      liveCollections.forEach(function(liveCollection) {
        liveCollection._onRemove(that.data._id);
      });
      fn();
    });
    return this;
  };

  return LiveRecord;
}; 
