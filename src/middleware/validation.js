exports = module.exports = function Validation(options) {

  var validator = { 
    length: function(field, params, document) {
      if(document[field].length < params.between[0] ||
         document[field].length > params.between[1]) {
        return params.message || "invalid length";
      }
    }
  }

  return function(next) {
    var that = this
    var fields = Object.keys(options)
    fields.forEach(function(field) {
      var criteria = Object.keys(options[field])
      criteria.forEach(function(criterion) {
        var err = validator[criterion](field, options[field][criterion], that.document)
        if(err) {
          next(new Error(err))
        } else {
          next() 
        }
      })
    })
  }


}
