var BSON = require('mongodb').BSONPure

exports = module.exports = function Embed(options) {

  function saveEmbedded(next) {
    var that = this
    var assocs = Object.keys(options)
    assocs.forEach(function(assoc) {
      var associatedModel = options[assoc]
      if(!Array.isArray(associatedModel)) {
        var value = that.document[assoc]
        that.document[assoc] = new BSON.DBRef(associatedModel.collectionName, value.document._id)
        that[assoc] = value
      } else {
        associatedModel = associatedModel[0]
        var values = that.document[assoc]
        that.document[assoc] = []
        that[assoc] = []
        values.forEach(function(value) {
          that.document[assoc].push(new BSON.DBRef(associatedModel.collectionName, value.document._id))
          that[assoc].push(value)
        })
      }
    })
    next()
  }

  function findEmbedded(next) {
    var that = this
    var assocs = Object.keys(options)
    var doc

    assocs.forEach(function(assoc) {
      var associatedModel = options[assoc]
      if(!Array.isArray(associatedModel)) {
        var value = that.document[assoc]
        associatedModel.findOne({_id: value.oid}, function(doc) {
          that[assoc] = doc
          next() 
        })
      } else {
        associatedModel = associatedModel[0]
        var values = that.document[assoc]
        that.document[assoc] = []
        that[assoc] = []
        found = 0
        values.forEach(function(value) { 
          associatedModel.findOne({_id: value.oid}, function(doc) {
            found++
            that[assoc].push(doc)
            if(found == values.length) {
              next()
            } 
          }) 
          
        })
      }
    })
  }

  return {
    "insert": saveEmbedded
  , "find": findEmbedded
  }
}
