exports = module.exports = function Validation(options) {

  var validator = { 
    length: function(field, params, document) {
      if(document[field].length < params.between[0] ||
         document[field].length > params.between[1]) {
        return params.message || "invalid length";
      }
      return false
    },
    regex: function(field, params, document) {
      if(!params.match.test(document[field])) {
        return params.message || "Does not match specified pattern";
      }
      return false
    } 
  }

  function validate(next) {
    var that = this
      , fields = Object.keys(options)
      , errors = false
      , err
    fields.forEach(function(field) {
      var criteria = Object.keys(options[field])
      criteria.forEach(function(criterion) {
        err = validator[criterion](field, options[field][criterion], that.document)
        if(err) {
          errors = true
          next(new Error(err))
        }
      })
    })
    if(!errors) {
      next() 
    }
  }
  return {
    "update": validate
  , "insert": validate
  }
}
