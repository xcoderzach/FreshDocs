var EventEmitter = require("events").EventEmitter 
  , sys = require("sys")
  , PubHub = require("./ConditionalPublisher").PubHub
  , FreshCollection
  
FreshCollection = exports.FreshCollection = function(conditions, cursor) {

  var i
    , that = this

  this.cursor = cursor
  this.conditions = conditions
  this.docs = []
  this.__defineGetter__("length", function() { return this.docs.length })
  this.__defineSetter__("length", function() {})

  PubHub.sub(conditions, function(doc, type) {
    if(type === "add") {
      that._addDocument(doc)
    }
    if(type === "remove") {
      that._removeDocument(doc)
    }
  })
}
sys.inherits(FreshCollection, EventEmitter)

FreshCollection.prototype.limit = function(n) {
  this._limit = n
  this.cursor.limit(n)
  return this
}

FreshCollection.prototype._addDocument = function(item) {
  //if limit - length >= 0 don't add
  if(!this._limit || this._limit - this.length > 0) {
    var that = this
    this[this.length] = item
    this.docs.push(item)

    item.on("update", function() {
      var index = that.docs.indexOf(item)
      that.emit("update", item, index)
    }) 

    this.emit("add", item)
  }
}

FreshCollection.prototype._removeDocument = function(removed) {
  var i,
      doc

  for(i = 0 ; i < this.docs.length ; i++) {
    doc = this.docs[i]
    if(doc.document._id.id === removed.document._id.id) {
      ;[].splice.call(this, i, 1)
      this.docs.splice(i, 1)
      this.emit("remove", removed, i)
    }
  }
} 

FreshCollection.prototype.toJSON = function() {
  var arr = []
  this.docs.forEach(function(doc) {
    arr.push(doc.toJSON())
  })
  return arr
}
 
