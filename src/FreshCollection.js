var EventEmitter = require("events").EventEmitter 
  , sys = require("sys")
  , PubHub = require("./ConditionalPublisher").PubHub
  , FreshCollection
  
FreshCollection = exports.FreshCollection = function(conditions) {

  var i
    , that = this

  this.conditions = conditions
  this.docs = []
  this.__defineGetter__("length", function() { return this.docs.length })
  this.__defineSetter__("length", function() {})

  PubHub.sub(conditions, function(doc, type) {
    if(type === "create") {
      that._addDocument(doc)
    }
    if(type === "remove") {
      that._removeDocument(doc)
    }
  })
}
sys.inherits(FreshCollection, EventEmitter)


FreshCollection.prototype._addDocument = function(item) {
  this[this.length] = item
  this.docs.push(item)
  this.emit("add", item)
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
 
