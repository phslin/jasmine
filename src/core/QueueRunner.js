jasmine.QueueRunner = function(attrs) {
  this.fns = attrs.fns || [];
  this.onComplete = attrs.onComplete || function() {};
  this.onException = attrs.onException || function() {};
  this.catchingExceptions = attrs.catchingExceptions || function() { return true; };
};

jasmine.QueueRunner.prototype.execute = function() {
  this.run(this.fns, 0)
};

jasmine.QueueRunner.prototype.run = function(fns, index) {
  if (index >= fns.length) {
    this.onComplete();
    return;
  }

  var fn = fns[index];
  // TODO: Now that QueueRunner is extracted, what should the context be to called fns? The spec? null?
  var self = this;
  if (fn.length > 0) {
    attempt(function() { fn.call(self, function() {  self.run(fns, index + 1) }) });
  } else {
    attempt(function() { fn.call(self); });
    self.run(fns, index + 1);
  }

  function attempt(fn) {
    try {
      fn();
    } catch (e) {
      self.onException(e);
      if (!self.catchingExceptions()) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  }
};


//addSpec = function(spec) {
//  children = function(onComplete) { spec.execute(onComplete); };
//}

