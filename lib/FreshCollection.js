var EventEmitter = require("events").EventEmitter 
  , util = require('util')
  , PubHub = require("./ConditionalPublisher").PubHub
  , FreshCollection
  
function compare(a, b, desc) {
  var comparison = a > b
  return (desc) ? !comparison : comparison
}
FreshCollection = exports.FreshCollection = function(conditions, cursor) {
  var i
    , that = this

  this.cursor = cursor
  this.conditions = conditions
  this.docs = []
  this.queue = []
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
util.inherits(FreshCollection, EventEmitter)

FreshCollection.prototype.limit = function(n) {
  this._limit = n
  this.cursor.limit(n)
  return this
}

FreshCollection.prototype.sort = function(sort) {
  this._sort = sort
  this.cursor.sort(sort)
  return this
}

FreshCollection.prototype._addDocument = function(item) {
  var that = this
    , i
    , l
    , key
  //if limit - length >= 0 don't add
  if(!this._limit || this._limit - this.length > 0) {
    if(!this._sort || this.length == 0) {
      this[this.length] = item
      this.docs.push(item)
    } else {
      key = Object.keys(this._sort)[0]
      for(i = 0, l = this.length + 1 ; i < l ; i++) {
        if(i == l - 1) {
          this[this.length] = item
          this.docs.push(item)
          break;
        }
        if(compare(this.docs[i].document[key], item.document[key], this._sort[key] < 0)) {
          ;[].splice.call(this, i, 0, item)
          this.docs.splice(i, 0, item)
          break;
        }
      }
    }

    item.on("update", function() {
      var index = that.docs.indexOf(item)
      that.emit("update", item, index)
    }) 
    this.emit("add", item)
  } else {
    this.queue.push(item)
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

  if(this._limit - this.length > 0 && this.queue.length > 0) {
    this._addDocument(this.queue.shift())
  }
} 

FreshCollection.prototype.toJSON = function() {
  var arr = []
  this.docs.forEach(function(doc) {
    arr.push(doc.toJSON())
  })
  return arr
}
