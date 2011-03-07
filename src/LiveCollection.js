var EventEmitter = require("events").EventEmitter;
var sys = require("sys");
var liveCollections = exports.liveCollections = [];

var LiveCollection = exports.LiveCollection = function(docs, conditions) {
  var i;

  this.docs = docs;
  this.conditions = conditions;

  this.__defineGetter__("length", function() { return docs.length; });
  this.__defineSetter__("length", function() {});

  for(i = 0 ; i < this.docs.length ; i++) {
    this[i] = docs[i];
  }
  liveCollections.push(this);
};
sys.inherits(LiveCollection, EventEmitter);


LiveCollection.prototype._onCreate = function(item) {
  var key;

  for(key in this.conditions) {
    if(this.conditions.hasOwnProperty(key) &&
       item.get(key) !== this.conditions[key]) {
      return;
    }
  }
  this.docs.push(item);
  this[this.length-1] = item;
  this.emit("create", item);
};

LiveCollection.prototype._onRemove = function(id) {
  var i,
      doc;
  for(i = 0 ; i < this.docs.length ; i++) {
    doc = this.docs[i];
    if(doc.get("_id").id === id.id) {
      [].splice.call(this, i, 1);
      this.docs.splice(i, 1);
      this.emit("remove", id);
    }
  }
}; 


