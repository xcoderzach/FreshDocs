var PubHub = function(db) {
   this._subscriptions = []
   this.db = db
}

PubHub.prototype.pub = function(object) {
  var that = this
    , args = [].slice.call(arguments, 1)

  this._subscriptions.forEach(function(sub) {
    if(that.matchesConditions(object, sub.conditions)) {
      sub.fn.apply(this, [object].concat(args))
    }
  })
}

PubHub.prototype.matchesConditions = function(obj, conditions) {
  var i
    , j
    , condition
    , property
    , matches = true
    , compare

  for(i in conditions) {
    if(conditions.hasOwnProperty(i)) {
      condition = conditions[i]
      property = obj[i]
      if(!(i in obj)) {
        return false
      }
      if(typeof(condition) !== "object") {
        if(property !== condition) {
          return false
        }
      } else {
        for(j in condition) {
          if(condition.hasOwnProperty(j)) {
            if(j === "$gt") {
              if(property <= condition[j]) {
                return false
              }
            } else if(j === "$lt") {
              if(property >= condition[j]) {
                return false
              }
            } else if(j === "$gte") {
              if(property < condition[j]) {
                return false
              }
            } else if(j === "$lte") {
              if(property > condition[j]) {
                return false
              }
            } else {
              return false
            }
          }
        }
      }
    }
  }
  return true
}

PubHub.prototype.sub = function(conditions, fn) {
  this._subscriptions.push({conditions: conditions, fn:fn})
}

exports.PubHub = new PubHub()
