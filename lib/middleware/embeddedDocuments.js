var BSON = require('mongodb').BSONPure

exports = module.exports = function Embed(options) {

  function saveEmbedded(next) {
    var that = this
    var assocs = Object.keys(options)
    assocs.forEach(function(assoc) {
      var associatedModel = options[assoc]
      var value = that.document[assoc]
      that.document[assoc] = new BSON.DBRef(associatedModel.collectionName, value.document._id)
      that[assoc] = value
    })
    next()
  }

  function findEmbedded(next) {
    var that = this
    var assocs = Object.keys(options)

    assocs.forEach(function(assoc) {
      var associatedModel = options[assoc]
      var value = that.pending[assoc]
      associatedModel.findOne({_id: that.document[assoc].oid}, function(doc) {
        console.log("w00t")
        that[assoc] = doc
        next() 
      })
    })
  }

  return {
    "insert": saveEmbedded
  , "find": findEmbedded
  }
}
