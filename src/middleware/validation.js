exports = module.exports = function Validation(options) {

  return function(next) {
    if(this.document.title.length < options.title.length[0] ||
       this.document.title.length > options.title.length[1]) {
      next(new Error(options.title.message))
    } else {

    }
  }

}
