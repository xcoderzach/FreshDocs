var Mongolian = require("mongolian")
  , server = new Mongolian()
  , db = server.db("awesome")
  , FreshDocument = require("./src/FreshDocument").FreshDocument

exports.FreshDocuments = function(name) {
  var middlewares = [].slice.call(arguments, 1)
  return FreshDocument(db.collection(name), middlewares)
}
