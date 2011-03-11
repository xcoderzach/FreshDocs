var EventEmitter = require("events").EventEmitter
  , sys = require("sys")
  , PubHub = require("./ConditionalPublisher").PubHub
  , LiveCollection = exports.LiveCollection = function(docs, conditions) {

  var i
    , that = this

  this.docs = docs
  this.conditions = conditions

  this.__defineGetter__("length", function() { return docs.length })
  this.__defineSetter__("length", function() {})

  for(i = 0 ; i < this.docs.length ; i++) {
    this[i] = docs[i]
  }

  PubHub.sub(conditions, function(doc, type) {
    if(type === "create") {
      that._onCreate(doc)
    }
    if(type === "remove") {
      that._onRemove(doc)
    }
  })
}
sys.inherits(LiveCollection, EventEmitter)


LiveCollection.prototype._onCreate = function(item) {
  ;[].push.call(this, item)
  this.docs.push(item)
  this.emit("create", item)
}

LiveCollection.prototype._onRemove = function(removed) {
  var i,
      doc
  for(i = 0 ; i < this.docs.length ; i++) {
    doc = this.docs[i]
    if(doc.get("_id").id === removed._id.id) {
      [].splice.call(this, i, 1)
      this.docs.splice(i, 1)
      this.emit("remove", removed, i)
    }
  }
} 
