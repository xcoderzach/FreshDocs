var BSON = require('mongodb').BSONPure

exports = module.exports = function Embed(options) {

  function saveEmbedded(next) {
    var that = this
    var assocs = Object.keys(options)
    assocs.forEach(function(assoc) {
      var associatedModel = options[assoc]
      var value = that.pending[assoc]
      
      that.pending[assoc] = BSON.DBRef(associatedModel.collectionName, value.document._id)
    })
    next()
  }

  return {
    "insert": saveEmbedded
  }
}
