var Mongolian = require("mongolian")
  , server = new Mongolian()
  , db = server.db("awesome")
  , FreshDocument = require("./src/FreshDocument").FreshDocument

exports.FreshDocuments = function(name, fn) {
  return FreshDocument(db.collection(name))
}
