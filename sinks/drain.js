'use strict'

module.exports = function drain (op, done) {
  var read, abort

  function _done (err) {
    if(done) done(err === true ? null : err)
    else if(err && err !== true)
      throw err
  }

  function sink (_read) {
    read = _read
    if(abort) return sink.abort()
    //this function is much simpler to write if you
    //just use recursion, but by using a while loop
    //we do not blow the stack if the stream happens to be sync.
    ;(function next() {
        var loop = true, cbed = false
        while(loop) {
          cbed = false
          read(null, function again (end, data) {
            cbed = true
            if(end = end || abort) {
              loop = false
              _done(end)
            }
            else if(op && false === op(data)) {
              loop = false
              //very narrow edgecase: to get here you must call sink.abort
              //AND return false from op.
              if(abort) return _done(true)
              read( true, _done)
            }
            else if(!loop){
              next()
            }
          })
          if(!cbed) {
            loop = false
            return
          }
        }
      })()
  }

  sink.abort = function (err, cb) {
    if('function' == typeof err)
      cb = err, err = true
    abort = err || true
    if(read) return read(abort, function (end) {
      cb && cb(end === true ? null : end)
    })
  }

  return sink
}











