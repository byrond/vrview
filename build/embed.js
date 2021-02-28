(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (process){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

var TWEEN = TWEEN || (function () {

	var _tweens = [];

	return {

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function (tween) {

			_tweens.push(tween);

		},

		remove: function (tween) {

			var i = _tweens.indexOf(tween);

			if (i !== -1) {
				_tweens.splice(i, 1);
			}

		},

		update: function (time, preserve) {

			if (_tweens.length === 0) {
				return false;
			}

			var i = 0;

			time = time !== undefined ? time : TWEEN.now();

			while (i < _tweens.length) {

				if (_tweens[i].update(time) || preserve) {
					i++;
				} else {
					_tweens.splice(i, 1);
				}

			}

			return true;

		}
	};

})();


// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
	TWEEN.now = function () {
		var time = process.hrtime();

		// Convert [seconds, nanoseconds] to milliseconds.
		return time[0] * 1000 + time[1] / 1000000;
	};
}
// In a browser, use window.performance.now if it is available.
else if (typeof (window) !== 'undefined' &&
         window.performance !== undefined &&
		 window.performance.now !== undefined) {
	// This must be bound, because directly assigning this function
	// leads to an invocation exception in Chrome.
	TWEEN.now = window.performance.now.bind(window.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
	TWEEN.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
	TWEEN.now = function () {
		return new Date().getTime();
	};
}


TWEEN.Tween = function (object) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _repeatDelayTime;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	this.to = function (properties, duration) {

		_valuesEnd = properties;

		if (duration !== undefined) {
			_duration = duration;
		}

		return this;

	};

	this.start = function (time) {

		TWEEN.add(this);

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : TWEEN.now();
		_startTime += _delayTime;

		for (var property in _valuesEnd) {

			// Check if an Array was provided as property value
			if (_valuesEnd[property] instanceof Array) {

				if (_valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (_object[property] === undefined) {
				continue;
			}

			// Save the starting value.
			_valuesStart[property] = _object[property];

			if ((_valuesStart[property] instanceof Array) === false) {
				_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[property] = _valuesStart[property] || 0;

		}

		return this;

	};

	this.stop = function () {

		if (!_isPlaying) {
			return this;
		}

		TWEEN.remove(this);
		_isPlaying = false;

		if (_onStopCallback !== null) {
			_onStopCallback.call(_object, _object);
		}

		this.stopChainedTweens();
		return this;

	};

	this.end = function () {

		this.update(_startTime + _duration);
		return this;

	};

	this.stopChainedTweens = function () {

		for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
			_chainedTweens[i].stop();
		}

	};

	this.delay = function (amount) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function (times) {

		_repeat = times;
		return this;

	};

	this.repeatDelay = function (amount) {

		_repeatDelayTime = amount;
		return this;

	};

	this.yoyo = function (yoyo) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function (easing) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function (interpolation) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function (callback) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function (callback) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function (callback) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function (callback) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function (time) {

		var property;
		var elapsed;
		var value;

		if (time < _startTime) {
			return true;
		}

		if (_onStartCallbackFired === false) {

			if (_onStartCallback !== null) {
				_onStartCallback.call(_object, _object);
			}

			_onStartCallbackFired = true;
		}

		elapsed = (time - _startTime) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction(elapsed);

		for (property in _valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];

			if (end instanceof Array) {

				_object[property] = _interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
						end = start + parseFloat(end);
					} else {
						end = parseFloat(end);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					_object[property] = start + (end - start) * value;
				}

			}

		}

		if (_onUpdateCallback !== null) {
			_onUpdateCallback.call(_object, value);
		}

		if (elapsed === 1) {

			if (_repeat > 0) {

				if (isFinite(_repeat)) {
					_repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in _valuesStartRepeat) {

					if (typeof (_valuesEnd[property]) === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[property];

						_valuesStartRepeat[property] = _valuesEnd[property];
						_valuesEnd[property] = tmp;
					}

					_valuesStart[property] = _valuesStartRepeat[property];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				if (_repeatDelayTime !== undefined) {
					_startTime = time + _repeatDelayTime;
				} else {
					_startTime = time + _delayTime;
				}

				return true;

			} else {

				if (_onCompleteCallback !== null) {

					_onCompleteCallback.call(_object, _object);
				}

				for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start(_startTime + _duration);
				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

		},

		Out: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			k *= 2;

			if (k < 1) {
				return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
			}

			return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return TWEEN;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {

		// Node.js
		module.exports = TWEEN;

	} else if (root !== undefined) {

		// Global variable
		root.TWEEN = TWEEN;

	}

})(this);

}).call(this,_dereq_('_process'))
},{"_process":4}],2:[function(_dereq_,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   3.3.1
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  return function () {
    vertxNext(flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = _dereq_;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof _dereq_ === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

polyfill();
// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":4}],3:[function(_dereq_,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],4:[function(_dereq_,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(_dereq_,module,exports){
(function(){var g={};
(function(window){var k,aa=this;aa.we=!0;function n(a,b){var c=a.split("."),d=aa;c[0]in d||!d.execScript||d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===b?d[e]?d=d[e]:d=d[e]={}:d[e]=b}function ba(a){var b=p;function c(){}c.prototype=b.prototype;a.Be=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.ye=function(a,c,f){return b.prototype[c].apply(a,Array.prototype.slice.call(arguments,2))}};/*

 Copyright 2016 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function ca(a){this.c=Math.exp(Math.log(.5)/a);this.b=this.a=0}function da(a,b,c){var d=Math.pow(a.c,b);c=c*(1-d)+d*a.a;isNaN(c)||(a.a=c,a.b+=b)}function ea(a){return a.a/(1-Math.pow(a.c,a.b))};function fa(){this.c=new ca(2);this.f=new ca(5);this.a=0;this.b=5E5}fa.prototype.setDefaultEstimate=function(a){this.b=a};fa.prototype.getBandwidthEstimate=function(){return 128E3>this.a?this.b:Math.min(ea(this.c),ea(this.f))};function ga(){};function t(a,b,c,d){this.severity=a;this.category=b;this.code=c;this.data=Array.prototype.slice.call(arguments,3)}n("shaka.util.Error",t);t.prototype.toString=function(){return"shaka.util.Error "+JSON.stringify(this,null,"  ")};t.Severity={RECOVERABLE:1,CRITICAL:2};t.Category={NETWORK:1,TEXT:2,MEDIA:3,MANIFEST:4,STREAMING:5,DRM:6,PLAYER:7,CAST:8,STORAGE:9};
t.Code={UNSUPPORTED_SCHEME:1E3,BAD_HTTP_STATUS:1001,HTTP_ERROR:1002,TIMEOUT:1003,MALFORMED_DATA_URI:1004,UNKNOWN_DATA_URI_ENCODING:1005,REQUEST_FILTER_ERROR:1006,RESPONSE_FILTER_ERROR:1007,INVALID_TEXT_HEADER:2E3,INVALID_TEXT_CUE:2001,UNABLE_TO_DETECT_ENCODING:2003,BAD_ENCODING:2004,INVALID_XML:2005,INVALID_MP4_TTML:2007,INVALID_MP4_VTT:2008,BUFFER_READ_OUT_OF_BOUNDS:3E3,JS_INTEGER_OVERFLOW:3001,EBML_OVERFLOW:3002,EBML_BAD_FLOATING_POINT_SIZE:3003,MP4_SIDX_WRONG_BOX_TYPE:3004,MP4_SIDX_INVALID_TIMESCALE:3005,
MP4_SIDX_TYPE_NOT_SUPPORTED:3006,WEBM_CUES_ELEMENT_MISSING:3007,WEBM_EBML_HEADER_ELEMENT_MISSING:3008,WEBM_SEGMENT_ELEMENT_MISSING:3009,WEBM_INFO_ELEMENT_MISSING:3010,WEBM_DURATION_ELEMENT_MISSING:3011,WEBM_CUE_TRACK_POSITIONS_ELEMENT_MISSING:3012,WEBM_CUE_TIME_ELEMENT_MISSING:3013,MEDIA_SOURCE_OPERATION_FAILED:3014,MEDIA_SOURCE_OPERATION_THREW:3015,VIDEO_ERROR:3016,QUOTA_EXCEEDED_ERROR:3017,UNABLE_TO_GUESS_MANIFEST_TYPE:4E3,DASH_INVALID_XML:4001,DASH_NO_SEGMENT_INFO:4002,DASH_EMPTY_ADAPTATION_SET:4003,
DASH_EMPTY_PERIOD:4004,DASH_WEBM_MISSING_INIT:4005,DASH_UNSUPPORTED_CONTAINER:4006,DASH_PSSH_BAD_ENCODING:4007,DASH_NO_COMMON_KEY_SYSTEM:4008,DASH_MULTIPLE_KEY_IDS_NOT_SUPPORTED:4009,DASH_CONFLICTING_KEY_IDS:4010,UNPLAYABLE_PERIOD:4011,RESTRICTIONS_CANNOT_BE_MET:4012,NO_PERIODS:4014,HLS_PLAYLIST_HEADER_MISSING:4015,INVALID_HLS_TAG:4016,HLS_INVALID_PLAYLIST_HIERARCHY:4017,DASH_DUPLICATE_REPRESENTATION_ID:4018,HLS_MULTIPLE_MEDIA_INIT_SECTIONS_FOUND:4020,HLS_COULD_NOT_GUESS_MIME_TYPE:4021,HLS_MASTER_PLAYLIST_NOT_PROVIDED:4022,
HLS_REQUIRED_ATTRIBUTE_MISSING:4023,HLS_REQUIRED_TAG_MISSING:4024,HLS_COULD_NOT_GUESS_CODECS:4025,HLS_KEYFORMATS_NOT_SUPPORTED:4026,INVALID_STREAMS_CHOSEN:5005,NO_RECOGNIZED_KEY_SYSTEMS:6E3,REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE:6001,FAILED_TO_CREATE_CDM:6002,FAILED_TO_ATTACH_TO_VIDEO:6003,INVALID_SERVER_CERTIFICATE:6004,FAILED_TO_CREATE_SESSION:6005,FAILED_TO_GENERATE_LICENSE_REQUEST:6006,LICENSE_REQUEST_FAILED:6007,LICENSE_RESPONSE_REJECTED:6008,ENCRYPTED_CONTENT_WITHOUT_DRM_INFO:6010,NO_LICENSE_SERVER_GIVEN:6012,
OFFLINE_SESSION_REMOVED:6013,EXPIRED:6014,LOAD_INTERRUPTED:7E3,CAST_API_UNAVAILABLE:8E3,NO_CAST_RECEIVERS:8001,ALREADY_CASTING:8002,UNEXPECTED_CAST_ERROR:8003,CAST_CANCELED_BY_USER:8004,CAST_CONNECTION_TIMED_OUT:8005,CAST_RECEIVER_APP_UNAVAILABLE:8006,STORAGE_NOT_SUPPORTED:9E3,INDEXED_DB_ERROR:9001,OPERATION_ABORTED:9002,REQUESTED_ITEM_NOT_FOUND:9003,MALFORMED_OFFLINE_URI:9004,CANNOT_STORE_LIVE_OFFLINE:9005,STORE_ALREADY_IN_PROGRESS:9006,NO_INIT_DATA_FOR_OFFLINE:9007,LOCAL_PLAYER_INSTANCE_REQUIRED:9008};var ha=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;function ia(a){var b;a instanceof ia?(ja(this,a.aa),this.Ba=a.Ba,this.ca=a.ca,ka(this,a.Ja),this.W=a.W,la(this,ma(a.a)),this.ta=a.ta):a&&(b=String(a).match(ha))?(ja(this,b[1]||"",!0),this.Ba=na(b[2]||""),this.ca=na(b[3]||"",!0),ka(this,b[4]),this.W=na(b[5]||"",!0),la(this,b[6]||"",!0),this.ta=na(b[7]||"")):this.a=new oa(null)}k=ia.prototype;k.aa="";k.Ba="";k.ca="";k.Ja=null;k.W="";k.ta="";
k.toString=function(){var a=[],b=this.aa;b&&a.push(qa(b,ra,!0),":");if(b=this.ca){a.push("//");var c=this.Ba;c&&a.push(qa(c,ra,!0),"@");a.push(encodeURIComponent(b).replace(/%25([0-9a-fA-F]{2})/g,"%$1"));b=this.Ja;null!=b&&a.push(":",String(b))}if(b=this.W)this.ca&&"/"!=b.charAt(0)&&a.push("/"),a.push(qa(b,"/"==b.charAt(0)?sa:ta,!0));(b=this.a.toString())&&a.push("?",b);(b=this.ta)&&a.push("#",qa(b,ua));return a.join("")};
k.resolve=function(a){var b=new ia(this);"data"===b.aa&&(b=new ia);var c=!!a.aa;c?ja(b,a.aa):c=!!a.Ba;c?b.Ba=a.Ba:c=!!a.ca;c?b.ca=a.ca:c=null!=a.Ja;var d=a.W;if(c)ka(b,a.Ja);else if(c=!!a.W){if("/"!=d.charAt(0))if(this.ca&&!this.W)d="/"+d;else{var e=b.W.lastIndexOf("/");-1!=e&&(d=b.W.substr(0,e+1)+d)}if(".."==d||"."==d)d="";else if(-1!=d.indexOf("./")||-1!=d.indexOf("/.")){for(var e=!d.lastIndexOf("/",0),d=d.split("/"),f=[],g=0;g<d.length;){var h=d[g++];"."==h?e&&g==d.length&&f.push(""):".."==h?((1<
f.length||1==f.length&&""!=f[0])&&f.pop(),e&&g==d.length&&f.push("")):(f.push(h),e=!0)}d=f.join("/")}}c?b.W=d:c=""!==a.a.toString();c?la(b,ma(a.a)):c=!!a.ta;c&&(b.ta=a.ta);return b};function ja(a,b,c){a.aa=c?na(b,!0):b;a.aa&&(a.aa=a.aa.replace(/:$/,""))}function ka(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.Ja=b}else a.Ja=null}function la(a,b,c){b instanceof oa?a.a=b:(c||(b=qa(b,va)),a.a=new oa(b))}
function na(a,b){return a?b?decodeURI(a):decodeURIComponent(a):""}function qa(a,b,c){return"string"==typeof a?(a=encodeURI(a).replace(b,wa),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function wa(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var ra=/[#\/\?@]/g,ta=/[\#\?:]/g,sa=/[\#\?]/g,va=/[\#\?@]/g,ua=/#/g;function oa(a){this.b=a||null}oa.prototype.a=null;oa.prototype.c=null;
oa.prototype.toString=function(){if(this.b)return this.b;if(!this.a)return"";var a=[],b;for(b in this.a)for(var c=encodeURIComponent(b),d=this.a[b],e=0;e<d.length;e++){var f=c;""!==d[e]&&(f+="="+encodeURIComponent(d[e]));a.push(f)}return this.b=a.join("&")};function ma(a){var b=new oa;b.b=a.b;if(a.a){var c={},d;for(d in a.a)c[d]=a.a[d].concat();b.a=c;b.c=a.c}return b};function xa(a,b){return a.reduce(function(a,b,e){return b["catch"](a.bind(null,e))}.bind(null,b),Promise.reject())}function x(a,b){return a.concat(b)}function y(){}function ya(a){return null!=a}function za(a){return function(b){return b!=a}}function Aa(a,b,c){return c.indexOf(a)==b};function z(a,b){if(!b.length)return a;var c=b.map(function(a){return new ia(a)});return a.map(function(a){return new ia(a)}).map(function(a){return c.map(a.resolve.bind(a))}).reduce(x,[]).map(function(a){return a.toString()})}function Ba(a,b){return{keySystem:a,licenseServerUri:"",distinctiveIdentifierRequired:!1,persistentStateRequired:!1,audioRobustness:"",videoRobustness:"",serverCertificate:null,initData:b||[],keyIds:[]}};function Ca(a,b,c,d,e){var f=e in d,g;for(g in b){var h=e+"."+g,l=f?d[e]:c[g],m=!!{".abr.manager":!0}[h]||!!{serverCertificate:!0}[g];if(f||g in a)void 0===b[g]?void 0===l||f?delete a[g]:a[g]=l:m?a[g]=b[g]:"object"==typeof a[g]&&"object"==typeof b[g]?Ca(a[g],b[g],l,d,h):typeof b[g]==typeof l&&(a[g]=b[g])}}function Da(a){return JSON.parse(JSON.stringify(a))};function A(){var a,b,c=new Promise(function(c,e){a=c;b=e});c.resolve=a;c.reject=b;return c};function B(a){this.f=!1;this.a=[];this.b=[];this.c=[];this.h=a||null}n("shaka.net.NetworkingEngine",B);B.RequestType={MANIFEST:0,SEGMENT:1,LICENSE:2,APP:3};var Ea={};B.registerScheme=function(a,b){Ea[a]=b};B.unregisterScheme=function(a){delete Ea[a]};B.prototype.Ld=function(a){this.b.push(a)};B.prototype.registerRequestFilter=B.prototype.Ld;B.prototype.oe=function(a){var b=this.b;a=b.indexOf(a);0<=a&&b.splice(a,1)};B.prototype.unregisterRequestFilter=B.prototype.oe;
B.prototype.Ic=function(){this.b=[]};B.prototype.clearAllRequestFilters=B.prototype.Ic;B.prototype.Md=function(a){this.c.push(a)};B.prototype.registerResponseFilter=B.prototype.Md;B.prototype.pe=function(a){var b=this.c;a=b.indexOf(a);0<=a&&b.splice(a,1)};B.prototype.unregisterResponseFilter=B.prototype.pe;B.prototype.Jc=function(){this.c=[]};B.prototype.clearAllResponseFilters=B.prototype.Jc;function Fa(){return{maxAttempts:2,baseDelay:1E3,backoffFactor:2,fuzzFactor:.5,timeout:0}}
function C(a,b){return{uris:a,method:"GET",body:null,headers:{},allowCrossSiteCredentials:!1,retryParameters:b}}B.prototype.m=function(){this.f=!0;this.b=[];this.c=[];for(var a=[],b=0;b<this.a.length;++b)a.push(this.a[b]["catch"](y));return Promise.all(a)};B.prototype.destroy=B.prototype.m;
B.prototype.request=function(a,b){if(this.f)return Promise.reject();b.method=b.method||"GET";b.headers=b.headers||{};b.retryParameters=b.retryParameters?Da(b.retryParameters):Fa();b.uris=Da(b.uris);var c=Date.now(),d=Promise.resolve();this.b.forEach(function(c){d=d.then(c.bind(null,a,b))});d=d["catch"](function(a){throw new t(2,1,1006,a);});d=d.then(function(){for(var d=Date.now()-c,f=b.retryParameters||{},g=f.maxAttempts||1,h=f.backoffFactor||2,f=null==f.baseDelay?1E3:f.baseDelay,l=this.g(a,b,0,
d),m=1;m<g;m++)l=l["catch"](function(c,e,f){if(f&&1==f.severity){f=new A;var g=b.retryParameters||{};window.setTimeout(f.resolve,c*(1+(2*Math.random()-1)*(null==g.fuzzFactor?.5:g.fuzzFactor)));return f.then(this.g.bind(this,a,b,e,d))}throw f;}.bind(this,f,m%b.uris.length)),f*=h;return l}.bind(this));this.a.push(d);return d.then(function(b){0<=this.a.indexOf(d)&&this.a.splice(this.a.indexOf(d),1);this.h&&!b.fromCache&&1==a&&this.h(b.timeMs,b.data.byteLength);return b}.bind(this))["catch"](function(a){a&&
(a.severity=2);0<=this.a.indexOf(d)&&this.a.splice(this.a.indexOf(d),1);return Promise.reject(a)}.bind(this))};B.prototype.request=B.prototype.request;
B.prototype.g=function(a,b,c,d){if(this.f)return Promise.reject();var e=new ia(b.uris[c]),f=e.aa;f||(f=location.protocol,f=f.slice(0,-1),ja(e,f),b.uris[c]=e.toString());f=Ea[f];if(!f)return Promise.reject(new t(2,1,1E3,e));var g=Date.now();return f(b.uris[c],b,a).then(function(b){void 0==b.timeMs&&(b.timeMs=Date.now()-g);var c=Date.now(),e=Promise.resolve();this.c.forEach(function(c){e=e.then(function(){return Promise.resolve(c(a,b))}.bind(this))});e=e["catch"](function(a){var b=2;a instanceof t&&
(b=a.severity);throw new t(b,1,1007,a);});return e.then(function(){b.timeMs+=Date.now()-c;b.timeMs+=d;return b})}.bind(this))};function Ga(a,b){for(var c=[],d=0;d<a.length;++d){for(var e=!1,f=0;f<c.length&&!(e=b?b(a[d],c[f]):a[d]===c[f]);++f);e||c.push(a[d])}return c}function Ha(a,b,c){for(var d=0;d<a.length;++d)if(c(a[d],b))return d;return-1};function Ia(){this.a={}}Ia.prototype.push=function(a,b){this.a.hasOwnProperty(a)?this.a[a].push(b):this.a[a]=[b]};Ia.prototype.get=function(a){return(a=this.a[a])?a.slice():null};Ia.prototype.remove=function(a,b){var c=this.a[a];if(c)for(var d=0;d<c.length;++d)c[d]==b&&(c.splice(d,1),--d)};function D(){this.a=new Ia}D.prototype.m=function(){Ja(this);this.a=null;return Promise.resolve()};function E(a,b,c,d){a.a&&(b=new Ka(b,c,d),a.a.push(c,b))}function La(a,b,c,d){E(a,b,c,function(a){this.ha(b,c);d(a)}.bind(a))}D.prototype.ha=function(a,b){if(this.a)for(var c=this.a.get(b)||[],d=0;d<c.length;++d){var e=c[d];e.target==a&&(e.ha(),this.a.remove(b,e))}};function Ja(a){if(a.a){var b=a.a,c=[],d;for(d in b.a)c.push.apply(c,b.a[d]);for(b=0;b<c.length;++b)c[b].ha();a.a.a={}}}
function Ka(a,b,c){this.target=a;this.type=b;this.a=c;this.target.addEventListener(b,c,!1)}Ka.prototype.ha=function(){this.target.removeEventListener(this.type,this.a,!1);this.a=this.target=null};function Ma(a){return!a||!Object.keys(a).length}function Na(a){return Object.keys(a).map(function(b){return a[b]})}function Oa(a,b){return Object.keys(a).reduce(function(c,d){c[d]=b(a[d],d);return c},{})}function Pa(a,b){return Object.keys(a).every(function(c){return b(c,a[c])})}function Qa(a,b){Object.keys(a).forEach(function(c){b(c,a[c])})};function F(a){if(!a)return"";a=new Uint8Array(a);239==a[0]&&187==a[1]&&191==a[2]&&(a=a.subarray(3));a=escape(Ra(a));try{return decodeURIComponent(a)}catch(b){throw new t(2,2,2004);}}n("shaka.util.StringUtils.fromUTF8",F);
function Sa(a,b,c){if(!a)return"";if(!c&&a.byteLength%2)throw new t(2,2,2004);if(a instanceof ArrayBuffer)var d=a;else c=new Uint8Array(a.byteLength),c.set(new Uint8Array(a)),d=c.buffer;a=Math.floor(a.byteLength/2);c=new Uint16Array(a);d=new DataView(d);for(var e=0;e<a;e++)c[e]=d.getUint16(2*e,b);return Ra(c)}n("shaka.util.StringUtils.fromUTF16",Sa);
function Ta(a){var b=new Uint8Array(a);if(239==b[0]&&187==b[1]&&191==b[2])return F(b);if(254==b[0]&&255==b[1])return Sa(b.subarray(2),!1);if(255==b[0]&&254==b[1])return Sa(b.subarray(2),!0);var c=function(a,b){return a.byteLength<=b||32<=a[b]&&126>=a[b]}.bind(null,b);if(b[0]||b[2]){if(!b[1]&&!b[3])return Sa(a,!0);if(c(0)&&c(1)&&c(2)&&c(3))return F(a)}else return Sa(a,!1);throw new t(2,2,2003);}n("shaka.util.StringUtils.fromBytesAutoDetect",Ta);
function Ua(a){a=unescape(encodeURIComponent(a));for(var b=new Uint8Array(a.length),c=0;c<a.length;++c)b[c]=a.charCodeAt(c);return b.buffer}n("shaka.util.StringUtils.toUTF8",Ua);function Ra(a){for(var b="",c=0;c<a.length;c+=16E3)b+=String.fromCharCode.apply(null,a.subarray(c,c+16E3));return b};function Va(a){this.a=null;this.b=function(){this.a=null;a()}.bind(this)}Va.prototype.cancel=function(){null!=this.a&&(clearTimeout(this.a),this.a=null)};function Wa(a){a.cancel();a.a=setTimeout(a.b,500)};function Xa(a,b){var c=void 0==b?!0:b,d=window.btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,"-").replace(/\//g,"_");return c?d:d.replace(/=*$/,"")}n("shaka.util.Uint8ArrayUtils.toBase64",Xa);function Ya(a){a=window.atob(a.replace(/-/g,"+").replace(/_/g,"/"));for(var b=new Uint8Array(a.length),c=0;c<a.length;++c)b[c]=a.charCodeAt(c);return b}n("shaka.util.Uint8ArrayUtils.fromBase64",Ya);
function Za(a){for(var b=new Uint8Array(a.length/2),c=0;c<a.length;c+=2)b[c/2]=window.parseInt(a.substr(c,2),16);return b}n("shaka.util.Uint8ArrayUtils.fromHex",Za);function $a(a){for(var b="",c=0;c<a.length;++c){var d=a[c].toString(16);1==d.length&&(d="0"+d);b+=d}return b}n("shaka.util.Uint8ArrayUtils.toHex",$a);function ab(a,b){if(!a&&!b)return!0;if(!a||!b||a.length!=b.length)return!1;for(var c=0;c<a.length;++c)if(a[c]!=b[c])return!1;return!0}n("shaka.util.Uint8ArrayUtils.equal",ab);
n("shaka.util.Uint8ArrayUtils.concat",function(a){for(var b=0,c=0;c<arguments.length;++c)b+=arguments[c].length;for(var b=new Uint8Array(b),d=0,c=0;c<arguments.length;++c)b.set(arguments[c],d),d+=arguments[c].length;return b});function bb(a,b,c,d){this.j=this.i=this.v=null;this.J=!1;this.b=null;this.f=new D;this.a=[];this.o=[];this.l=new A;this.ka=a;this.h=null;this.g=function(a){this.l.reject(a);b(a)}.bind(this);this.A={};this.Ca=c;this.la=d;this.B=new Va(this.Kd.bind(this));this.ja=this.c=!1;this.G=[];this.ia=!1;this.O=setInterval(this.Jd.bind(this),1E3);this.l["catch"](function(){})}k=bb.prototype;
k.m=function(){this.c=!0;var a=this.a.map(function(a){return(a.ba.close()||Promise.resolve())["catch"](y)});this.l.reject();this.f&&a.push(this.f.m());this.j&&a.push(this.j.setMediaKeys(null)["catch"](y));this.O&&(clearInterval(this.O),this.O=null);this.B&&this.B.cancel();this.f=this.j=this.i=this.v=this.b=this.B=null;this.a=[];this.o=[];this.la=this.g=this.h=this.ka=null;return Promise.all(a)};k.configure=function(a){this.h=a};
k.init=function(a,b){var c={},d=[];this.ja=b;this.o=a.offlineSessionIds;cb(this,a,b||0<a.offlineSessionIds.length,c,d);return d.length?db(this,c,d):(this.J=!0,Promise.resolve())};
function eb(a,b){if(!a.i)return La(a.f,b,"encrypted",function(){this.g(new t(2,6,6010))}.bind(a)),Promise.resolve();a.j=b;La(a.f,a.j,"play",a.qd.bind(a));var c=a.j.setMediaKeys(a.i),c=c["catch"](function(a){return Promise.reject(new t(2,6,6003,a.message))}),d=null;a.b.serverCertificate&&(d=a.i.setServerCertificate(a.b.serverCertificate).then(function(){})["catch"](function(a){return Promise.reject(new t(2,6,6004,a.message))}));return Promise.all([c,d]).then(function(){if(this.c)return Promise.reject();
fb(this);this.b.initData.length||this.o.length||E(this.f,this.j,"encrypted",this.fd.bind(this))}.bind(a))["catch"](function(a){return this.c?Promise.resolve():Promise.reject(a)}.bind(a))}function gb(a,b){return Promise.all(b.map(function(a){return hb(this,a).then(function(a){if(a){for(var b=new A,c=0;c<this.a.length;c++)if(this.a[c].ba==a){this.a[c].ib=b;break}return Promise.all([a.remove(),b])}}.bind(this))}.bind(a)))}
function fb(a){var b=a.b?a.b.initData:[];b.forEach(function(a){ib(this,a.initDataType,a.initData)}.bind(a));a.o.forEach(function(a){hb(this,a)}.bind(a));b.length||a.o.length||a.l.resolve();return a.l}k.keySystem=function(){return this.b?this.b.keySystem:""};function jb(a){return a.a.map(function(a){return a.ba.sessionId})}k.ab=function(){var a=this.a.map(function(a){a=a.ba.expiration;return isNaN(a)?Infinity:a});return Math.min.apply(Math,a)};
function cb(a,b,c,d,e){var f=kb(a);b.periods.forEach(function(a){a.variants.forEach(function(a){f&&(a.drmInfos=[f]);a.drmInfos.forEach(function(b){lb(this,b);window.cast&&window.cast.__platform__&&"com.microsoft.playready"==b.keySystem&&(b.keySystem="com.chromecast.playready");var f=d[b.keySystem];f||(f={audioCapabilities:[],videoCapabilities:[],distinctiveIdentifier:"optional",persistentState:c?"required":"optional",sessionTypes:[c?"persistent-license":"temporary"],label:b.keySystem,drmInfos:[]},
d[b.keySystem]=f,e.push(b.keySystem));f.drmInfos.push(b);b.distinctiveIdentifierRequired&&(f.distinctiveIdentifier="required");b.persistentStateRequired&&(f.persistentState="required");var g=[];a.video&&g.push(a.video);a.audio&&g.push(a.audio);g.forEach(function(a){var c="video"==a.type?f.videoCapabilities:f.audioCapabilities,d=("video"==a.type?b.videoRobustness:b.audioRobustness)||"",e=a.mimeType;a.codecs&&(e+='; codecs="'+a.codecs+'"');c.push({robustness:d,contentType:e})}.bind(this))}.bind(this))}.bind(this))}.bind(a))}
function db(a,b,c){if(1==c.length&&""==c[0])return Promise.reject(new t(2,6,6E3));var d=new A,e=d;[!0,!1].forEach(function(a){c.forEach(function(c){var d=b[c];d.drmInfos.some(function(a){return!!a.licenseServerUri})==a&&(d.audioCapabilities.length||delete d.audioCapabilities,d.videoCapabilities.length||delete d.videoCapabilities,e=e["catch"](function(){return this.c?Promise.reject():navigator.requestMediaKeySystemAccess(c,[d])}.bind(this)))}.bind(this))}.bind(a));e=e["catch"](function(){return Promise.reject(new t(2,
6,6001))});e=e.then(function(a){if(this.c)return Promise.reject();var c=0<=navigator.userAgent.indexOf("Edge/"),d=a.getConfiguration();this.v=(d.audioCapabilities||[]).concat(d.videoCapabilities||[]).map(function(a){return a.contentType});c&&(this.v=null);c=b[a.keySystem];mb(this,a.keySystem,c,c.drmInfos);return this.b.licenseServerUri?a.createMediaKeys():Promise.reject(new t(2,6,6012))}.bind(a)).then(function(a){if(this.c)return Promise.reject();this.i=a;this.J=!0}.bind(a))["catch"](function(a){if(this.c)return Promise.resolve();
this.v=this.b=null;return a instanceof t?Promise.reject(a):Promise.reject(new t(2,6,6002,a.message))}.bind(a));d.reject();return e}
function lb(a,b){var c=b.keySystem;if(c){if(!b.licenseServerUri){var d=a.h.servers[c];d&&(b.licenseServerUri=d)}b.keyIds||(b.keyIds=[]);if(c=a.h.advanced[c])b.distinctiveIdentifierRequired||(b.distinctiveIdentifierRequired=c.distinctiveIdentifierRequired),b.persistentStateRequired||(b.persistentStateRequired=c.persistentStateRequired),b.videoRobustness||(b.videoRobustness=c.videoRobustness),b.audioRobustness||(b.audioRobustness=c.audioRobustness),b.serverCertificate||(b.serverCertificate=c.serverCertificate)}}
function kb(a){if(Ma(a.h.clearKeys))return null;var b=[],c=[],d;for(d in a.h.clearKeys){var e=a.h.clearKeys[d],f=Za(d),e=Za(e),f={kty:"oct",kid:Xa(f,!1),k:Xa(e,!1)};b.push(f);c.push(f.kid)}a=JSON.stringify({keys:b});c=JSON.stringify({kids:c});c=[{initData:new Uint8Array(Ua(c)),initDataType:"keyids"}];return{keySystem:"org.w3.clearkey",licenseServerUri:"data:application/json;base64,"+window.btoa(a),distinctiveIdentifierRequired:!1,persistentStateRequired:!1,audioRobustness:"",videoRobustness:"",serverCertificate:null,
initData:c,keyIds:[]}}function mb(a,b,c,d){var e=[],f=[],g=[],h=[];nb(d,e,f,g,h);a.b={keySystem:b,licenseServerUri:e[0],distinctiveIdentifierRequired:"required"==c.distinctiveIdentifier,persistentStateRequired:"required"==c.persistentState,audioRobustness:c.audioCapabilities?c.audioCapabilities[0].robustness:"",videoRobustness:c.videoCapabilities?c.videoCapabilities[0].robustness:"",serverCertificate:f[0],initData:g,keyIds:h}}
function nb(a,b,c,d,e){function f(a,b){return a.keyId&&a.keyId==b.keyId?!0:a.initDataType==b.initDataType&&ab(a.initData,b.initData)}a.forEach(function(a){-1==b.indexOf(a.licenseServerUri)&&b.push(a.licenseServerUri);a.serverCertificate&&-1==Ha(c,a.serverCertificate,ab)&&c.push(a.serverCertificate);a.initData&&a.initData.forEach(function(a){-1==Ha(d,a,f)&&d.push(a)});if(a.keyIds)for(var g=0;g<a.keyIds.length;++g)-1==e.indexOf(a.keyIds[g])&&e.push(a.keyIds[g])})}
k.fd=function(a){for(var b=new Uint8Array(a.initData),c=0;c<this.a.length;++c)if(ab(b,this.a[c].initData))return;ib(this,a.initDataType,b)};
function hb(a,b){try{var c=a.i.createSession("persistent-license")}catch(f){var d=new t(2,6,6005,f.message);a.g(d);return Promise.reject(d)}E(a.f,c,"message",a.kc.bind(a));E(a.f,c,"keystatuseschange",a.ec.bind(a));var e={initData:null,ba:c,loaded:!1,zb:Infinity,ib:null};a.a.push(e);return c.load(b).then(function(a){if(!this.c){if(a)return e.loaded=!0,this.a.every(function(a){return a.loaded})&&this.l.resolve(),c;this.a.splice(this.a.indexOf(e),1);this.g(new t(2,6,6013))}}.bind(a),function(a){this.c||
(this.a.splice(this.a.indexOf(e),1),this.g(new t(2,6,6005,a.message)))}.bind(a))}
function ib(a,b,c){try{var d=a.ja?a.i.createSession("persistent-license"):a.i.createSession()}catch(e){a.g(new t(2,6,6005,e.message));return}E(a.f,d,"message",a.kc.bind(a));E(a.f,d,"keystatuseschange",a.ec.bind(a));a.a.push({initData:c,ba:d,loaded:!1,zb:Infinity,ib:null});d.generateRequest(b,c.buffer)["catch"](function(a){if(!this.c){for(var b=0;b<this.a.length;++b)if(this.a[b].ba==d){this.a.splice(b,1);break}this.g(new t(2,6,6006,a.message))}}.bind(a))}
k.kc=function(a){this.h.delayLicenseRequestUntilPlayed&&this.j.paused&&!this.ia?this.G.push(a):ob(this,a)};
function ob(a,b){for(var c=b.target,d,e=0;e<a.a.length;e++)if(a.a[e].ba==c){d=a.a[e].ib;break}e=C([a.b.licenseServerUri],a.h.retryParameters);e.body=b.message;e.method="POST";"com.microsoft.playready"!=a.b.keySystem&&"com.chromecast.playready"!=a.b.keySystem||pb(e);a.ka.request(2,e).then(function(a){return this.c?Promise.reject():c.update(a.data).then(function(){d&&d.resolve()})}.bind(a),function(a){if(this.c)return Promise.resolve();a=new t(2,6,6007,a);this.g(a);d&&d.reject(a)}.bind(a))["catch"](function(a){if(this.c)return Promise.resolve();
a=new t(2,6,6008,a.message);this.g(a);d&&d.reject(a)}.bind(a))}function pb(a){var b=Sa(a.body,!0,!0);if(-1==b.indexOf("PlayReadyKeyMessage"))a.headers["Content-Type"]="text/xml; charset=utf-8";else{for(var b=(new DOMParser).parseFromString(b,"application/xml"),c=b.getElementsByTagName("HttpHeader"),d=0;d<c.length;++d)a.headers[c[d].querySelector("name").textContent]=c[d].querySelector("value").textContent;a.body=Ya(b.querySelector("Challenge").textContent).buffer}}
k.ec=function(a){a=a.target;var b;for(b=0;b<this.a.length&&this.a[b].ba!=a;++b);if(b!=this.a.length){var c=!1;a.keyStatuses.forEach(function(a,d){if("string"==typeof d){var e=d;d=a;a=e}if("com.microsoft.playready"==this.b.keySystem&&16==d.byteLength){var e=new DataView(d),f=e.getUint32(0,!0),l=e.getUint16(4,!0),m=e.getUint16(6,!0);e.setUint32(0,f,!1);e.setUint16(4,l,!1);e.setUint16(6,m,!1)}"com.microsoft.playready"==this.b.keySystem&&"status-pending"==a&&(a="usable");"status-pending"!=a&&(this.a[b].loaded=
!0,this.a.every(function(a){return a.loaded})&&this.l.resolve());"expired"==a&&(c=!0);e=$a(new Uint8Array(d));this.A[e]=a}.bind(this));var d=a.expiration-Date.now();(0>d||c&&1E3>d)&&!this.a[b].ib&&(this.a.splice(b,1),a.close());Wa(this.B)}};k.Kd=function(){function a(a,c){return"expired"==c}!Ma(this.A)&&Pa(this.A,a)&&this.g(new t(2,6,6014));this.Ca(this.A)};
function qb(){var a=[],b=[{contentType:'video/mp4; codecs="avc1.42E01E"'},{contentType:'video/webm; codecs="vp8"'}],c=[{videoCapabilities:b,persistentState:"required",sessionTypes:["persistent-license"]},{videoCapabilities:b}],d={};"org.w3.clearkey com.widevine.alpha com.microsoft.playready com.apple.fps.2_0 com.apple.fps.1_0 com.apple.fps com.adobe.primetime".split(" ").forEach(function(b){var e=navigator.requestMediaKeySystemAccess(b,c).then(function(a){var c=a.getConfiguration().sessionTypes;d[b]=
{persistentState:c?0<=c.indexOf("persistent-license"):!1};return a.createMediaKeys()})["catch"](function(){d[b]=null});a.push(e)});return Promise.all(a).then(function(){return d})}k.qd=function(){for(var a=0;a<this.G.length;a++)ob(this,this.G[a]);this.ia=!0;this.G=[]};function rb(a,b){var c=a.keySystem();return!b.drmInfos.length||b.drmInfos.some(function(a){return a.keySystem==c})}
function sb(a,b){if(!a.length)return b;if(!b.length)return a;for(var c=[],d=0;d<a.length;d++)for(var e=0;e<b.length;e++)if(a[d].keySystem==b[e].keySystem){var f=a[d],e=b[e],g=[],g=g.concat(f.initData||[]),g=g.concat(e.initData||[]),h=[],h=h.concat(f.keyIds),h=h.concat(e.keyIds);c.push({keySystem:f.keySystem,licenseServerUri:f.licenseServerUri||e.licenseServerUri,distinctiveIdentifierRequired:f.distinctiveIdentifierRequired||e.distinctiveIdentifierRequired,persistentStateRequired:f.persistentStateRequired||
e.persistentStateRequired,videoRobustness:f.videoRobustness||e.videoRobustness,audioRobustness:f.audioRobustness||e.audioRobustness,serverCertificate:f.serverCertificate||e.serverCertificate,initData:g,keyIds:h});break}return c}k.Jd=function(){this.a.forEach(function(a){var b=a.zb,c=a.ba.expiration;isNaN(c)&&(c=Infinity);c!=b&&(this.la(a.ba.sessionId,c),a.zb=c)}.bind(this))};function tb(a){this.f=null;this.c=a;this.h=0;this.g=Infinity;this.a=this.b=null}var ub={};function vb(a,b){ub[a]=b.length?wb.bind(null,b):b}n("shaka.media.TextEngine.registerParser",vb);n("shaka.media.TextEngine.unregisterParser",function(a){delete ub[a]});function xb(a,b,c){return a>=b?null:new VTTCue(a,b,c)}n("shaka.media.TextEngine.makeCue",xb);tb.prototype.m=function(){this.c&&yb(this,function(){return!0});this.c=this.f=null;return Promise.resolve()};
function zb(a,b,c,d){return Promise.resolve().then(function(){if(this.c)if(null==c||null==d)this.f.parseInit(b);else{for(var a=this.f.parseMedia(b,{periodStart:this.h,segmentStart:c,segmentEnd:d}),f=0;f<a.length&&!(a[f].startTime>=this.g);++f)this.c.addCue(a[f]);null==this.b&&(this.b=c);this.a=Math.min(d,this.g)}}.bind(a))}
tb.prototype.remove=function(a,b){return Promise.resolve().then(function(){this.c&&(yb(this,function(c){return c.startTime>=b||c.endTime<=a?!1:!0}),null==this.b||b<=this.b||a>=this.a||(a<=this.b&&b>=this.a?this.b=this.a=null:a<=this.b&&b<this.a?this.b=b:a>this.b&&b>=this.a&&(this.a=a)))}.bind(this))};function yb(a,b){for(var c=a.c.cues,d=[],e=0;e<c.length;++e)b(c[e])&&d.push(c[e]);for(e=0;e<d.length;++e)a.c.removeCue(d[e])}function wb(a){this.Na=a}
wb.prototype.parseInit=function(a){this.Na(a,0,null,null)};wb.prototype.parseMedia=function(a,b){return this.Na(a,b.periodStart,b.segmentStart,b.segmentEnd)};function Ab(a){return!a||1==a.length&&1E-6>a.end(0)-a.start(0)?null:a.length?a.end(a.length-1):null}function Bb(a,b){return!a||!a.length||1==a.length&&1E-6>a.end(0)-a.start(0)?!1:b>=a.start(0)&&b<=a.end(a.length-1)}function Cb(a,b){if(!a||!a.length||1==a.length&&1E-6>a.end(0)-a.start(0))return 0;for(var c=0,d=a.length-1;0<=d&&a.end(d)>b;--d)c+=a.end(d)-Math.max(a.start(d),b);return c};function Db(a,b,c){this.f=a;this.N=b;this.i=c;this.c={};this.a=null;this.b={};this.g=new D;this.h=!1}
function Eb(){var a={};'video/mp4; codecs="avc1.42E01E",video/mp4; codecs="avc3.42E01E",video/mp4; codecs="hvc1.1.6.L93.90",audio/mp4; codecs="mp4a.40.2",audio/mp4; codecs="ac-3",audio/mp4; codecs="ec-3",video/webm; codecs="vp8",video/webm; codecs="vp9",video/webm; codecs="av1",audio/webm; codecs="vorbis",audio/webm; codecs="opus",video/mp2t; codecs="avc1.42E01E",video/mp2t; codecs="avc3.42E01E",video/mp2t; codecs="hvc1.1.6.L93.90",video/mp2t; codecs="mp4a.40.2",video/mp2t; codecs="ac-3",video/mp2t; codecs="ec-3",video/mp2t; codecs="mp4a.40.2",text/vtt,application/mp4; codecs="wvtt",application/ttml+xml,application/mp4; codecs="stpp"'.split(",").forEach(function(b){a[b]=!!ub[b]||
MediaSource.isTypeSupported(b);var c=b.split(";")[0];a[c]=a[c]||a[b]});return a}k=Db.prototype;k.m=function(){this.h=!0;var a=[],b;for(b in this.b){var c=this.b[b],d=c[0];this.b[b]=c.slice(0,1);d&&a.push(d.p["catch"](y));for(d=1;d<c.length;++d)c[d].p["catch"](y),c[d].p.reject()}this.a&&a.push(this.a.m());return Promise.all(a).then(function(){this.g.m();this.a=this.i=this.N=this.f=this.g=null;this.c={};this.b={}}.bind(this))};
k.init=function(a){for(var b in a){var c=a[b];"text"==b?Fb(this,c):(c=this.N.addSourceBuffer(c),E(this.g,c,"error",this.je.bind(this,b)),E(this.g,c,"updateend",this.Ia.bind(this,b)),this.c[b]=c,this.b[b]=[])}};function Fb(a,b){a.a||(a.a=new tb(a.i));a.a.f=new ub[b]}function Gb(a,b){if("text"==b)var c=a.a.b;else c=Ib(a,b),c=!c||1==c.length&&1E-6>c.end(0)-c.start(0)?null:1==c.length&&0>c.start(0)?0:c.length?c.start(0):null;return c}function Ib(a,b){try{return a.c[b].buffered}catch(c){return null}}
function Jb(a,b,c,d,e){return"text"==b?zb(a.a,c,d,e):Kb(a,b,a.ie.bind(a,b,c))}k.remove=function(a,b,c){return"text"==a?this.a.remove(b,c):Kb(this,a,this.qc.bind(this,a,b,c))};function Lb(a,b){return"text"==b?a.a.remove(0,Infinity):Kb(a,b,a.qc.bind(a,b,0,a.N.duration))}function Mb(a,b,c,d){if("text"==b)return a.a.h=c,null!=d&&(a.a.g=d),Promise.resolve();null==d&&(d=Infinity);return Promise.all([Kb(a,b,a.Ec.bind(a,b)),Kb(a,b,a.Zd.bind(a,b,c)),Kb(a,b,a.Xd.bind(a,b,d))])}
k.endOfStream=function(a){return Nb(this,function(){a?this.N.endOfStream(a):this.N.endOfStream()}.bind(this))};k.pa=function(a){return Nb(this,function(){this.N.duration=a}.bind(this))};k.Y=function(){return this.N.duration};k.ie=function(a,b){this.c[a].appendBuffer(b)};k.qc=function(a,b,c){c<=b?this.Ia(a):this.c[a].remove(b,c)};k.Ec=function(a){var b=this.c[a].appendWindowEnd;this.c[a].abort();this.c[a].appendWindowEnd=b;this.Ia(a)};k.Oc=function(a){this.f.currentTime-=.001;this.Ia(a)};
k.Zd=function(a,b){this.c[a].timestampOffset=b;this.Ia(a)};k.Xd=function(a,b){this.c[a].appendWindowEnd=b+.04;this.Ia(a)};k.je=function(a){this.b[a][0].p.reject(new t(2,3,3014,this.f.error?this.f.error.code:0))};k.Ia=function(a){var b=this.b[a][0];b&&(b.p.resolve(),Ob(this,a))};
function Kb(a,b,c){if(a.h)return Promise.reject();c={start:c,p:new A};a.b[b].push(c);if(1==a.b[b].length)try{c.start()}catch(d){"QuotaExceededError"==d.name?c.p.reject(new t(2,3,3017,b)):c.p.reject(new t(2,3,3015,d)),Ob(a,b)}return c.p}
function Nb(a,b){if(a.h)return Promise.reject();var c=[],d;for(d in a.c){var e=new A,f={start:function(a){a.resolve()}.bind(null,e),p:e};a.b[d].push(f);c.push(e);1==a.b[d].length&&f.start()}return Promise.all(c).then(function(){var a;try{b()}catch(l){var c=Promise.reject(new t(2,3,3015,l))}for(a in this.c)Ob(this,a);return c}.bind(a),function(){return Promise.reject()}.bind(a))}function Ob(a,b){a.b[b].shift();var c=a.b[b][0];if(c)try{c.start()}catch(d){c.p.reject(new t(2,3,3015,d)),Ob(a,b)}};function Pb(a,b,c){return c==b||a>=Qb&&c==b.split("-")[0]||a>=Rb&&c.split("-")[0]==b.split("-")[0]?!0:!1}var Qb=1,Rb=2;function Sb(a){a=a.toLowerCase().split("-");var b=Tb[a[0]];b&&(a[0]=b);return a.join("-")}
var Tb={aar:"aa",abk:"ab",afr:"af",aka:"ak",alb:"sq",amh:"am",ara:"ar",arg:"an",arm:"hy",asm:"as",ava:"av",ave:"ae",aym:"ay",aze:"az",bak:"ba",bam:"bm",baq:"eu",bel:"be",ben:"bn",bih:"bh",bis:"bi",bod:"bo",bos:"bs",bre:"br",bul:"bg",bur:"my",cat:"ca",ces:"cs",cha:"ch",che:"ce",chi:"zh",chu:"cu",chv:"cv",cor:"kw",cos:"co",cre:"cr",cym:"cy",cze:"cs",dan:"da",deu:"de",div:"dv",dut:"nl",dzo:"dz",ell:"el",eng:"en",epo:"eo",est:"et",eus:"eu",ewe:"ee",fao:"fo",fas:"fa",fij:"fj",fin:"fi",fra:"fr",fre:"fr",
fry:"fy",ful:"ff",geo:"ka",ger:"de",gla:"gd",gle:"ga",glg:"gl",glv:"gv",gre:"el",grn:"gn",guj:"gu",hat:"ht",hau:"ha",heb:"he",her:"hz",hin:"hi",hmo:"ho",hrv:"hr",hun:"hu",hye:"hy",ibo:"ig",ice:"is",ido:"io",iii:"ii",iku:"iu",ile:"ie",ina:"ia",ind:"id",ipk:"ik",isl:"is",ita:"it",jav:"jv",jpn:"ja",kal:"kl",kan:"kn",kas:"ks",kat:"ka",kau:"kr",kaz:"kk",khm:"km",kik:"ki",kin:"rw",kir:"ky",kom:"kv",kon:"kg",kor:"ko",kua:"kj",kur:"ku",lao:"lo",lat:"la",lav:"lv",lim:"li",lin:"ln",lit:"lt",ltz:"lb",lub:"lu",
lug:"lg",mac:"mk",mah:"mh",mal:"ml",mao:"mi",mar:"mr",may:"ms",mkd:"mk",mlg:"mg",mlt:"mt",mon:"mn",mri:"mi",msa:"ms",mya:"my",nau:"na",nav:"nv",nbl:"nr",nde:"nd",ndo:"ng",nep:"ne",nld:"nl",nno:"nn",nob:"nb",nor:"no",nya:"ny",oci:"oc",oji:"oj",ori:"or",orm:"om",oss:"os",pan:"pa",per:"fa",pli:"pi",pol:"pl",por:"pt",pus:"ps",que:"qu",roh:"rm",ron:"ro",rum:"ro",run:"rn",rus:"ru",sag:"sg",san:"sa",sin:"si",slk:"sk",slo:"sk",slv:"sl",sme:"se",smo:"sm",sna:"sn",snd:"sd",som:"so",sot:"st",spa:"es",sqi:"sq",
srd:"sc",srp:"sr",ssw:"ss",sun:"su",swa:"sw",swe:"sv",tah:"ty",tam:"ta",tat:"tt",tel:"te",tgk:"tg",tgl:"tl",tha:"th",tib:"bo",tir:"ti",ton:"to",tsn:"tn",tso:"ts",tuk:"tk",tur:"tr",twi:"tw",uig:"ug",ukr:"uk",urd:"ur",uzb:"uz",ven:"ve",vie:"vi",vol:"vo",wel:"cy",wln:"wa",wol:"wo",xho:"xh",yid:"yi",yor:"yo",zha:"za",zho:"zh",zul:"zu"};function Ub(a,b,c){var d=a.video;return d&&(d.width<b.minWidth||d.width>b.maxWidth||d.width>c.width||d.height<b.minHeight||d.height>b.maxHeight||d.height>c.height||d.width*d.height<b.minPixels||d.width*d.height>b.maxPixels)||a.bandwidth<b.minBandwidth||a.bandwidth>b.maxBandwidth?!1:!0}function Vb(a,b,c){var d=!1;a.variants.forEach(function(a){var e=a.allowedByApplication;a.allowedByApplication=Ub(a,b,c);e!=a.allowedByApplication&&(d=!0)});return d}
function Wb(a,b,c){var d=b.video,e=b.audio;for(b=0;b<c.variants.length;++b){var f=c.variants[b],g=a,h=e,l=d;(g&&g.J&&!rb(g,f)?0:Xb(f.audio,g,h)&&Xb(f.video,g,l))||(c.variants.splice(b,1),--b)}for(b=0;b<c.textStreams.length;++b)a=c.textStreams[b],ub[Yb(a.mimeType,a.codecs)]||(c.textStreams.splice(b,1),--b)}
function Xb(a,b,c){if(!a)return!0;var d=null;b&&b.J&&(d=b.v);b=Yb(a.mimeType,a.codecs);return!ub[b]&&!MediaSource.isTypeSupported(b)||d&&a.encrypted&&0>d.indexOf(b)||c&&(a.mimeType!=c.mimeType||a.codecs.split(".")[0]!=c.codecs.split(".")[0])?!1:!0}
function Zb(a,b,c){var d=null;return $b(a.variants).map(function(a){var e;a.video&&a.audio?e=c==a.video.id&&b==a.audio.id:e=a.video&&c==a.video.id||a.audio&&b==a.audio.id;var g="";a.video&&(g+=a.video.codecs);a.audio&&(""!=g&&(g+=", "),g+=a.audio.codecs,d=a.audio.label);var h=a.audio?a.audio.codecs:null,l=a.video?a.video.codecs:null,m=null;a.video?m=a.video.mimeType:a.audio&&(m=a.audio.mimeType);var q=null;a.audio?q=a.audio.kind:a.video&&(q=a.video.kind);var r=Ga((a.audio?a.audio.roles:[]).concat(a.video?
a.video.roles:[]));return{id:a.id,active:e,type:"variant",bandwidth:a.bandwidth,language:a.language,label:d,kind:q||null,width:a.video?a.video.width:null,height:a.video?a.video.height:null,frameRate:a.video?a.video.frameRate:void 0,mimeType:m,codecs:g,audioCodec:h,videoCodec:l,primary:a.primary,roles:r,videoId:a.video?a.video.id:null,audioId:a.audio?a.audio.id:null}})}
function ac(a,b){return a.textStreams.map(function(a){return{id:a.id,active:b==a.id,type:"text",language:a.language,label:a.label,kind:a.kind,mimeType:a.mimeType,codecs:a.codecs||null,audioCodec:null,videoCodec:null,primary:a.primary,roles:a.roles}})}function bc(a,b){for(var c=0;c<a.variants.length;c++)if(a.variants[c].id==b.id)return a.variants[c];return null}function cc(a,b){for(var c=0;c<a.textStreams.length;c++)if(a.textStreams[c].id==b.id)return a.textStreams[c];return null}
function $b(a){return a.filter(function(a){return a.allowedByApplication&&a.allowedByKeySystem})}
function dc(a,b,c,d){var e=$b(a.variants),f=e.filter(function(a){return a.language==e[0].language});a=e.filter(function(a){return a.primary});a.length&&(f=a);if(b){var g=Sb(b);[Rb,Qb,0].forEach(function(a){var b=!1;e.forEach(function(d){g=Sb(g);var e=Sb(d.language);Pb(a,g,e)&&(b?f.push(d):(f=[d],b=!0),c&&(c.audio=!0))})})}var h=d||"";return h&&(b=f.filter(function(a){return a.audio&&-1<a.audio.roles.indexOf(h)||a.video&&-1<a.video.roles.indexOf(h)}),b.length)?b:f}
function ec(a,b,c,d){var e=a.textStreams,f=e;a=e.filter(function(a){return a.primary});a.length&&(f=a);if(b){var g=Sb(b);[Rb,Qb,0].forEach(function(a){var b=!1;e.forEach(function(d){var e=Sb(d.language);Pb(a,g,e)&&(b?f.push(d):(f=[d],b=!0),c&&(c.text=!0))})})}var h=d||"";return h&&(b=f.filter(function(a){return a&&-1<a.roles.indexOf(h)}),b.length)?b:f}function fc(a,b,c){for(var d=0;d<c.length;d++)if(c[d].audio==a&&c[d].video==b)return c[d];return null}
function gc(a,b,c){function d(a,b){return null==a?null==b:b.id==a}for(var e=0;e<c.length;e++)if(d(a,c[e].audio)&&d(b,c[e].video))return c[e];return null}function Yb(a,b){var c=a;b&&(c+='; codecs="'+b+'"');return c}function hc(a,b){for(var c=a.periods.length-1;0<c;--c)if(b>=a.periods[c].startTime)return c;return 0}
function ic(a,b){for(var c=0;c<a.periods.length;++c){var d=a.periods[c];if("text"==b.type)for(var e=0;e<d.textStreams.length;++e){if(d.textStreams[e]==b)return c}else for(e=0;e<d.variants.length;++e){var f=d.variants[e];if(f.audio==b||f.video==b||f.video&&f.video.trickModeVideo==b)return c}}return-1};function H(){this.f=null;this.b=!1;this.a=new fa;this.h=[];this.g=[];this.j=!1;this.c=null;this.i={minWidth:0,maxWidth:Infinity,minHeight:0,maxHeight:Infinity,minPixels:0,maxPixels:Infinity,minBandwidth:0,maxBandwidth:Infinity}}n("shaka.abr.SimpleAbrManager",H);H.prototype.stop=function(){this.f=null;this.b=!1;this.h=[];this.g=[];this.c=null};H.prototype.stop=H.prototype.stop;H.prototype.init=function(a){this.f=a};H.prototype.init=H.prototype.init;
H.prototype.chooseStreams=function(a){var b={};if(-1<a.indexOf("audio")||-1<a.indexOf("video")){var c=this.h;var d=jc(this.i,c);var e=this.a.getBandwidthEstimate();if(c.length&&!d.length)throw new t(2,4,4012);for(var c=d[0],f=0;f<d.length;++f){var g=d[f],h=(d[f+1]||{bandwidth:Infinity}).bandwidth/.85;e>=g.bandwidth/.95&&e<=h&&(c=g)}(d=c)&&d.video&&(b.video=d.video);d&&d.audio&&(b.audio=d.audio)}-1<a.indexOf("text")&&(b.text=this.g[0]);this.c=Date.now();return b};H.prototype.chooseStreams=H.prototype.chooseStreams;
H.prototype.enable=function(){this.b=!0};H.prototype.enable=H.prototype.enable;H.prototype.disable=function(){this.b=!1};H.prototype.disable=H.prototype.disable;H.prototype.segmentDownloaded=function(a,b){var c=this.a;if(!(16E3>b)){var d=8E3*b/a,e=a/1E3;c.a+=b;da(c.c,e,d);da(c.f,e,d)}if(null!=this.c&&this.b)a:{if(!this.j){if(!(128E3<=this.a.a))break a;this.j=!0}else if(8E3>Date.now()-this.c)break a;c=this.chooseStreams(["audio","video"]);this.a.getBandwidthEstimate();this.f(c)}};
H.prototype.segmentDownloaded=H.prototype.segmentDownloaded;H.prototype.getBandwidthEstimate=function(){return this.a.getBandwidthEstimate()};H.prototype.getBandwidthEstimate=H.prototype.getBandwidthEstimate;H.prototype.setDefaultEstimate=function(a){this.a.setDefaultEstimate(a)};H.prototype.setDefaultEstimate=H.prototype.setDefaultEstimate;H.prototype.setRestrictions=function(a){this.i=a};H.prototype.setRestrictions=H.prototype.setRestrictions;H.prototype.setVariants=function(a){this.h=a};
H.prototype.setVariants=H.prototype.setVariants;H.prototype.setTextStreams=function(a){this.g=a};H.prototype.setTextStreams=H.prototype.setTextStreams;function jc(a,b){return b.filter(function(b){return Ub(b,a,{width:Infinity,height:Infinity})}).sort(function(a,b){return a.bandwidth-b.bandwidth})};function I(a,b){var c=b||{},d;for(d in c)this[d]=c[d];this.defaultPrevented=this.cancelable=this.bubbles=!1;this.timeStamp=window.performance&&window.performance.now?window.performance.now():Date.now();this.type=a;this.isTrusted=!1;this.target=this.currentTarget=null;this.a=!1}I.prototype.preventDefault=function(){this.cancelable&&(this.defaultPrevented=!0)};I.prototype.stopImmediatePropagation=function(){this.a=!0};I.prototype.stopPropagation=function(){};var kc="ended play playing pause pausing ratechange seeked seeking timeupdate volumechange".split(" "),lc="buffered currentTime duration ended loop muted paused playbackRate seeking videoHeight videoWidth volume".split(" "),mc=["loop","playbackRate"],nc=["pause","play"],oc="adaptation buffering emsg error loading unloading texttrackvisibility timelineregionadded timelineregionenter timelineregionexit trackschanged".split(" "),pc="drmInfo getAudioLanguages getConfiguration getExpiration getManifestUri getPlaybackRate getPlayheadTimeAsDate getTextLanguages getTextTracks getTracks getStats getVariantTracks isBuffering isInProgress isLive isTextTrackVisible keySystem seekRange".split(" "),
qc=[["getConfiguration","configure"]],rc=[["isTextTrackVisible","setTextTrackVisibility"]],sc="addTextTrack cancelTrickPlay configure resetConfiguration selectAudioLanguage selectTextLanguage selectTextTrack selectTrack selectVariantTrack setTextTrackVisibility trickPlay".split(" "),uc=["load","unload"];
function vc(a){return JSON.stringify(a,function(a,c){if("manager"!=a&&"function"!=typeof c){if(c instanceof Event||c instanceof I){var b={},e;for(e in c){var f=c[e];f&&"object"==typeof f||e in Event||(b[e]=f)}return b}if(c instanceof TimeRanges)for(b={__type__:"TimeRanges",length:c.length,start:[],end:[]},e=0;e<c.length;++e)b.start.push(c.start(e)),b.end.push(c.end(e));else b="number"==typeof c?isNaN(c)?"NaN":isFinite(c)?c:0>c?"-Infinity":"Infinity":c;return b}})}
function wc(a){return JSON.parse(a,function(a,c){return"NaN"==c?NaN:"-Infinity"==c?-Infinity:"Infinity"==c?Infinity:c&&"object"==typeof c&&"TimeRanges"==c.__type__?xc(c):c})}function xc(a){return{length:a.length,start:function(b){return a.start[b]},end:function(b){return a.end[b]}}};function yc(a,b,c,d,e){this.J=a;this.l=b;this.B=c;this.G=d;this.v=e;this.c=this.j=this.h=!1;this.A="";this.a=this.i=null;this.b={video:{},player:{}};this.o=0;this.f={};this.g=null}k=yc.prototype;k.m=function(){zc(this);this.a&&(this.a.leave(function(){},function(){}),this.a=null);this.G=this.B=this.l=null;this.c=this.j=this.h=!1;this.g=this.f=this.b=this.i=null;return Promise.resolve()};k.V=function(){return this.c};k.Fb=function(){return this.A};
k.init=function(){if(window.chrome&&chrome.cast&&chrome.cast.isAvailable){delete window.__onGCastApiAvailable;this.h=!0;this.l();var a=new chrome.cast.SessionRequest(this.J),a=new chrome.cast.ApiConfig(a,this.gd.bind(this),this.sd.bind(this),"origin_scoped");chrome.cast.initialize(a,function(){},function(){})}else window.__onGCastApiAvailable=function(a){a&&this.init()}.bind(this)};k.Ib=function(a){this.i=a;this.c&&Ac(this,{type:"appData",appData:this.i})};
k.cast=function(a){if(!this.h)return Promise.reject(new t(1,8,8E3));if(!this.j)return Promise.reject(new t(1,8,8001));if(this.c)return Promise.reject(new t(1,8,8002));this.g=new A;chrome.cast.requestSession(this.Bb.bind(this,a),this.cc.bind(this));return this.g};k.$a=function(){this.c&&(zc(this),this.a&&(this.a.stop(function(){},function(){}),this.a=null))};
k.get=function(a,b){if("video"==a){if(0<=nc.indexOf(b))return this.pc.bind(this,a,b)}else if("player"==a){if(0<=sc.indexOf(b))return this.pc.bind(this,a,b);if(0<=uc.indexOf(b))return this.Od.bind(this,a,b);if(0<=pc.indexOf(b))return this.lc.bind(this,a,b)}return this.lc(a,b)};k.set=function(a,b,c){this.b[a][b]=c;Ac(this,{type:"set",targetName:a,property:b,value:c})};
k.Bb=function(a,b){this.a=b;this.a.addUpdateListener(this.dc.bind(this));this.a.addMessageListener("urn:x-cast:com.google.shaka.v2",this.md.bind(this));this.dc();Ac(this,{type:"init",initState:a,appData:this.i});this.g.resolve()};k.cc=function(a){var b=8003;switch(a.code){case "cancel":b=8004;break;case "timeout":b=8005;break;case "receiver_unavailable":b=8006}this.g.reject(new t(2,8,b,a))};k.lc=function(a,b){return this.b[a][b]};
k.pc=function(a,b){Ac(this,{type:"call",targetName:a,methodName:b,args:Array.prototype.slice.call(arguments,2)})};k.Od=function(a,b){var c=Array.prototype.slice.call(arguments,2),d=new A,e=this.o.toString();this.o++;this.f[e]=d;Ac(this,{type:"asyncCall",targetName:a,methodName:b,args:c,id:e});return d};k.gd=function(a){var b=this.v();this.g=new A;this.Bb(b,a)};k.sd=function(a){this.j="available"==a;this.l()};
k.dc=function(){var a=this.a?"connected"==this.a.status:!1;if(this.c&&!a){this.G();for(var b in this.b)this.b[b]={};zc(this)}this.A=(this.c=a)?this.a.receiver.friendlyName:"";this.l()};function zc(a){for(var b in a.f){var c=a.f[b];delete a.f[b];c.reject(new t(1,7,7E3))}}
k.md=function(a,b){var c=wc(b);switch(c.type){case "event":var d=c.targetName,e=c.event;this.B(d,new I(e.type,e));break;case "update":e=c.update;for(d in e){var c=this.b[d]||{};for(f in e[d])c[f]=e[d][f]}break;case "asyncComplete":d=c.id;var f=c.error;c=this.f[d];delete this.f[d];if(c)if(f){d=new t(f.severity,f.category,f.code);for(e in f)d[e]=f[e];c.reject(d)}else c.resolve()}};function Ac(a,b){var c=vc(b);a.a.sendMessage("urn:x-cast:com.google.shaka.v2",c,function(){},ga)};function p(){this.nb=new Ia;this.Ta=this}p.prototype.addEventListener=function(a,b){this.nb.push(a,b)};p.prototype.removeEventListener=function(a,b){this.nb.remove(a,b)};p.prototype.dispatchEvent=function(a){for(var b=this.nb.get(a.type)||[],c=0;c<b.length;++c){a.target=this.Ta;a.currentTarget=this.Ta;var d=b[c];try{d.handleEvent?d.handleEvent(a):d.call(this,a)}catch(e){}if(a.a)break}return a.defaultPrevented};function J(a,b,c){p.call(this);this.c=a;this.b=b;this.h=this.f=this.g=this.i=this.j=null;this.a=new yc(c,this.ee.bind(this),this.fe.bind(this),this.ge.bind(this),this.Vb.bind(this));Bc(this)}ba(J);n("shaka.cast.CastProxy",J);J.prototype.m=function(a){a&&this.a&&this.a.$a();a=[this.h?this.h.m():null,this.b?this.b.m():null,this.a?this.a.m():null];this.a=this.h=this.i=this.j=this.b=this.c=null;return Promise.all(a)};J.prototype.destroy=J.prototype.m;J.prototype.Zc=function(){return this.j};
J.prototype.getVideo=J.prototype.Zc;J.prototype.Tc=function(){return this.i};J.prototype.getPlayer=J.prototype.Tc;J.prototype.Fc=function(){return this.a?this.a.h&&this.a.j:!1};J.prototype.canCast=J.prototype.Fc;J.prototype.V=function(){return this.a?this.a.V():!1};J.prototype.isCasting=J.prototype.V;J.prototype.Fb=function(){return this.a?this.a.Fb():""};J.prototype.receiverName=J.prototype.Fb;J.prototype.cast=function(){var a=this.Vb();return this.a.cast(a).then(function(){return this.b.hb()}.bind(this))};
J.prototype.cast=J.prototype.cast;J.prototype.Ib=function(a){this.a.Ib(a)};J.prototype.setAppData=J.prototype.Ib;J.prototype.me=function(){var a=this.a;if(a.c){var b=a.v();chrome.cast.requestSession(a.Bb.bind(a,b),a.cc.bind(a))}};J.prototype.suggestDisconnect=J.prototype.me;J.prototype.$a=function(){this.a.$a()};J.prototype.forceDisconnect=J.prototype.$a;
function Bc(a){a.a.init();a.h=new D;kc.forEach(function(a){E(this.h,this.c,a,this.te.bind(this))}.bind(a));oc.forEach(function(a){E(this.h,this.b,a,this.Id.bind(this))}.bind(a));a.j={};for(var b in a.c)Object.defineProperty(a.j,b,{configurable:!1,enumerable:!0,get:a.se.bind(a,b),set:a.ue.bind(a,b)});a.i={};for(b in a.b)Object.defineProperty(a.i,b,{configurable:!1,enumerable:!0,get:a.Hd.bind(a,b)});a.g=new p;a.g.Ta=a.j;a.f=new p;a.f.Ta=a.i}k=J.prototype;
k.Vb=function(){var a={video:{},player:{},playerAfterLoad:{},manifest:this.b.Ya,startTime:null};this.c.pause();mc.forEach(function(b){a.video[b]=this.c[b]}.bind(this));this.c.ended||(a.startTime=this.c.currentTime);qc.forEach(function(b){var c=b[1];b=this.b[b[0]]();a.player[c]=b}.bind(this));rc.forEach(function(b){var c=b[1];b=this.b[b[0]]();a.playerAfterLoad[c]=b}.bind(this));return a};k.ee=function(){this.dispatchEvent(new I("caststatuschanged"))};
k.ge=function(){qc.forEach(function(a){var b=a[1];a=this.a.get("player",a[0])();this.b[b](a)}.bind(this));var a=this.a.get("player","getManifestUri")(),b=this.a.get("video","ended"),c=Promise.resolve(),d=this.c.autoplay,e=null;b||(e=this.a.get("video","currentTime"));a&&(this.c.autoplay=!1,c=this.b.load(a,e),c["catch"](function(a){this.b.dispatchEvent(new I("error",{detail:a}))}.bind(this)));var f={};mc.forEach(function(a){f[a]=this.a.get("video",a)}.bind(this));c.then(function(){mc.forEach(function(a){this.c[a]=
f[a]}.bind(this));rc.forEach(function(a){var b=a[1];a=this.a.get("player",a[0])();this.b[b](a)}.bind(this));this.c.autoplay=d;a&&this.c.play()}.bind(this))};
k.se=function(a){if("addEventListener"==a)return this.g.addEventListener.bind(this.g);if("removeEventListener"==a)return this.g.removeEventListener.bind(this.g);if(this.a.V()&&!Object.keys(this.a.b.video).length){var b=this.c[a];if("function"!=typeof b)return b}return this.a.V()?this.a.get("video",a):(b=this.c[a],"function"==typeof b&&(b=b.bind(this.c)),b)};k.ue=function(a,b){this.a.V()?this.a.set("video",a,b):this.c[a]=b};k.te=function(a){this.a.V()||this.g.dispatchEvent(new I(a.type,a))};
k.Hd=function(a){return"addEventListener"==a?this.f.addEventListener.bind(this.f):"removeEventListener"==a?this.f.removeEventListener.bind(this.f):"getNetworkingEngine"==a?this.b.Wb.bind(this.b):this.a.V()&&!Object.keys(this.a.b.video).length&&0<=pc.indexOf(a)||!this.a.V()?(a=this.b[a],a.bind(this.b)):this.a.get("player",a)};k.Id=function(a){this.a.V()||this.f.dispatchEvent(a)};k.fe=function(a,b){this.a.V()&&("video"==a?this.g.dispatchEvent(b):"player"==a&&this.f.dispatchEvent(b))};function K(a,b,c,d){p.call(this);this.a=a;this.b=b;this.j={video:a,player:b};this.l=c||function(){};this.o=d||function(a){return a};this.i=!1;this.f=!0;this.h=this.g=this.c=null;Cc(this)}ba(K);n("shaka.cast.CastReceiver",K);K.prototype.isConnected=function(){return this.i};K.prototype.isConnected=K.prototype.isConnected;K.prototype.ad=function(){return this.f};K.prototype.isIdle=K.prototype.ad;
K.prototype.m=function(){var a=this.b?this.b.m():Promise.resolve();null!=this.h&&window.clearTimeout(this.h);this.l=this.j=this.b=this.a=null;this.i=!1;this.f=!0;this.h=this.g=this.c=null;return a.then(function(){cast.receiver.CastReceiverManager.getInstance().stop()})};K.prototype.destroy=K.prototype.m;
function Cc(a){var b=cast.receiver.CastReceiverManager.getInstance();b.onSenderConnected=a.jc.bind(a);b.onSenderDisconnected=a.jc.bind(a);b.onSystemVolumeChanged=a.Mc.bind(a);a.g=b.getCastMessageBus("urn:x-cast:com.google.cast.media");a.g.onMessage=a.hd.bind(a);a.c=b.getCastMessageBus("urn:x-cast:com.google.shaka.v2");a.c.onMessage=a.vd.bind(a);b.start();kc.forEach(function(a){this.a.addEventListener(a,this.mc.bind(this,"video"))}.bind(a));oc.forEach(function(a){this.b.addEventListener(a,this.mc.bind(this,
"player"))}.bind(a));cast.__platform__&&cast.__platform__.canDisplayType('video/mp4; codecs="avc1.640028"; width=3840; height=2160')?a.b.Jb(3840,2160):a.b.Jb(1920,1080);a.b.addEventListener("loading",function(){this.f=!1;Dc(this)}.bind(a));a.a.addEventListener("playing",function(){this.f=!1;Dc(this)}.bind(a));a.a.addEventListener("pause",function(){Dc(this)}.bind(a));a.b.addEventListener("unloading",function(){this.f=!0;Dc(this)}.bind(a));a.a.addEventListener("ended",function(){window.setTimeout(function(){this.a&&
this.a.ended&&(this.f=!0,Dc(this))}.bind(this),5E3)}.bind(a))}k=K.prototype;k.jc=function(){this.i=!!cast.receiver.CastReceiverManager.getInstance().getSenders().length;Dc(this)};function Dc(a){Promise.resolve().then(function(){this.dispatchEvent(new I("caststatuschanged"));L(this,0)}.bind(a))}
function Ec(a,b,c){for(var d in b.player)a.b[d](b.player[d]);a.l(c);c=Promise.resolve();var e=a.a.autoplay;b.manifest&&(a.a.autoplay=!1,c=a.b.load(b.manifest,b.startTime),c["catch"](function(a){this.b.dispatchEvent(new I("error",{detail:a}))}.bind(a)));c.then(function(){var a;for(a in b.video){var c=b.video[a];this.a[a]=c}for(a in b.playerAfterLoad)c=b.playerAfterLoad[a],this.b[a](c);this.a.autoplay=e;b.manifest&&(this.a.play(),L(this,0))}.bind(a))}
k.mc=function(a,b){this.Cb();Fc(this,{type:"event",targetName:a,event:b},this.c)};k.Cb=function(){null!=this.h&&window.clearTimeout(this.h);this.h=window.setTimeout(this.Cb.bind(this),500);var a={video:{},player:{}};lc.forEach(function(b){a.video[b]=this.a[b]}.bind(this));pc.forEach(function(b){a.player[b]=this.b[b]()}.bind(this));var b=cast.receiver.CastReceiverManager.getInstance().getSystemVolume();b&&(a.video.volume=b.level,a.video.muted=b.muted);Fc(this,{type:"update",update:a},this.c)};
k.Mc=function(){var a=cast.receiver.CastReceiverManager.getInstance().getSystemVolume();a&&Fc(this,{type:"update",update:{video:{volume:a.level,muted:a.muted}}},this.c);Fc(this,{type:"event",targetName:"video",event:{type:"volumechange"}},this.c)};
k.vd=function(a){var b=wc(a.data);switch(b.type){case "init":Ec(this,b.initState,b.appData);this.Cb();break;case "appData":this.l(b.appData);break;case "set":var c=b.targetName,d=b.property,e=b.value;if("video"==c)if(b=cast.receiver.CastReceiverManager.getInstance(),"volume"==d){b.setSystemVolumeLevel(e);break}else if("muted"==d){b.setSystemVolumeMuted(e);break}this.j[c][d]=e;break;case "call":c=b.targetName;d=b.methodName;e=b.args;c=this.j[c];c[d].apply(c,e);break;case "asyncCall":c=b.targetName,
d=b.methodName,e=b.args,b=b.id,a=a.senderId,c=this.j[c],c[d].apply(c,e).then(this.vc.bind(this,a,b,null),this.vc.bind(this,a,b))}};
k.hd=function(a){var b=wc(a.data);switch(b.type){case "PLAY":this.a.play();L(this,0);break;case "PAUSE":this.a.pause();L(this,0);break;case "SEEK":a=b.currentTime;var c=b.resumeState;null!=a&&(this.a.currentTime=Number(a));c&&"PLAYBACK_START"==c?(this.a.play(),L(this,0)):c&&"PLAYBACK_PAUSE"==c&&(this.a.pause(),L(this,0));break;case "STOP":this.b.hb().then(function(){L(this,0)}.bind(this));break;case "GET_STATUS":L(this,Number(b.requestId));break;case "VOLUME":c=b.volume;a=c.level;var c=c.muted,d=
this.a.volume,e=this.a.muted;null!=a&&(this.a.volume=Number(a));null!=c&&(this.a.muted=c);d==this.a.volume&&e==this.a.muted||L(this,0);break;case "LOAD":c=b.media.contentId;a=b.currentTime;var f=this.o(c);this.a.autoplay=!0;this.b.load(f,a).then(function(){L(this,0,{contentId:f,streamType:this.b.$()?"LIVE":"BUFFERED",contentType:""})}.bind(this))["catch"](function(a){var c="LOAD_FAILED";7==a.category&&7E3==a.code&&(c="LOAD_CANCELLED");Fc(this,{requestId:Number(b.requestId),type:c},this.g)}.bind(this));
break;default:Fc(this,{requestId:Number(b.requestId),type:"INVALID_REQUEST",reason:"INVALID_COMMAND"},this.g)}};k.vc=function(a,b,c){Fc(this,{type:"asyncComplete",id:b,error:c},this.c,a)};function Fc(a,b,c,d){a.i&&(a=vc(b),d?c.getCastChannel(d).send(a):c.broadcast(a))}
function L(a,b,c){var d=Gc,d={mediaSessionId:0,playbackRate:a.a.playbackRate,playerState:a.f?d.IDLE:a.b.ka?d.Ac:a.a.paused?d.Bc:d.Cc,currentTime:a.a.currentTime,supportedMediaCommands:15,volume:{level:a.a.volume,muted:a.a.muted}};c&&(d.media=c);Fc(a,{requestId:b,type:"MEDIA_STATUS",status:[d]},a.g)}var Gc={IDLE:"IDLE",Cc:"PLAYING",Ac:"BUFFERING",Bc:"PAUSED"};function Hc(a,b){var c=M(a,b);return 1!=c.length?null:c[0]}function M(a,b){return Array.prototype.filter.call(a.childNodes,function(a){return a.tagName==b})}function Ic(a){var b=a.firstChild;return b&&b.nodeType==Node.TEXT_NODE?a.textContent.trim():null}function N(a,b,c,d){var e=null;a=a.getAttribute(b);null!=a&&(e=c(a));return null==e?void 0!=d?d:null:e}function Jc(a){if(!a)return null;a=Date.parse(a);return isNaN(a)?null:Math.floor(a/1E3)}
function Kc(a){if(!a)return null;a=/^P(?:([0-9]*)Y)?(?:([0-9]*)M)?(?:([0-9]*)D)?(?:T(?:([0-9]*)H)?(?:([0-9]*)M)?(?:([0-9.]*)S)?)?$/.exec(a);if(!a)return null;a=31536E3*Number(a[1]||null)+2592E3*Number(a[2]||null)+86400*Number(a[3]||null)+3600*Number(a[4]||null)+60*Number(a[5]||null)+Number(a[6]||null);return isFinite(a)?a:null}function Lc(a){var b=/([0-9]+)-([0-9]+)/.exec(a);if(!b)return null;a=Number(b[1]);if(!isFinite(a))return null;b=Number(b[2]);return isFinite(b)?{start:a,end:b}:null}
function Mc(a){a=Number(a);return a%1?null:a}function Nc(a){a=Number(a);return!(a%1)&&0<a?a:null}function Oc(a){a=Number(a);return!(a%1)&&0<=a?a:null}function Pc(a){var b;a=(b=a.match(/^(\d+)\/(\d+)$/))?Number(b[1]/b[2]):Number(a);return isNaN(a)?null:a};var Qc={"urn:uuid:1077efec-c0b2-4d02-ace3-3c1e52e2fb4b":"org.w3.clearkey","urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed":"com.widevine.alpha","urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95":"com.microsoft.playready","urn:uuid:f239e769-efa3-4850-9c16-a903c6932efb":"com.adobe.primetime"};
function Rc(a,b,c){a=Sc(a);var d=null,e=null,f=[],g=[],h=a.map(function(a){return a.keyId}).filter(ya);if(0<h.length&&(e=h[0],h.some(za(e))))throw new t(2,4,4010);c||(g=a.filter(function(a){return"urn:mpeg:dash:mp4protection:2011"==a.sc?(d=a.init||d,!1):!0}),0<g.length&&(f=Tc(d,b,g),f.length||(f=[Ba("",d)])));0<a.length&&(c||!g.length)&&(f=Na(Qc).map(function(a){return Ba(a,d)}));e&&f.forEach(function(a){a.initData.forEach(function(a){a.keyId=e})});return{Sb:e,ze:d,drmInfos:f,Ub:!0}}
function Uc(a,b,c,d){var e=Rc(a,b,d);if(c.Ub){a=1==c.drmInfos.length&&!c.drmInfos[0].keySystem;b=!e.drmInfos.length;if(!c.drmInfos.length||a&&!b)c.drmInfos=e.drmInfos;c.Ub=!1}else if(0<e.drmInfos.length&&(c.drmInfos=c.drmInfos.filter(function(a){return e.drmInfos.some(function(b){return b.keySystem==a.keySystem})}),!c.drmInfos.length))throw new t(2,4,4008);return e.Sb||c.Sb}function Tc(a,b,c){return c.map(function(c){var d=Qc[c.sc];return d?[Ba(d,c.init||a)]:b(c.node)||[]}).reduce(x,[])}
function Sc(a){return a.map(function(a){var b=a.getAttribute("schemeIdUri"),d=a.getAttribute("cenc:default_KID"),e=M(a,"cenc:pssh").map(Ic);if(!b)return null;b=b.toLowerCase();if(d&&(d=d.replace(/-/g,"").toLowerCase(),0<=d.indexOf(" ")))throw new t(2,4,4009);var f=[];try{f=e.map(function(a){return{initDataType:"cenc",initData:Ya(a),keyId:null}})}catch(g){throw new t(2,4,4007);}return{node:a,sc:b,keyId:d,init:0<f.length?f:null}}).filter(ya)};function Vc(a,b,c,d,e){null!=e&&(e=Math.round(e));var f={RepresentationID:b,Number:c,Bandwidth:d,Time:e};return a.replace(/\$(RepresentationID|Number|Bandwidth|Time)?(?:%0([0-9]+)d)?\$/g,function(a,b,c){if("$$"==a)return"$";var d=f[b];if(null==d)return a;"RepresentationID"==b&&c&&(c=void 0);a=d.toString();c=window.parseInt(c,10)||1;return Array(Math.max(0,c-a.length)+1).join("0")+a})}
function Wc(a,b){var c=Xc(a,b,"timescale"),d=1;c&&(d=Nc(c)||1);c=Xc(a,b,"duration");(c=Nc(c||""))&&(c/=d);var e=Xc(a,b,"startNumber"),f=Xc(a,b,"presentationTimeOffset"),g=Oc(e||"");if(null==e||null==g)g=1;var h=Yc(a,b,"SegmentTimeline"),e=null;if(h){for(var e=d,l=Number(f),m=a.R.duration||Infinity,h=M(h,"S"),q=[],r=0,v=0;v<h.length;++v){var u=h[v],w=N(u,"t",Oc),G=N(u,"d",Oc),u=N(u,"r",Mc);null!=w&&(w-=l);if(!G)break;w=null!=w?w:r;u=u||0;if(0>u)if(v+1<h.length){u=N(h[v+1],"t",Oc);if(null==u)break;
else if(w>=u)break;u=Math.ceil((u-w)/G)-1}else{if(Infinity==m)break;else if(w/e>=m)break;u=Math.ceil((m*e-w)/G)-1}0<q.length&&w!=r&&(q[q.length-1].end=w/e);for(var pa=0;pa<=u;++pa)r=w+G,q.push({start:w/e,end:r/e,qe:w}),w=r}e=q}return{timescale:d,P:c,za:g,presentationTimeOffset:Number(f)/d||0,Pb:Number(f),F:e}}function Xc(a,b,c){return[b(a.w),b(a.S),b(a.T)].filter(ya).map(function(a){return a.getAttribute(c)}).reduce(function(a,b){return a||b})}
function Yc(a,b,c){return[b(a.w),b(a.S),b(a.T)].filter(ya).map(function(a){return Hc(a,c)}).reduce(function(a,b){return a||b})};function Zc(a,b,c){this.a=a;this.X=b;this.M=c}n("shaka.media.InitSegmentReference",Zc);function O(a,b,c,d,e,f){this.position=a;this.startTime=b;this.endTime=c;this.a=d;this.X=e;this.M=f}n("shaka.media.SegmentReference",O);function P(a,b){this.H=a;this.a=b==$c;this.u=0}n("shaka.util.DataViewReader",P);var $c=1;P.Endianness={ve:0,xe:$c};P.prototype.Z=function(){return this.u<this.H.byteLength};P.prototype.hasMoreData=P.prototype.Z;P.prototype.Vc=function(){return this.u};P.prototype.getPosition=P.prototype.Vc;P.prototype.Qc=function(){return this.H.byteLength};P.prototype.getLength=P.prototype.Qc;P.prototype.Eb=function(){try{var a=this.H.getUint8(this.u)}catch(b){ad()}this.u+=1;return a};P.prototype.readUint8=P.prototype.Eb;
P.prototype.oc=function(){try{var a=this.H.getUint16(this.u,this.a)}catch(b){ad()}this.u+=2;return a};P.prototype.readUint16=P.prototype.oc;P.prototype.D=function(){try{var a=this.H.getUint32(this.u,this.a)}catch(b){ad()}this.u+=4;return a};P.prototype.readUint32=P.prototype.D;P.prototype.nc=function(){try{var a=this.H.getInt32(this.u,this.a)}catch(b){ad()}this.u+=4;return a};P.prototype.readInt32=P.prototype.nc;
P.prototype.Pa=function(){try{if(this.a){var a=this.H.getUint32(this.u,!0);var b=this.H.getUint32(this.u+4,!0)}else b=this.H.getUint32(this.u,!1),a=this.H.getUint32(this.u+4,!1)}catch(c){ad()}if(2097151<b)throw new t(2,3,3001);this.u+=8;return b*Math.pow(2,32)+a};P.prototype.readUint64=P.prototype.Pa;P.prototype.Ka=function(a){this.u+a>this.H.byteLength&&ad();var b=this.H.buffer.slice(this.u,this.u+a);this.u+=a;return new Uint8Array(b)};P.prototype.readBytes=P.prototype.Ka;
P.prototype.I=function(a){this.u+a>this.H.byteLength&&ad();this.u+=a};P.prototype.skip=P.prototype.I;P.prototype.Db=function(){for(var a=this.u;this.Z()&&this.H.getUint8(this.u);)this.u+=1;a=this.H.buffer.slice(a,this.u);this.u+=1;return F(a)};P.prototype.readTerminatedString=P.prototype.Db;function ad(){throw new t(2,3,3E3);};function Q(){this.b=[];this.a=[]}n("shaka.util.Mp4Parser",Q);Q.prototype.C=function(a,b){var c=bd(a);this.b[c]=0;this.a[c]=b;return this};Q.prototype.box=Q.prototype.C;Q.prototype.da=function(a,b){var c=bd(a);this.b[c]=1;this.a[c]=b;return this};Q.prototype.fullBox=Q.prototype.da;Q.prototype.parse=function(a){for(a=new P(new DataView(a),0);a.Z();)this.eb(0,a)};Q.prototype.parse=Q.prototype.parse;
Q.prototype.eb=function(a,b){var c=b.u,d=b.D(),e=b.D();switch(d){case 0:d=b.H.byteLength-c;break;case 1:d=b.Pa()}var f=this.a[e];if(f){var g=null,h=null;1==this.b[e]&&(h=b.D(),g=h>>>24,h&=16777215);e=c+d-b.u;e=0<e?b.Ka(e).buffer:new ArrayBuffer(0);e=new P(new DataView(e),0);f({Na:this,version:g,Nc:h,s:e,size:d,start:c+a})}else b.I(c+d-b.u)};Q.prototype.parseNext=Q.prototype.eb;function R(a){for(;a.s.Z();)a.Na.eb(a.start,a.s)}Q.children=R;
function cd(a){for(var b=a.s.D();0<b;--b)a.Na.eb(a.start,a.s)}Q.sampleDescription=cd;function dd(a){return function(b){a(b.s.Ka(b.s.H.byteLength-b.s.u))}}Q.allData=dd;function bd(a){for(var b=0,c=0;c<a.length;c++)b=b<<8|a.charCodeAt(c);return b};function ed(a,b,c,d){var e,f=(new Q).da("sidx",function(a){e=fd(b,d,c,a)});a&&f.parse(a);if(e)return e;throw new t(2,3,3004);}
function fd(a,b,c,d){var e=[];d.s.I(4);var f=d.s.D();if(!f)throw new t(2,3,3005);if(d.version){var g=d.s.Pa();var h=d.s.Pa()}else g=d.s.D(),h=d.s.D();d.s.I(2);var l=d.s.oc();b=g-b;a=a+d.size+h;for(h=0;h<l;h++){var m=d.s.D();g=(m&2147483648)>>>31;var m=m&2147483647,q=d.s.D();d.s.I(4);if(1==g)throw new t(2,3,3006);e.push(new O(e.length,b/f,(b+q)/f,function(){return c},a,a+m-1));b+=q;a+=m}return e};function S(a){this.a=a}n("shaka.media.SegmentIndex",S);S.prototype.m=function(){this.a=null;return Promise.resolve()};S.prototype.destroy=S.prototype.m;S.prototype.find=function(a){for(var b=this.a.length-1;0<=b;--b){var c=this.a[b];if(a>=c.startTime&&a<c.endTime)return c.position}return this.a.length&&a<this.a[0].startTime?this.a[0].position:null};S.prototype.find=S.prototype.find;S.prototype.get=function(a){if(!this.a.length)return null;a-=this.a[0].position;return 0>a||a>=this.a.length?null:this.a[a]};
S.prototype.get=S.prototype.get;S.prototype.xb=function(a){for(var b,c,d=[],e=c=0;c<this.a.length&&e<a.length;){var f=this.a[c];b=a[e];f.startTime<b.startTime?(d.push(f),c++):(f.startTime>b.startTime||(.1<Math.abs(f.endTime-b.endTime)?d.push(b):d.push(f),c++),e++)}for(;c<this.a.length;)d.push(this.a[c++]);if(d.length)for(c=d[d.length-1].position+1;e<a.length;)b=a[e++],b=new O(c++,b.startTime,b.endTime,b.a,b.X,b.M),d.push(b);else d=a;this.a=d};S.prototype.merge=S.prototype.xb;
S.prototype.qb=function(a){for(var b=0;b<this.a.length&&!(this.a[b].endTime>a);++b);this.a.splice(0,b)};S.prototype.evict=S.prototype.qb;function gd(a,b){if(a.a.length){var c=a.a[a.a.length-1];c.startTime>b||(a.a[a.a.length-1]=new O(c.position,c.startTime,b,c.a,c.X,c.M))}};function hd(a){this.b=a;this.a=new P(a,0);id||(id=[new Uint8Array([255]),new Uint8Array([127,255]),new Uint8Array([63,255,255]),new Uint8Array([31,255,255,255]),new Uint8Array([15,255,255,255,255]),new Uint8Array([7,255,255,255,255,255]),new Uint8Array([3,255,255,255,255,255,255]),new Uint8Array([1,255,255,255,255,255,255,255])])}var id;hd.prototype.Z=function(){return this.a.Z()};
function jd(a){var b=kd(a);if(7<b.length)throw new t(2,3,3002);for(var c=0,d=0;d<b.length;d++)c=256*c+b[d];b=c;c=kd(a);a:{for(d=0;d<id.length;d++)if(ab(c,id[d])){d=!0;break a}d=!1}if(d)c=a.b.byteLength-a.a.u;else{if(8==c.length&&c[1]&224)throw new t(2,3,3001);for(var d=c[0]&(1<<8-c.length)-1,e=1;e<c.length;e++)d=256*d+c[e];c=d}c=a.a.u+c<=a.b.byteLength?c:a.b.byteLength-a.a.u;d=new DataView(a.b.buffer,a.b.byteOffset+a.a.u,c);a.a.I(c);return new ld(b,d)}
function kd(a){var b=a.a.Eb(),c;for(c=1;8>=c&&!(b&1<<8-c);c++);if(8<c)throw new t(2,3,3002);var d=new Uint8Array(c);d[0]=b;for(b=1;b<c;b++)d[b]=a.a.Eb();return d}function ld(a,b){this.id=a;this.a=b}function md(a){if(8<a.a.byteLength)throw new t(2,3,3002);if(8==a.a.byteLength&&a.a.getUint8(0)&224)throw new t(2,3,3001);for(var b=0,c=0;c<a.a.byteLength;c++)var d=a.a.getUint8(c),b=256*b+d;return b};function nd(){}
nd.prototype.parse=function(a,b,c,d){var e;b=new hd(new DataView(b));if(440786851!=jd(b).id)throw new t(2,3,3008);var f=jd(b);if(408125543!=f.id)throw new t(2,3,3009);b=f.a.byteOffset;f=new hd(f.a);for(e=null;f.Z();){var g=jd(f);if(357149030==g.id){e=g;break}}if(!e)throw new t(2,3,3010);f=new hd(e.a);e=1E6;for(g=null;f.Z();){var h=jd(f);if(2807729==h.id)e=md(h);else if(17545==h.id)if(g=h,4==g.a.byteLength)g=g.a.getFloat32(0);else if(8==g.a.byteLength)g=g.a.getFloat64(0);else throw new t(2,3,3003);
}if(null==g)throw new t(2,3,3011);f=e/1E9;e=g*f;a=jd(new hd(new DataView(a)));if(475249515!=a.id)throw new t(2,3,3007);return od(a,b,f,e,c,d)};function od(a,b,c,d,e,f){function g(){return e}var h=[];a=new hd(a.a);for(var l=-1,m=-1;a.Z();){var q=jd(a);if(187==q.id){var r=pd(q);r&&(q=c*(r.re-f),r=b+r.Nd,0<=l&&h.push(new O(h.length,l,q,g,m,r-1)),l=q,m=r)}}0<=l&&h.push(new O(h.length,l,d,g,m,null));return h}
function pd(a){var b=new hd(a.a);a=jd(b);if(179!=a.id)throw new t(2,3,3013);a=md(a);b=jd(b);if(183!=b.id)throw new t(2,3,3012);for(var b=new hd(b.a),c=0;b.Z();){var d=jd(b);if(241==d.id){c=md(d);break}}return{re:a,Nd:c}};function qd(a,b){var c=Yc(a,b,"Initialization");if(!c)return null;var d=a.w.U,e=c.getAttribute("sourceURL");e&&(d=z(a.w.U,[e]));var e=0,f=null;if(c=N(c,"range",Lc))e=c.start,f=c.end;return new Zc(function(){return d},e,f)}
function rd(a,b){var c=Xc(a,sd,"presentationTimeOffset"),d=qd(a,sd);var e=Number(c);var f=a.w.contentType,g=a.w.mimeType.split("/")[1];if("text"!=f&&"mp4"!=g&&"webm"!=g)throw new t(2,4,4006);if("webm"==g&&!d)throw new t(2,4,4005);var f=Yc(a,sd,"RepresentationIndex"),h=Xc(a,sd,"indexRange"),l=a.w.U,h=Lc(h||"");if(f){var m=f.getAttribute("sourceURL");m&&(l=z(a.w.U,[m]));h=N(f,"range",Lc,h)}if(!h)throw new t(2,4,4002);e=td(a,b,d,l,h.start,h.end,g,e);return{createSegmentIndex:e.createSegmentIndex,findSegmentPosition:e.findSegmentPosition,
getSegmentReference:e.getSegmentReference,initSegmentReference:d,presentationTimeOffset:Number(c)||0}}
function td(a,b,c,d,e,f,g,h){var l=a.presentationTimeline,m=!a.Da||!a.R.ub,q=a.R.duration,r=b,v=null;return{createSegmentIndex:function(){var a=[r(d,e,f),"webm"==g?r(c.a(),c.X,c.M):null];r=null;return Promise.all(a).then(function(a){var b=a[0];a=a[1]||null;b="mp4"==g?ed(b,e,d,h):(new nd).parse(b,a,d,h);l.Ha(0,b);v=new S(b);m&&gd(v,q)})},findSegmentPosition:function(a){return v.find(a)},getSegmentReference:function(a){return v.get(a)}}}function sd(a){return a.Qa};function ud(a,b){var c=qd(a,vd);var d=wd(a);var e=Wc(a,vd),f=e.za;f||(f=1);var g=0;e.P?g=e.P*(f-1):e.F&&0<e.F.length&&(g=e.F[0].start);d={P:e.P,startTime:g,za:f,presentationTimeOffset:e.presentationTimeOffset,F:e.F,Ga:d};if(!d.P&&!d.F&&1<d.Ga.length)throw new t(2,4,4002);if(!d.P&&!a.R.duration&&!d.F&&1==d.Ga.length)throw new t(2,4,4002);if(d.F&&!d.F.length)throw new t(2,4,4002);f=e=null;a.T.id&&a.w.id&&(f=a.T.id+","+a.w.id,e=b[f]);g=xd(a.R.duration,d.za,a.w.U,d);e?(e.xb(g),e.qb(a.presentationTimeline.ma()-
a.R.start)):(a.presentationTimeline.Ha(0,g),e=new S(g),f&&a.Da&&(b[f]=e));a.Da&&a.R.ub||gd(e,a.R.duration);return{createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:e.find.bind(e),getSegmentReference:e.get.bind(e),initSegmentReference:c,presentationTimeOffset:d.presentationTimeOffset}}function vd(a){return a.oa}
function xd(a,b,c,d){var e=d.Ga.length;d.F&&d.F.length!=d.Ga.length&&(e=Math.min(d.F.length,d.Ga.length));for(var f=[],g=d.startTime,h=0;h<e;h++){var l=d.Ga[h],m=z(c,[l.cd]);var q=null!=d.P?g+d.P:d.F?d.F[h].end:g+a;f.push(new O(h+b,g,q,function(a){return a}.bind(null,m),l.start,l.end));g=q}return f}
function wd(a){return[a.w.oa,a.S.oa,a.T.oa].filter(ya).map(function(a){return M(a,"SegmentURL")}).reduce(function(a,c){return 0<a.length?a:c}).map(function(b){b.getAttribute("indexRange")&&!a.$b&&(a.$b=!0);var c=b.getAttribute("media");b=N(b,"mediaRange",Lc,{start:0,end:null});return{cd:c,start:b.start,end:b.end}})};function yd(a,b,c,d){var e=zd(a);var f=Wc(a,Ad);var g=Xc(a,Ad,"media"),h=Xc(a,Ad,"index");f={P:f.P,timescale:f.timescale,za:f.za,presentationTimeOffset:f.presentationTimeOffset,Pb:f.Pb,F:f.F,wb:g,Ma:h};g=0+(f.Ma?1:0);g+=f.F?1:0;g+=f.P?1:0;if(!g)throw new t(2,4,4002);1!=g&&(f.Ma&&(f.F=null),f.P=null);if(!f.Ma&&!f.wb)throw new t(2,4,4002);if(f.Ma){c=a.w.mimeType.split("/")[1];if("mp4"!=c&&"webm"!=c)throw new t(2,4,4006);if("webm"==c&&!e)throw new t(2,4,4005);d=Vc(f.Ma,a.w.id,null,a.bandwidth||null,
null);d=z(a.w.U,[d]);a=td(a,b,e,d,0,null,c,f.presentationTimeOffset)}else f.P?(d||a.presentationTimeline.yb(f.P),a=Bd(a,f)):(d=b=null,a.T.id&&a.w.id&&(d=a.T.id+","+a.w.id,b=c[d]),g=Cd(a,f),b?(b.xb(g),b.qb(a.presentationTimeline.ma()-a.R.start)):(a.presentationTimeline.Ha(0,g),b=new S(g),d&&a.Da&&(c[d]=b)),a.Da&&a.R.ub||gd(b,a.R.duration),a={createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:b.find.bind(b),getSegmentReference:b.get.bind(b)});return{createSegmentIndex:a.createSegmentIndex,
findSegmentPosition:a.findSegmentPosition,getSegmentReference:a.getSegmentReference,initSegmentReference:e,presentationTimeOffset:f.presentationTimeOffset}}function Ad(a){return a.Ra}
function Bd(a,b){var c=a.R.duration,d=b.P,e=b.za,f=b.timescale,g=b.wb,h=a.bandwidth||null,l=a.w.id,m=a.w.U;return{createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:function(a){return 0>a||c&&a>=c?null:Math.floor(a/d)},getSegmentReference:function(a){var b=a*d;return 0>b||c&&b>=c?null:new O(a,b,b+d,function(){var c=Vc(g,l,a+e,h,b*f);return z(m,[c])},0,null)}}}
function Cd(a,b){for(var c=[],d=0;d<b.F.length;d++){var e=d+b.za;c.push(new O(e,b.F[d].start,b.F[d].end,function(a,b,c,d,e,q){a=Vc(a,b,e,c,q);return z(d,[a]).map(function(a){return a.toString()})}.bind(null,b.wb,a.w.id,a.bandwidth||null,a.w.U,e,b.F[d].qe+b.Pb),0,null))}return c}function zd(a){var b=Xc(a,Ad,"initialization");if(!b)return null;var c=a.w.id,d=a.bandwidth||null,e=a.w.U;return new Zc(function(){var a=Vc(b,c,null,d,null);return z(e,[a])},0,null)};var Dd={},Ed={};n("shaka.media.ManifestParser.registerParserByExtension",function(a,b){Ed[a]=b});n("shaka.media.ManifestParser.registerParserByMime",function(a,b){Dd[a]=b});function Fd(){var a={},b;for(b in Dd)a[b]=!0;for(b in Ed)a[b]=!0;["application/dash+xml","application/x-mpegurl","application/vnd.apple.mpegurl","application/vnd.ms-sstr+xml"].forEach(function(b){a[b]=!!Dd[b]});["mpd","m3u8","ism"].forEach(function(b){a[b]=!!Ed[b]});return a}
function Gd(a,b,c,d){var e=d;e||(d=(new ia(a)).W.split("/").pop().split("."),1<d.length&&(d=d.pop().toLowerCase(),e=Ed[d]));if(e)return Promise.resolve(e);c=C([a],c);c.method="HEAD";return b.request(0,c).then(function(b){(b=b.headers["content-type"])&&(b=b.toLowerCase());return(e=Dd[b])?e:Promise.reject(new t(2,4,4E3,a))},function(a){a.severity=2;return Promise.reject(a)})};function T(a,b){this.f=a;this.i=b;this.c=this.a=Infinity;this.b=1;this.h=0;this.g=!0}n("shaka.media.PresentationTimeline",T);T.prototype.Y=function(){return this.a};T.prototype.getDuration=T.prototype.Y;T.prototype.pa=function(a){this.a=a};T.prototype.setDuration=T.prototype.pa;T.prototype.Wc=function(){return this.f};T.prototype.getPresentationStartTime=T.prototype.Wc;T.prototype.wc=function(a){this.h=a};T.prototype.setClockOffset=T.prototype.wc;T.prototype.yc=function(a){this.g=a};
T.prototype.setStatic=T.prototype.yc;T.prototype.Xc=function(){return this.c};T.prototype.getSegmentAvailabilityDuration=T.prototype.Xc;T.prototype.xc=function(a){this.c=a};T.prototype.setSegmentAvailabilityDuration=T.prototype.xc;T.prototype.Ha=function(a,b){b.length&&(this.b=b.reduce(function(a,b){return Math.max(a,b.endTime-b.startTime)},this.b))};T.prototype.notifySegments=T.prototype.Ha;T.prototype.yb=function(a){this.b=Math.max(this.b,a)};T.prototype.notifyMaxSegmentDuration=T.prototype.yb;
T.prototype.$=function(){return Infinity==this.a&&!this.g};T.prototype.isLive=T.prototype.$;T.prototype.va=function(){return Infinity!=this.a&&!this.g};T.prototype.isInProgress=T.prototype.va;T.prototype.ma=function(){return this.Ea(0)};T.prototype.getSegmentAvailabilityStart=T.prototype.ma;T.prototype.Ea=function(a){if(Infinity==this.c)return 0;var b=this.ua();return Math.max(0,Math.min(b-this.c+a,b))};T.prototype.getSafeAvailabilityStart=T.prototype.Ea;
T.prototype.ua=function(){return this.$()||this.va()?Math.min(Math.max(0,(Date.now()+this.h)/1E3-this.b-this.f),this.a):this.a};T.prototype.getSegmentAvailabilityEnd=T.prototype.ua;T.prototype.bb=function(){return Math.max(0,this.ua()-(this.$()||this.va()?this.i:0))};T.prototype.getSeekRangeEnd=T.prototype.bb;function Hd(){this.a=this.b=null;this.g=[];this.c=null;this.i=[];this.h=1;this.j={};this.l=0;this.f=null}n("shaka.dash.DashParser",Hd);k=Hd.prototype;k.configure=function(a){this.b=a};k.start=function(a,b){this.g=[a];this.a=b;return Id(this).then(function(){this.a&&Jd(this,0);return this.c}.bind(this))};k.stop=function(){this.b=this.a=null;this.g=[];this.c=null;this.i=[];this.j={};null!=this.f&&(window.clearTimeout(this.f),this.f=null);return Promise.resolve()};k.update=function(){Id(this)["catch"](function(a){if(this.a)this.a.onError(a)}.bind(this))};
k.onExpirationUpdated=function(){};function Id(a){return a.a.networkingEngine.request(0,C(a.g,a.b.retryParameters)).then(function(a){if(this.a)return Kd(this,a.data,a.uri)}.bind(a))}
function Kd(a,b,c){var d=F(b),e=new DOMParser,f=null;b=null;try{f=e.parseFromString(d,"text/xml")}catch(v){}f&&"MPD"==f.documentElement.tagName&&(b=f.documentElement);b&&0<b.getElementsByTagName("parsererror").length&&(b=null);if(!b)throw new t(2,4,4001);c=[c];d=M(b,"Location").map(Ic).filter(ya);0<d.length&&(c=a.g=d);d=M(b,"BaseURL").map(Ic);c=z(c,d);var g=N(b,"minBufferTime",Kc);a.l=N(b,"minimumUpdatePeriod",Kc,-1);var h=N(b,"availabilityStartTime",Jc),d=N(b,"timeShiftBufferDepth",Kc),l=N(b,"suggestedPresentationDelay",
Kc),e=N(b,"maxSegmentDuration",Kc),f=b.getAttribute("type")||"static";if(a.c)var m=a.c.presentationTimeline;else{var q=Math.max(10,1.5*g);m=new T(h,null!=l?l:q)}var h=Ld(a,{Da:"static"!=f,presentationTimeline:m,T:null,R:null,S:null,w:null,bandwidth:void 0,$b:!1},c,b),l=h.duration,r=h.periods;m.yc("static"==f);m.pa(l||Infinity);m.xc(null!=d?d:Infinity);m.yb(e||1);if(a.c)return Promise.resolve();b=M(b,"UTCTiming");return Md(a,c,b,m.$()).then(function(a){this.a&&(m.wc(a),this.c={presentationTimeline:m,
periods:r,offlineSessionIds:[],minBufferTime:g||0})}.bind(a))}
function Ld(a,b,c,d){var e=N(d,"mediaPresentationDuration",Kc),f=[],g=0;d=M(d,"Period");for(var h=0;h<d.length;h++){var l=d[h],g=N(l,"start",Kc,g),m=N(l,"duration",Kc),q=null;if(h!=d.length-1){var r=N(d[h+1],"start",Kc);null!=r&&(q=r-g)}else null!=e&&(q=e-g);null==q&&(q=m);l=Nd(a,b,c,{start:g,duration:q,node:l,ub:null==q||h==d.length-1});f.push(l);m=b.T.id;a.i.every(za(m))&&(a.a.filterPeriod(l),a.i.push(m),a.c&&a.c.periods.push(l));if(null==q){g=null;break}g+=q}return null!=e?{periods:f,duration:e}:
{periods:f,duration:g}}
function Nd(a,b,c,d){b.T=Od(d.node,null,c);b.R=d;b.T.id||(b.T.id="__shaka_period_"+d.start);M(d.node,"EventStream").forEach(a.Fd.bind(a,d.start,d.duration));c=M(d.node,"AdaptationSet").map(a.Dd.bind(a,b)).filter(ya);var e=c.map(function(a){return a.Pd}).reduce(x,[]),f=e.filter(Aa);if(b.Da&&e.length!=f.length)throw new t(2,4,4018);var g=c.filter(function(a){return!a.Ob});c.filter(function(a){return a.Ob}).forEach(function(a){var b=a.streams[0],c=a.Ob;g.forEach(function(a){a.id==c&&a.streams.forEach(function(a){a.trickModeVideo=
b})})});e=Pd(g,"video");f=Pd(g,"audio");if(!e.length&&!f.length)throw new t(2,4,4004);f.length||(f=[null]);e.length||(e=[null]);b=[];for(c=0;c<f.length;c++)for(var h=0;h<e.length;h++)Qd(a,f[c],e[h],b);a=Pd(g,"text");e=[];for(c=0;c<a.length;c++)e.push.apply(e,a[c].streams);return{startTime:d.start,textStreams:e,variants:b}}function Pd(a,b){return a.filter(function(a){return a.contentType==b})}
function Qd(a,b,c,d){if(b||c)if(b&&c){var e=b.drmInfos;var f=c.drmInfos;if(e.length&&f.length?0<sb(e,f).length:1)for(var g=sb(b.drmInfos,c.drmInfos),e=0;e<b.streams.length;e++)for(var h=0;h<c.streams.length;h++)f=c.streams[h].bandwidth+b.streams[e].bandwidth,f={id:a.h++,language:b.language,primary:b.vb||c.vb,audio:b.streams[e],video:c.streams[h],bandwidth:f,drmInfos:g,allowedByApplication:!0,allowedByKeySystem:!0},d.push(f)}else for(g=b||c,e=0;e<g.streams.length;e++)f=g.streams[e].bandwidth,f={id:a.h++,
language:g.language||"und",primary:g.vb,audio:b?g.streams[e]:null,video:c?g.streams[e]:null,bandwidth:f,drmInfos:g.drmInfos,allowedByApplication:!0,allowedByKeySystem:!0},d.push(f)}
k.Dd=function(a,b){a.S=Od(b,a.T,null);var c=!1,d=M(b,"Role"),e=d.map(function(a){return a.getAttribute("value")}).filter(ya),f=void 0;"text"==a.S.contentType&&(f="subtitle");for(var g=0;g<d.length;g++){var h=d[g].getAttribute("schemeIdUri");if(null==h||"urn:mpeg:dash:role:2011"==h)switch(h=d[g].getAttribute("value"),h){case "main":c=!0;break;case "caption":case "subtitle":f=h}}var l=null,m=!1;M(b,"EssentialProperty").forEach(function(a){"http://dashif.org/guidelines/trickmode"==a.getAttribute("schemeIdUri")?
l=a.getAttribute("value"):m=!0});if(m)return null;var d=M(b,"ContentProtection"),q=Rc(d,this.b.dash.customScheme,this.b.dash.ignoreDrmInfo),d=Sb(b.getAttribute("lang")||"und"),h=b.getAttribute("label"),g=M(b,"Representation"),e=g.map(this.Gd.bind(this,a,q,f,d,h,c,e)).filter(function(a){return!!a});if(!e.length)throw new t(2,4,4003);a.S.contentType&&"application"!=a.S.contentType||(a.S.contentType=Rd(e[0].mimeType,e[0].codecs),e.forEach(function(b){b.type=a.S.contentType}));e.forEach(function(a){q.drmInfos.forEach(function(b){a.keyId&&
b.keyIds.push(a.keyId)})});f=g.map(function(a){return a.getAttribute("id")}).filter(ya);return{id:a.S.id||"__fake__"+this.h++,contentType:a.S.contentType,language:d,vb:c,streams:e,drmInfos:q.drmInfos,Ob:l,Pd:f}};
k.Gd=function(a,b,c,d,e,f,g,h){a.w=Od(h,a.S,null);if(!Sd(a.w))return null;a.bandwidth=N(h,"bandwidth",Nc)||void 0;var l=this.Qd.bind(this);if(a.w.Qa)l=rd(a,l);else if(a.w.oa)l=ud(a,this.j);else if(a.w.Ra)l=yd(a,l,this.j,!!this.c);else{var m=a.w.U,q=a.R.duration||0;l={createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:function(a){return 0<=a&&a<q?1:null},getSegmentReference:function(a){return 1!=a?null:new O(1,0,q,function(){return m},0,null)},initSegmentReference:null,presentationTimeOffset:0}}h=
M(h,"ContentProtection");h=Uc(h,this.b.dash.customScheme,b,this.b.dash.ignoreDrmInfo);return{id:this.h++,createSegmentIndex:l.createSegmentIndex,findSegmentPosition:l.findSegmentPosition,getSegmentReference:l.getSegmentReference,initSegmentReference:l.initSegmentReference,presentationTimeOffset:l.presentationTimeOffset,mimeType:a.w.mimeType,codecs:a.w.codecs,frameRate:a.w.frameRate,bandwidth:a.bandwidth,width:a.w.width,height:a.w.height,kind:c,encrypted:0<b.drmInfos.length,keyId:h,language:d,label:e,
type:a.S.contentType,primary:f,trickModeVideo:null,containsEmsgBoxes:a.w.containsEmsgBoxes,roles:g}};k.he=function(){this.f=null;var a=Date.now();Id(this).then(function(){this.a&&Jd(this,(Date.now()-a)/1E3)}.bind(this))["catch"](function(a){this.a&&(a.severity=1,this.a.onError(a),Jd(this,0))}.bind(this))};function Jd(a,b){0>a.l||(a.f=window.setTimeout(a.he.bind(a),1E3*Math.max(Math.max(3,a.l)-b,0)))}
function Od(a,b,c){b=b||{contentType:"",mimeType:"",codecs:"",containsEmsgBoxes:!1,frameRate:void 0};c=c||b.U;var d=M(a,"BaseURL").map(Ic),e=a.getAttribute("contentType")||b.contentType,f=a.getAttribute("mimeType")||b.mimeType,g=a.getAttribute("codecs")||b.codecs,h=N(a,"frameRate",Pc)||b.frameRate,l=!!M(a,"InbandEventStream").length;e||(e=Rd(f,g));return{U:z(c,d),Qa:Hc(a,"SegmentBase")||b.Qa,oa:Hc(a,"SegmentList")||b.oa,Ra:Hc(a,"SegmentTemplate")||b.Ra,width:N(a,"width",Oc)||b.width,height:N(a,"height",
Oc)||b.height,contentType:e,mimeType:f,codecs:g,frameRate:h,containsEmsgBoxes:l||b.containsEmsgBoxes,id:a.getAttribute("id")}}function Sd(a){var b=0+(a.Qa?1:0);b+=a.oa?1:0;b+=a.Ra?1:0;if(!b)return"text"==a.contentType||"application"==a.contentType?!0:!1;1!=b&&(a.Qa&&(a.oa=null),a.Ra=null);return!0}
function Td(a,b,c,d){b=z(b,[c]);b=C(b,a.b.retryParameters);b.method=d;return a.a.networkingEngine.request(0,b).then(function(a){if("HEAD"==d){if(!a.headers||!a.headers.date)return 0;a=a.headers.date}else a=F(a.data);a=Date.parse(a);return isNaN(a)?0:a-Date.now()})}
function Md(a,b,c,d){c=c.map(function(a){return{scheme:a.getAttribute("schemeIdUri"),value:a.getAttribute("value")}});var e=a.b.dash.clockSyncUri;d&&!c.length&&e&&c.push({scheme:"urn:mpeg:dash:utc:http-head:2014",value:e});return xa(c,function(a){var c=a.value;switch(a.scheme){case "urn:mpeg:dash:utc:http-head:2014":case "urn:mpeg:dash:utc:http-head:2012":return Td(this,b,c,"HEAD");case "urn:mpeg:dash:utc:http-xsdate:2014":case "urn:mpeg:dash:utc:http-iso:2014":case "urn:mpeg:dash:utc:http-xsdate:2012":case "urn:mpeg:dash:utc:http-iso:2012":return Td(this,
b,c,"GET");case "urn:mpeg:dash:utc:direct:2014":case "urn:mpeg:dash:utc:direct:2012":return a=Date.parse(c),isNaN(a)?0:a-Date.now();case "urn:mpeg:dash:utc:http-ntp:2014":case "urn:mpeg:dash:utc:ntp:2014":case "urn:mpeg:dash:utc:sntp:2014":return Promise.reject();default:return Promise.reject()}}.bind(a))["catch"](function(){return 0})}
k.Fd=function(a,b,c){var d=c.getAttribute("schemeIdUri")||"",e=c.getAttribute("value")||"",f=N(c,"timescale",Oc)||1;M(c,"Event").forEach(function(c){var g=N(c,"presentationTime",Oc)||0,l=N(c,"duration",Oc)||0,g=g/f+a,l=g+l/f;null!=b&&(g=Math.min(g,a+b),l=Math.min(l,a+b));c={schemeIdUri:d,value:e,startTime:g,endTime:l,id:c.getAttribute("id")||"",eventElement:c};this.a.onTimelineRegionAdded(c)}.bind(this))};
k.Qd=function(a,b,c){a=C(a,this.b.retryParameters);null!=b&&(a.headers.Range="bytes="+b+"-"+(null!=c?c:""));return this.a.networkingEngine.request(1,a).then(function(a){return a.data})};function Rd(a,b){return ub[Yb(a,b)]?"text":a.split("/")[0]}Ed.mpd=Hd;Dd["application/dash+xml"]=Hd;function Ud(a,b,c,d){this.uri=a;this.type=b;this.ga=c;this.segments=d||null}function Vd(a,b,c,d){this.id=a;this.name=b;this.a=c;this.value=d||null}Vd.prototype.toString=function(){function a(a){return a.name+'="'+a.value+'"'}return this.value?"#"+this.name+":"+this.value:0<this.a.length?"#"+this.name+":"+this.a.map(a).join(","):"#"+this.name};function Wd(a,b){this.name=a;this.value=b}Vd.prototype.getAttribute=function(a){var b=this.a.filter(function(b){return b.name==a});return b.length?b[0]:null};
function Xd(a,b,c){c=c||null;return(a=a.getAttribute(b))?a.value:c}function Yd(a,b){this.ga=b;this.uri=a};function Zd(a,b){return a.filter(function(a){return a.name==b})}function $d(a,b){var c=Zd(a,b);return c.length?c[0]:null}function ae(a,b,c){return a.filter(function(a){var d=a.getAttribute("TYPE");a=a.getAttribute("GROUP-ID");return d.value==b&&a.value==c})};function be(a){this.b=a;this.a=0}function ce(a,b){b.lastIndex=a.a;var c=(c=b.exec(a.b))?{position:c.index,length:c[0].length,Sd:c}:null;if(a.a==a.b.length||!c||c.position!=a.a)return null;a.a+=c.length;return c.Sd}function de(a){return a.a==a.b.length?null:(a=ce(a,/[^ \t\n]*/gm))?a[0]:null};function ee(){this.a=0}
function fe(a,b,c){b=F(b);b=b.replace(/\r\n|\r(?=[^\n]|$)/gm,"\n").trim();var d=b.split(/\n+/m);if(!/^#EXTM3U($|[ \t\n])/m.test(d[0]))throw new t(2,4,4015);b=0;for(var e=[],f=1;f<d.length;)if(/^#(?!EXT)/m.test(d[f]))f+=1;else{var g=d[f];g=ge(a.a++,g);if(0<=he.indexOf(g.name))b=1;else if(0<=ie.indexOf(g.name)){if(1!=b)throw new t(2,4,4017);d=d.splice(f,d.length-f);a=je(a,d);return new Ud(c,b,e,a)}e.push(g);f+=1;"EXT-X-STREAM-INF"==g.name&&(g.a.push(new Wd("URI",d[f])),f+=1)}return new Ud(c,b,e)}
function je(a,b){var c=[],d=[];b.forEach(function(a){/^(#EXT)/.test(a)?(a=ge(this.a++,a),d.push(a)):/^#(?!EXT)/m.test(a)||(c.push(new Yd(a.trim(),d)),d=[])}.bind(a));return c}function ge(a,b){var c=b.match(/^#(EXT[^:]*)(?::(.*))?$/);if(!c)throw new t(2,4,4016);var d=c[1],e=c[2],c=[];if(e&&0<=e.indexOf("="))for(var e=new be(e),f,g=/([^=]+)=(?:"([^"]*)"|([^",]*))(?:,|$)/g;f=ce(e,g);)c.push(new Wd(f[1],f[2]||f[3]));else if(e)return new Vd(a,d,c,e);return new Vd(a,d,c)}
var he="EXT-X-TARGETDURATION EXT-X-MEDIA-SEQUENCE EXT-X-DISCONTINUITY-SEQUENCE EXT-X-PLAYLIST-TYPE EXT-X-MAP EXT-X-I-FRAMES-ONLY".split(" "),ie="EXTINF EXT-X-BYTERANGE EXT-X-DISCONTINUITY EXT-X-PROGRAM-DATE-TIME EXT-X-KEY EXT-X-DATERANGE".split(" ");function ke(a){return new Promise(function(b){var c=ke.parse(a);b({uri:a,data:c.data,headers:{"content-type":c.contentType}})})}n("shaka.net.DataUriPlugin",ke);
ke.parse=function(a){var b=a.split(":");if(2>b.length||"data"!=b[0])throw new t(2,1,1004,a);b=b.slice(1).join(":").split(",");if(2>b.length)throw new t(2,1,1004,a);var c=b[0],b=window.decodeURIComponent(b.slice(1).join(",")),c=c.split(";"),d=null;1<c.length&&(d=c[1]);if("base64"==d)a=Ya(b).buffer;else{if(d)throw new t(2,1,1005,a);a=Ua(b)}return{data:a,contentType:c[0]}};Ea.data=ke;function le(){this.b=this.c=null;this.i=1;this.g={};this.f={};this.a=null;this.j="";this.h=new ee}n("shaka.hls.HlsParser",le);k=le.prototype;k.configure=function(a){this.b=a};k.start=function(a,b){this.c=b;this.j=a;return this.c.networkingEngine.request(0,C([a],this.b.retryParameters)).then(function(b){return ne(this,b.data,a)}.bind(this))};k.stop=function(){this.b=this.c=null;this.g={};return Promise.resolve()};k.update=function(){};k.onExpirationUpdated=function(){};
function ne(a,b,c){b=fe(a.h,b,c);if(0!=b.type)throw new t(2,4,4022);a.a=new T(null,0);return oe(a,b).then(function(a){this.c.filterPeriod(a);return{presentationTimeline:this.a,periods:[a],offlineSessionIds:[],minBufferTime:0}}.bind(a))}
function oe(a,b){var c=Zd(b.ga,"EXT-X-STREAM-INF").map(function(a){return pe(this,a,b)}.bind(a)),d=Zd(b.ga,"EXT-X-MEDIA").filter(function(a){return"SUBTITLES"==U(a,"TYPE")}.bind(a)).map(function(a){return qe(this,a,b)}.bind(a));return Promise.all(c).then(function(a){return Promise.all(d).then(function(b){var c=a.reduce(x,[]);re(this,c);return{startTime:0,variants:c,textStreams:b}}.bind(this))}.bind(a))}
function pe(a,b,c){var d=Number(U(b,"BANDWIDTH")),e=Xd(b,"CODECS","avc1.42E01E,mp4a.40.2").split(","),f=b.getAttribute("RESOLUTION"),g=null,h=null,l=Xd(b,"FRAME-RATE");if(f)var m=f.value.split("x"),g=m[0],h=m[1];var q=se(a,c);c=Zd(c.ga,"EXT-X-MEDIA");var r=Xd(b,"AUDIO"),v=Xd(b,"VIDEO");r?c=ae(c,"AUDIO",r):v&&(c=ae(c,"VIDEO",v));c=c.map(function(a){return te(this,a,e,q)}.bind(a));var u=[],w=[];return Promise.all(c).then(function(a){r?u=a:v&&(w=a);if(u.length||w.length)var c=u.length?"video":"audio";
else 1==e.length?c=f||l?"video":"audio":(c="video",e=[e.join(",")]);a=e;var d=U(b,"URI");return ue(this,d,a,c,q,"und",!1,null)}.bind(a)).then(function(a){"audio"==a.stream.type?u=[a]:w=[a];return ve(this,u,w,d,g,h,l)}.bind(a))}
function ve(a,b,c,d,e,f,g){c.forEach(function(a){if(a=a.stream)a.width=Number(e)||void 0,a.height=Number(f)||void 0,a.frameRate=Number(g)||void 0}.bind(a));b.length||(b=[null]);c.length||(c=[null]);for(var h=[],l=0;l<b.length;l++)for(var m=0;m<c.length;m++){var q=b[l]?b[l].stream:null,r=c[m]?c[m].stream:null,v=b[l]?b[l].drmInfos:null,u=c[m]?c[m].drmInfos:null;if(q&&r)if(v.length&&u.length?0<sb(v,u).length:1)var w=sb(v,u);else continue;else q?w=v:r&&(w=u);h.push(xe(a,q,r,d,w))}return h}
function xe(a,b,c,d,e){return{id:a.i++,language:b?b.language:"und",primary:!!b&&b.primary||!!c&&c.primary,audio:b,video:c,bandwidth:d,drmInfos:e,allowedByApplication:!0,allowedByKeySystem:!0}}function qe(a,b,c){U(b,"TYPE");c=se(a,c);return te(a,b,[],c).then(function(a){return a.stream})}
function te(a,b,c,d){if(a.g[b.id])return Promise.resolve().then(function(){return this.g[b.id]}.bind(a));var e=U(b,"TYPE").toLowerCase();"subtitles"==e&&(e="text");var f=Sb(Xd(b,"LANGUAGE","und")),g=Xd(b,"NAME"),h=b.getAttribute("DEFAULT"),l=b.getAttribute("AUTOSELECT"),m=U(b,"URI");return ue(a,m,c,e,d,f,!!h||!!l,g).then(function(a){return this.g[b.id]=a}.bind(a))}
function ue(a,b,c,d,e,f,g,h){b=z([a.j],[b])[0];return a.c.networkingEngine.request(0,C([b],a.b.retryParameters)).then(function(a){a=fe(this.h,a.data,a.uri);if(1!=a.type)throw new t(2,4,4017);e=se(this,a)||e;var b=null;"text"!=d&&(b=ye(a));var l=$d(a.ga,"EXT-X-MEDIA-SEQUENCE"),l=ze(this,a,l?Number(l.value):0);this.a.Ha(0,l);var r=l[l.length-1].endTime-l[0].startTime,v=this.a.Y();(Infinity==v||v<r)&&this.a.pa(r);var u=Ae(d,c),w=void 0;"text"==d&&(w="subtitle");var G=new S(l),pa=[];a.segments.forEach(function(a){a=
Zd(a.ga,"EXT-X-KEY");pa.push.apply(pa,a)});var Hb=!1,tc=[],me=null;pa.forEach(function(a){if("NONE"!=U(a,"METHOD")){Hb=!0;var b=U(a,"KEYFORMAT");if(a=(b=Be[b])?b(a):null)a.keyIds.length&&(me=a.keyIds[0]),tc.push(a)}});if(Hb&&!tc.length)throw new t(2,4,4026);return Ce(this,d,l[0].a()[0]).then(function(a){a={id:this.i++,createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:G.find.bind(G),getSegmentReference:G.get.bind(G),initSegmentReference:b,presentationTimeOffset:e||0,mimeType:a,codecs:u,
kind:w,encrypted:Hb,keyId:me,language:f,label:h||null,type:d,primary:g,trickModeVideo:null,containsEmsgBoxes:!1,frameRate:void 0,width:void 0,height:void 0,bandwidth:void 0,roles:[]};this.f[a.id]=G;return{stream:a,Ae:G,drmInfos:tc}}.bind(this))}.bind(a))}
function ye(a){var b=Zd(a.ga,"EXT-X-MAP");if(!b.length)return null;if(1<b.length)throw new t(2,4,4020);var b=b[0],c=U(b,"URI"),d=z([a.uri],[c])[0];a=0;c=null;if(b=Xd(b,"BYTERANGE"))a=b.split("@"),b=Number(a[0]),a=Number(a[1]),c=a+b-1;return new Zc(function(){return[d]},a,c)}
function ze(a,b,c){var d=b.segments,e=[];d.forEach(function(a){var f=a.ga,h=z([b.uri],[a.uri])[0],l=De(f).value.split(","),l=Number(l[0]),m;(a=d.indexOf(a))?m=e[a-1].endTime:m=0;var l=m+l,q=0,r=null;if(f=$d(f,"EXT-X-BYTERANGE"))f=f.value.split("@"),r=Number(f[0]),f[1]?q=Number(f[1]):q=e[a-1].M,r=q+r-1,a==d.length-1&&(r=null);e.push(new O(c+a,m,l,function(){return[h]},q,r))}.bind(a));return e}
function re(a,b){b.forEach(function(a){var b=this.a.Y(),c=a.video;a=a.audio;c&&this.f[c.id]&&gd(this.f[c.id],b);a&&this.f[a.id]&&gd(this.f[a.id],b)}.bind(a))}function Ae(a,b){if(1==b.length)return b[0];if("text"==a)return"";var c=Ee;"audio"==a&&(c=Fe);for(var d=0;d<c.length;d++)for(var e=0;e<b.length;e++)if(c[d].test(b[e].trim()))return b[e].trim();throw new t(2,4,4025,b);}
function Ce(a,b,c){var d=c.split("."),e=d[d.length-1];if("text"==b)return Promise.resolve("text/vtt");d=Ge;"video"==b&&(d=He);if(b=d[e])return Promise.resolve(b);c=C([c],a.b.retryParameters);c.method="HEAD";return a.c.networkingEngine.request(1,c).then(function(a){a=a.headers["content-type"];if(!a)throw new t(2,4,4021,e);return a})}function se(a,b){var c=$d(b.ga,"EXT-X-START");return c?Number(U(c,"TIME-OFFSET")):a.b.hls.defaultTimeOffset}
function U(a,b){var c=a.getAttribute(b);if(!c)throw new t(2,4,4023,b);return c.value}function De(a){a=$d(a,"EXTINF");if(!a)throw new t(2,4,4024,"EXTINF");return a}
var Ee=[/^(avc)/,/^(hvc)/,/^(vp[8-9])$/,/^(av1)$/,/^(mp4v)/],Fe=[/^(vorbis)/,/^(opus)/,/^(mp4a)/,/^(ac-3)$/,/^(ec-3)$/],Ge={mp4:"audio/mp4",m4s:"audio/mp4",m4i:"audio/mp4",m4a:"audio/mp4",ts:"video/mp2t"},He={mp4:"video/mp4",m4s:"video/mp4",m4i:"video/mp4",m4v:"video/mp4",ts:"video/mp2t"},Be={"urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed":function(a){if("SAMPLE-AES-CENC"!=U(a,"METHOD"))return null;var b=U(a,"URI"),b=ke.parse(b),b=new Uint8Array(b.data),b=Ba("com.widevine.alpha",[{initDataType:"cenc",
initData:b}]);if(a=Xd(a,"KEYID"))b.keyIds=[a.substr(2).toLowerCase()];return b}};Ed.m3u8=le;Dd["application/x-mpegurl"]=le;Dd["application/vnd.apple.mpegurl"]=le;function Ie(){}Ie.prototype.parseInit=function(){};
Ie.prototype.parseMedia=function(a,b){var c=F(a),d=[],e=new DOMParser,f=null;try{f=e.parseFromString(c,"text/xml")}catch(Hb){throw new t(2,2,2005);}if(f){var g=f.getElementsByTagName("tt")[0];if(g){e=g.getAttribute("ttp:frameRate");f=g.getAttribute("ttp:subFrameRate");var h=g.getAttribute("ttp:frameRateMultiplier");var l=g.getAttribute("ttp:tickRate");c=g.getAttribute("xml:space")||"default"}else throw new t(2,2,2005);if("default"!=c&&"preserve"!=c)throw new t(2,2,2005);c="default"==c;e=new Je(e,
f,h,l);f=Ke(g.getElementsByTagName("styling")[0]);h=Ke(g.getElementsByTagName("layout")[0]);g=Ke(g.getElementsByTagName("body")[0]);for(l=0;l<g.length;l++){var m=g[l],q=b.periodStart,r=e;var v=f;var u=h,w=c;if(m.hasAttribute("begin")||m.hasAttribute("end")||!/^\s*$/.test(m.textContent)){Le(m,w);var w=Me(m.getAttribute("begin"),r),G=Me(m.getAttribute("end"),r),r=Me(m.getAttribute("dur"),r),pa=m.textContent;null==G&&null!=r&&(G=w+r);if(null==w||null==G)throw new t(2,2,2001);if(q=xb(w+q,G+q,pa)){w=Ne(m,
"region",u);u=q;if(G=Oe(m,w,v,"tts:extent"))if(r=Pe.exec(G))u.size=Number(r[1]);r=Oe(m,w,v,"tts:writingMode");G=!0;"tb"==r||"tblr"==r?u.vertical="lr":"tbrl"==r?u.vertical="rl":G=!1;if(r=Oe(m,w,v,"tts:origin"))if(r=Pe.exec(r))G?(u.position=Number(r[2]),u.line=Number(r[1])):(u.position=Number(r[1]),u.line=Number(r[2])),u.snapToLines=!1;if(v=Oe(m,w,v,"tts:textAlign"))u.align=v,"center"==v&&("center"!=u.align&&(u.align="middle"),u.position="auto"),u.positionAlign=Qe[v],u.lineAlign=Re[v];v=q}else v=null}else v=
null;v&&d.push(v)}}return d};var Se=/^(\d{2,}):(\d{2}):(\d{2}):(\d{2})\.?(\d+)?$/,Te=/^(?:(\d{2,}):)?(\d{2}):(\d{2})$/,Ue=/^(?:(\d{2,}):)?(\d{2}):(\d{2}\.\d{2,})$/,Ve=/^(\d*\.?\d*)f$/,We=/^(\d*\.?\d*)t$/,Xe=/^(?:(\d*\.?\d*)h)?(?:(\d*\.?\d*)m)?(?:(\d*\.?\d*)s)?(?:(\d*\.?\d*)ms)?$/,Pe=/^(\d{1,2}|100)% (\d{1,2}|100)%$/,Re={left:"start",center:"center",right:"end",start:"start",end:"end"},Qe={left:"line-left",center:"center",right:"line-right"};
function Ke(a){var b=[];if(!a)return b;for(var c=a.childNodes,d=0;d<c.length;d++){var e="span"==c[d].nodeName&&"p"==a.nodeName;c[d].nodeType!=Node.ELEMENT_NODE||"br"==c[d].nodeName||e||(e=Ke(c[d]),b=b.concat(e))}b.length||b.push(a);return b}function Le(a,b){for(var c=a.childNodes,d=0;d<c.length;d++)if("br"==c[d].nodeName&&0<d)c[d-1].textContent+="\n";else if(0<c[d].childNodes.length)Le(c[d],b);else if(b){var e=c[d].textContent.trim(),e=e.replace(/\s+/g," ");c[d].textContent=e}}
function Oe(a,b,c,d){for(var e=Ke(b),f=0;f<e.length;f++){var g=e[f].getAttribute(d);if(g)return g}e=Ne;return(a=e(b,"style",c)||e(a,"style",c))?a.getAttribute(d):null}function Ne(a,b,c){if(!a||1>c.length)return null;var d=null,e=a;for(a=null;e&&!(a=e.getAttribute(b))&&(e=e.parentNode,e instanceof Element););if(b=a)for(a=0;a<c.length;a++)if(c[a].getAttribute("xml:id")==b){d=c[a];break}return d}
function Me(a,b){var c=null;if(Se.test(a))var c=Se.exec(a),d=Number(c[1]),e=Number(c[2]),f=Number(c[3]),g=Number(c[4]),g=g+(Number(c[5])||0)/b.b,f=f+g/b.frameRate,c=f+60*e+3600*d;else Te.test(a)?c=Ye(Te,a):Ue.test(a)?c=Ye(Ue,a):Ve.test(a)?(c=Ve.exec(a),c=Number(c[1])/b.frameRate):We.test(a)?(c=We.exec(a),c=Number(c[1])/b.a):Xe.test(a)&&(c=Ye(Xe,a));return c}
function Ye(a,b){var c=a.exec(b);return c&&""!=c[0]?(Number(c[4])||0)/1E3+(Number(c[3])||0)+60*(Number(c[2])||0)+3600*(Number(c[1])||0):null}function Je(a,b,c,d){this.frameRate=Number(a)||30;this.b=Number(b)||1;this.a=Number(d);this.a||(this.a=a?this.frameRate*this.b:1);c&&(a=/^(\d+) (\d+)$/g.exec(c))&&(this.frameRate*=a[1]/a[2])}vb("application/ttml+xml",Ie);function Ze(){this.a=new Ie}Ze.prototype.parseInit=function(a){var b=!1;(new Q).C("moov",R).C("trak",R).C("mdia",R).C("minf",R).C("stbl",R).da("stsd",cd).C("stpp",function(){b=!0}).parse(a);if(!b)throw new t(2,2,2007);};Ze.prototype.parseMedia=function(a,b){var c=!1,d=[];(new Q).C("mdat",dd(function(a){c=!0;d=this.a.parseMedia(a.buffer,b)}.bind(this))).parse(a);if(!c)throw new t(2,2,2007);return d};vb('application/mp4; codecs="stpp"',Ze);function $e(){}$e.prototype.parseInit=function(){};
$e.prototype.parseMedia=function(a,b){var c=F(a),c=c.replace(/\r\n|\r(?=[^\n]|$)/gm,"\n"),c=c.split(/\n{2,}/m);if(!/^WEBVTT($|[ \t\n])/m.test(c[0]))throw new t(2,2,2E3);var d=b.segmentStart;if(0<=c[0].indexOf("X-TIMESTAMP-MAP")){var e=c[0].match(/LOCAL:((?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{3}))/m),f=c[0].match(/MPEGTS:(\d+)/m);e&&f&&(d=af(new be(e[1])),d=b.periodStart+(Number(f[1])/9E4-d))}f=[];for(e=1;e<c.length;e++){var g=c[e].split("\n"),h=d;if(1==g.length&&!g[0]||/^NOTE($|[ \t])/.test(g[0]))var l=
null;else{l=null;0>g[0].indexOf("--\x3e")&&(l=g[0],g.splice(0,1));var m=new be(g[0]),q=af(m),r=ce(m,/[ \t]+--\x3e[ \t]+/g),v=af(m);if(null==q||!r||null==v)throw new t(2,2,2001);if(g=xb(q+h,v+h,g.slice(1).join("\n").trim())){ce(m,/[ \t]+/gm);for(h=de(m);h;)bf(g,h),ce(m,/[ \t]+/gm),h=de(m);null!=l&&(g.id=l);l=g}else l=null}l&&f.push(l)}return f};
function bf(a,b){var c;if(c=/^align:(start|middle|center|end|left|right)$/.exec(b))a.align=c[1],"center"==c[1]&&"center"!=a.align&&(a.position="auto",a.align="middle");else if(c=/^vertical:(lr|rl)$/.exec(b))a.vertical=c[1];else if(c=/^size:(\d{1,2}|100)%$/.exec(b))a.size=Number(c[1]);else if(c=/^position:(\d{1,2}|100)%(?:,(line-left|line-right|center|start|end))?$/.exec(b))a.position=Number(c[1]),c[2]&&(a.positionAlign=c[2]);else if(c=/^line:(\d{1,2}|100)%(?:,(start|end|center))?$/.exec(b))a.snapToLines=
!1,a.line=Number(c[1]),c[2]&&(a.lineAlign=c[2]);else if(c=/^line:(-?\d+)(?:,(start|end|center))?$/.exec(b))a.snapToLines=!0,a.line=Number(c[1]),c[2]&&(a.lineAlign=c[2])}function af(a){a=ce(a,/(?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{3})/g);if(!a)return null;var b=Number(a[2]),c=Number(a[3]);return 59<b||59<c?null:Number(a[4])/1E3+c+60*b+3600*(Number(a[1])||0)}vb("text/vtt",$e);vb('text/vtt; codecs="vtt"',$e);function cf(){this.a=null}cf.prototype.parseInit=function(a){var b=!1;(new Q).C("moov",R).C("trak",R).C("mdia",R).da("mdhd",function(a){0==a.version?(a.s.I(4),a.s.I(4),this.a=a.s.D(),a.s.I(4)):(a.s.I(8),a.s.I(8),this.a=a.s.D(),a.s.I(8));a.s.I(4)}.bind(this)).C("minf",R).C("stbl",R).da("stsd",cd).C("wvtt",function(){b=!0}).parse(a);if(!this.a)throw new t(2,2,2008);if(!b)throw new t(2,2,2008);};
cf.prototype.parseMedia=function(a,b){var c=0,d=[],e=[],f=[],g=!1,h=!1,l=!1;(new Q).C("moof",R).C("traf",R).da("tfdt",function(a){g=!0;c=a.version?a.s.Pa():a.s.D()}).da("trun",function(a){h=!0;var b=a.version,c=a.Nc;a=a.s;var e=a.D();c&1&&a.I(4);c&4&&a.I(4);for(var f=[],g=0;g<e;g++){var l={duration:null,Nb:null};c&256&&(l.duration=a.D());c&512&&a.I(4);c&1024&&a.I(4);c&2048&&(l.Nb=b?a.nc():a.D());f.push(l)}d=f}).C("vtte",function(){e.push(null)}).C("vttc",dd(function(a){e.push(a.buffer)})).C("mdat",
function(a){l=!0;R(a)}).parse(a);if(!l&&!g&&!h)throw new t(2,2,2008);for(var m=c,q=0;q<d.length;q++){var r=d[q],v=e[q];if(r.duration){var u=r.Nb?c+r.Nb:m,m=u+r.duration;v&&f.push(df(v,b.periodStart+u/this.a,b.periodStart+m/this.a))}}return f};function df(a,b,c){var d,e,f;(new Q).C("payl",dd(function(a){d=F(a)})).C("iden",dd(function(a){e=F(a)})).C("sttg",dd(function(a){f=F(a)})).parse(a);return d?ef(d,e,f,b,c):null}
function ef(a,b,c,d,e){(a=xb(d,e,a))&&b&&(a.id=b);if(a&&c)for(b=new be(c),c=de(b);c;)bf(a,c),ce(b,/[ \t]+/gm),c=de(b);return a}vb('application/mp4; codecs="wvtt"',cf);function ff(a,b,c,d,e,f){this.a=a;this.c=b;this.l=c;this.A=d;this.J=e;this.G=f;this.b=new D;this.h=!1;this.g=1;this.j=this.f=null;this.B=a.readyState;this.i=!1;this.O=this.v=-1;this.o=!1;0<a.readyState?this.fc():La(this.b,a,"loadedmetadata",this.fc.bind(this));b=this.hc.bind(this);E(this.b,a,"ratechange",this.rd.bind(this));E(this.b,a,"waiting",b);this.j=setInterval(b,250)}k=ff.prototype;
k.m=function(){var a=this.b.m();this.b=null;null!=this.f&&(window.clearInterval(this.f),this.f=null);null!=this.j&&(window.clearInterval(this.j),this.j=null);this.G=this.J=this.l=this.c=this.a=null;return a};function gf(a,b){0<a.a.readyState?a.a.currentTime=hf(a,b):a.A=b}function jf(a){return 0<a.a.readyState?hf(a,a.a.currentTime):kf(a)}function kf(a){if(a.A)return hf(a,a.A);a=a.c.presentationTimeline;return Infinity>a.Y()?a.ma():a.bb()}k.rb=function(){return this.g};
function lf(a,b){null!=a.f&&(window.clearInterval(a.f),a.f=null);a.g=b;a.a.playbackRate=a.h||0>b?0:b;!a.h&&0>b&&(a.f=window.setInterval(function(){this.a.currentTime+=b/4}.bind(a),250))}k.Ab=function(){this.o=!0;this.hc()};k.rd=function(){this.a.playbackRate!=(this.h||0>this.g?0:this.g)&&lf(this,this.a.playbackRate)};
k.fc=function(){var a=kf(this);.001>Math.abs(this.a.currentTime-a)?(E(this.b,this.a,"seeking",this.ic.bind(this)),E(this.b,this.a,"playing",this.gc.bind(this))):(La(this.b,this.a,"seeking",this.td.bind(this)),this.a.currentTime=a)};k.td=function(){E(this.b,this.a,"seeking",this.ic.bind(this));E(this.b,this.a,"playing",this.gc.bind(this))};
k.hc=function(){if(this.a.readyState){this.a.readyState!=this.B&&(this.i=!1,this.B=this.a.readyState);var a=this.l.smallGapLimit,b=this.a.currentTime,c=this.a.buffered;a:{if(c&&c.length&&!(1==c.length&&1E-6>c.end(0)-c.start(0))){var d=.1;/(Edge|Trident)\//.test(navigator.userAgent)&&(d=.5);for(var e=0;e<c.length;e++)if(c.start(e)>b&&(!e||c.end(e-1)-b<=d)){d=e;break a}}d=null}if(null==d){if(3>this.a.readyState&&0<this.a.playbackRate)if(this.O!=b)this.O=b,this.v=Date.now();else if(this.v<Date.now()-
1E3)for(this.v=Date.now()+5E3,d=0;d<c.length;d++)if(b>=c.start(d)&&b<c.end(d)-.5){this.a.currentTime=this.a.currentTime;break}}else if(d||this.o)if(e=c.start(d),!(e>=this.c.presentationTimeline.bb())){var f=e-b,a=f<=a,g=!1;a||this.i||(this.i=!0,f=new I("largegap",{currentTime:b,gapSize:f}),f.cancelable=!0,this.G(f),this.l.jumpLargeGaps&&!f.defaultPrevented&&(g=!0));if(a||g)d&&c.end(d-1),mf(this,b,e)}}};
k.ic=function(){this.o=!1;var a=this.a.currentTime,b=nf(this,a);.001<Math.abs(b-a)?mf(this,a,b):(this.i=!1,this.J())};k.gc=function(){var a=this.a.currentTime,b=nf(this,a);.001<Math.abs(b-a)&&mf(this,a,b)};function nf(a,b){var c=Bb.bind(null,a.a.buffered),d=1*Math.max(a.c.minBufferTime||0,a.l.rebufferingGoal),e=a.c.presentationTimeline,f=e.ua(),g=e.Ea(d),h=e.Ea(5),d=e.Ea(d+5);return b>f?f:b<e.Ea(0)?c(h)?h:d:b>=g||c(b)?b:d}
function mf(a,b,c){a.a.currentTime=c;var d=0,e=function(){!this.a||10<=d++||this.a.currentTime!=b||(this.a.currentTime=c,setTimeout(e,100))}.bind(a);setTimeout(e,100)}function hf(a,b){var c=a.c.presentationTimeline.ma();if(b<c)return c;c=a.c.presentationTimeline.ua();return b>c?c:b};function of(a,b,c,d,e,f){this.a=a;this.g=b;this.A=c;this.l=d;this.h=e;this.B=f;this.c=[];this.j=new D;this.b=!1;this.i=-1;this.f=null;pf(this)}of.prototype.m=function(){var a=this.j?this.j.m():Promise.resolve();this.j=null;qf(this);this.B=this.h=this.l=this.A=this.g=this.a=null;this.c=[];return a};
of.prototype.v=function(a){if(!this.c.some(function(b){return b.info.schemeIdUri==a.schemeIdUri&&b.info.startTime==a.startTime&&b.info.endTime==a.endTime})){var b={info:a,status:1};this.c.push(b);var c=new I("timelineregionadded",{detail:rf(a)});this.h(c);this.o(!0,b)}};function rf(a){var b=Da(a);b.eventElement=a.eventElement;return b}
of.prototype.o=function(a,b){var c=b.info.startTime>this.a.currentTime?1:b.info.endTime<this.a.currentTime?3:2,d=2==b.status,e=2==c;if(c!=b.status){if(!a||d||e)d||this.h(new I("timelineregionenter",{detail:rf(b.info)})),e||this.h(new I("timelineregionexit",{detail:rf(b.info)}));b.status=c}};function pf(a){qf(a);a.f=window.setTimeout(a.G.bind(a),250)}function qf(a){a.f&&(window.clearTimeout(a.f),a.f=null)}
of.prototype.G=function(){this.f=null;pf(this);var a=hc(this.g,this.a.currentTime);a!=this.i&&(-1!=this.i&&this.B(),this.i=a);var a=Cb(this.a.buffered,this.a.currentTime),b=Ab(this.a.buffered)>=this.g.presentationTimeline.ua()-.1||this.a.ended;if(this.b){var c=1*Math.max(this.g.minBufferTime||0,this.A.rebufferingGoal);(b||a>=c)&&0!=this.b&&(this.b=!1,this.l(!1))}else!b&&.5>a&&1!=this.b&&(this.b=!0,this.l(!0));this.c.forEach(this.o.bind(this,!1))};function sf(a,b){this.a=b;this.b=a;this.g=null;this.i=1;this.o=Promise.resolve();this.h=[];this.j={};this.c={};this.f=this.l=this.v=!1}k=sf.prototype;k.m=function(){for(var a in this.c)tf(this.c[a]);this.g=this.c=this.j=this.h=this.o=this.b=this.a=null;this.f=!0;return Promise.resolve()};k.configure=function(a){this.g=a};k.init=function(){var a=this.a.bc(this.b.periods[hc(this.b,jf(this.a.Oa))]);return Ma(a)?Promise.reject(new t(2,5,5005)):uf(this,a).then(function(){this.a&&this.a.jd&&this.a.jd()}.bind(this))};
function V(a){return a.b.periods[hc(a.b,jf(a.a.Oa))]}function vf(a){return Oa(a.c,function(a){return a.na||a.stream})}function wf(a,b){var c={};c.text=b;return uf(a,c)}function xf(a,b){var c=a.c.video;if(c){var d=c.stream;if(d)if(b){var e=d.trickModeVideo;if(e){var f=c.na;f||(yf(a,"video",e,!1),c.na=d)}}else if(f=c.na)c.na=null,yf(a,"video",f,!0)}}
function yf(a,b,c,d){var e=a.c[b];if(!e&&"text"==b&&a.g.ignoreTextStreamFailures)wf(a,c);else if(e){var f=ic(a.b,c);d&&f!=e.wa?zf(a):(e.na&&(c.trickModeVideo?(e.na=c,c=c.trickModeVideo):e.na=null),"text"==b&&Fb(a.a.K,Yb(c.mimeType,c.codecs)),(b=a.h[f])&&b.La&&(b=a.j[c.id])&&b.La&&e.stream!=c&&(e.stream=c,e.cb=!0,d&&(e.sa?e.kb=!0:e.xa?(e.ra=!0,e.kb=!0):(tf(e),Af(a,e,!0)))))}}
function Bf(a){var b=jf(a.a.Oa);Object.keys(a.c).every(function(a){var c=this.a.K;"text"==a?(a=c.a,a=b>=a.b&&b<a.a):(a=Ib(c,a),a=Bb(a,b));return a}.bind(a))||zf(a)}function zf(a){for(var b in a.c){var c=a.c[b];c.sa||c.ra||(c.xa?c.ra=!0:null==Gb(a.a.K,b)?null==c.qa&&Cf(a,c,0):(tf(c),Af(a,c,!1)))}}
function uf(a,b,c){var d=hc(a.b,jf(a.a.Oa)),e=Oa(b,function(a){return Yb(a.mimeType,a.codecs)});a.a.K.init(e);Df(a);e=Na(b);return Ef(a,e).then(function(){if(!this.f)for(var a in b){var e=b[a];this.c[a]||(this.c[a]={stream:e,type:a,Fa:null,ea:null,na:null,cb:!0,wa:d,endOfStream:!1,xa:!1,qa:null,ra:!1,kb:!1,sa:!1,Gb:!1,tb:!1,rc:c||0},Cf(this,this.c[a],0))}}.bind(a))}
function Ff(a,b){var c=a.h[b];if(c)return c.L;c={L:new A,La:!1};a.h[b]=c;var d=a.b.periods[b].variants.map(function(a){var b=[];a.audio&&b.push(a.audio);a.video&&b.push(a.video);a.video&&a.video.trickModeVideo&&b.push(a.video.trickModeVideo);return b}).reduce(x,[]).filter(Aa);d.push.apply(d,a.b.periods[b].textStreams);a.o=a.o.then(function(){if(!this.f)return Ef(this,d)}.bind(a)).then(function(){this.f||(this.h[b].L.resolve(),this.h[b].La=!0)}.bind(a))["catch"](function(a){this.f||(this.h[b].L.reject(),
delete this.h[b],this.a.onError(a))}.bind(a));return c.L}
function Ef(a,b){b.map(function(a){return a.id}).filter(Aa);for(var c=[],d=0;d<b.length;++d){var e=b[d];var f=a.j[e.id];f?c.push(f.L):(a.j[e.id]={L:new A,La:!1},c.push(e.createSegmentIndex()))}return Promise.all(c).then(function(){if(!this.f)for(var a=0;a<b.length;++a){var c=this.j[b[a].id];c.La||(c.L.resolve(),c.La=!0)}}.bind(a))["catch"](function(a){if(!this.f)return this.j[e.id].L.reject(),delete this.j[e.id],Promise.reject(a)}.bind(a))}
function Df(a){var b=a.b.presentationTimeline.Y();Infinity>b?a.a.K.pa(b):a.a.K.pa(Math.pow(2,32))}k.ke=function(a){if(!this.f&&!a.xa&&null!=a.qa&&!a.sa)if(a.qa=null,a.ra)Af(this,a,a.kb);else{try{var b=Gf(this,a);null!=b&&(Cf(this,a,b),a.tb=!1)}catch(c){this.a.onError(c);return}b=Na(this.c);Hf(this,a);b.every(function(a){return a.endOfStream})&&this.a.K.endOfStream().then(function(){this.b.presentationTimeline.pa(this.a.K.Y())}.bind(this))}};
function Gf(a,b){var c=jf(a.a.Oa),d=b.Fa&&b.ea?a.b.periods[ic(a.b,b.Fa)].startTime+b.ea.endTime:Math.max(c,b.rc);b.rc=0;var e=ic(a.b,b.stream),f=hc(a.b,d);var g=a.a.K;var h=b.type;"text"==h?(g=g.a,g=null==g.a||g.a<c?0:g.a-Math.max(c,g.b)):(g=Ib(g,h),g=Cb(g,c));h=Math.max(a.i*Math.max(a.b.minBufferTime||0,a.g.rebufferingGoal),a.i*a.g.bufferingGoal);if(d>=a.b.presentationTimeline.Y())return b.endOfStream=!0,null;b.endOfStream=!1;b.wa=f;if(f!=e)return null;if(g>=h)return.5;d=a.a.K;f=b.type;d="text"==
f?d.a.a:Ab(Ib(d,f));b.ea&&b.stream==b.Fa?(f=b.ea.position+1,d=If(a,b,e,f)):(f=b.ea?b.stream.findSegmentPosition(Math.max(0,a.b.periods[ic(a.b,b.Fa)].startTime+b.ea.endTime-a.b.periods[e].startTime)):b.stream.findSegmentPosition(Math.max(0,(d||c)-a.b.periods[e].startTime)),null==f?d=null:(g=null,null==d&&(g=If(a,b,e,Math.max(0,f-1))),d=g||If(a,b,e,f)));if(!d)return 1;Jf(a,b,c,e,d);return null}
function If(a,b,c,d){c=a.b.periods[c];b=b.stream.getSegmentReference(d);if(!b)return null;a=a.b.presentationTimeline;d=a.ua();return c.startTime+b.endTime<a.ma()||c.startTime+b.startTime>d?null:b}
function Jf(a,b,c,d,e){var f=a.b.periods[d],g=b.stream,h=a.b.periods[d+1],l=null,l=h?h.startTime:a.b.presentationTimeline.Y();d=Kf(a,b,d,l);b.xa=!0;b.cb=!1;h=Lf(a,e);Promise.all([d,h]).then(function(a){if(!this.f&&!this.l)return Mf(this,b,c,f,g,e,a[1])}.bind(a)).then(function(){this.f||this.l||(b.xa=!1,b.Gb=!1,b.ra||this.a.Ab(),Cf(this,b,0),Nf(this,g))}.bind(a))["catch"](function(a){this.f||this.l||(b.xa=!1,this.b.presentationTimeline.$()&&this.g.infiniteRetriesForLiveStreams&&(1001==a.code||1002==
a.code||1003==a.code)?"text"==b.type&&this.g.ignoreTextStreamFailures&&1001==a.code?delete this.c.text:(a.severity=1,this.a.onError(a),Cf(this,b,4)):3017==a.code?Of(this,b,a):"text"==b.type&&this.g.ignoreTextStreamFailures?delete this.c.text:(b.tb=!0,a.severity=2,this.a.onError(a)))}.bind(a))}function Of(a,b,c){if(!Na(a.c).some(function(a){return a!=b&&a.Gb})){var d=Math.round(100*a.i);if(20<d)a.i-=.2;else if(4<d)a.i-=.04;else{b.tb=!0;a.l=!0;a.a.onError(c);return}b.Gb=!0}Cf(a,b,4)}
function Kf(a,b,c,d){if(!b.cb)return Promise.resolve();c=Mb(a.a.K,b.type,a.b.periods[c].startTime-b.stream.presentationTimeOffset,d);if(!b.stream.initSegmentReference)return c;a=Lf(a,b.stream.initSegmentReference).then(function(a){if(!this.f)return Jb(this.a.K,b.type,a,null,null)}.bind(a))["catch"](function(a){b.cb=!0;return Promise.reject(a)});return Promise.all([c,a])}
function Mf(a,b,c,d,e,f,g){e.containsEmsgBoxes&&(new Q).da("emsg",a.Ed.bind(a,d,f)).parse(g);return Pf(a,b,c).then(function(){if(!this.f)return Jb(this.a.K,b.type,g,f.startTime+d.startTime,f.endTime+d.startTime)}.bind(a)).then(function(){if(!this.f)return b.Fa=e,b.ea=f,Promise.resolve()}.bind(a))}
k.Ed=function(a,b,c){var d=c.s.Db(),e=c.s.Db(),f=c.s.D(),g=c.s.D(),h=c.s.D(),l=c.s.D();c=c.s.Ka(c.s.H.byteLength-c.s.u);a=a.startTime+b.startTime+g/f;if("urn:mpeg:dash:event:2012"==d)this.a.kd();else this.a.onEvent(new I("emsg",{detail:{startTime:a,endTime:a+h/f,schemeIdUri:d,value:e,timescale:f,presentationTimeDelta:g,eventDuration:h,id:l,messageData:c}}))};
function Pf(a,b,c){var d=Gb(a.a.K,b.type);if(null==d)return Promise.resolve();c=c-d-a.g.bufferBehind;return 0>=c?Promise.resolve():a.a.K.remove(b.type,d,d+c).then(function(){}.bind(a))}function Nf(a,b){if(!a.v&&(a.v=Na(a.c).every(function(a){return"text"==a.type?!0:!a.ra&&!a.sa&&a.ea}),a.v)){var c=ic(a.b,b);a.h[c]||Ff(a,c).then(function(){this.a.ac()}.bind(a))["catch"](y);for(c=0;c<a.b.periods.length;++c)Ff(a,c)["catch"](y);a.a.wd&&a.a.wd()}}
function Hf(a,b){if(b.wa!=ic(a.b,b.stream)){var c=b.wa,d=Na(a.c);d.every(function(a){return a.wa==c})&&d.every(Qf)&&Ff(a,c).then(function(){if(!this.f&&d.every(function(a){var b=ic(this.b,a.stream);return Qf(a)&&a.wa==c&&b!=c}.bind(this))){var a=this.b.periods[c],b=this.a.bc(a),g;for(g in this.c)if(!b[g]&&"text"!=g){this.a.onError(new t(2,5,5005));return}for(g in b)if(!this.c[g])if("text"==g)uf(this,{text:b.text},a.startTime),delete b[g];else{this.a.onError(new t(2,5,5005));return}for(g in this.c)(a=
b[g])?(yf(this,g,a,!1),Cf(this,this.c[g],0)):delete this.c[g];this.a.ac()}}.bind(a))["catch"](y)}}function Qf(a){return!a.xa&&null==a.qa&&!a.ra&&!a.sa}function Lf(a,b){var c=C(b.a(),a.g.retryParameters);if(b.X||null!=b.M){var d="bytes="+b.X+"-";null!=b.M&&(d+=b.M);c.headers.Range=d}return a.a.dd.request(1,c).then(function(a){return a.data})}
function Af(a,b,c){b.ra=!1;b.kb=!1;b.sa=!0;Lb(a.a.K,b.type).then(function(){if(!this.f&&c){var a=this.a.K,e=b.type;return"text"==e?Promise.resolve():Kb(a,e,a.Oc.bind(a,e))}}.bind(a)).then(function(){this.f||(b.Fa=null,b.ea=null,b.sa=!1,b.endOfStream=!1,Cf(this,b,0))}.bind(a))}function Cf(a,b,c){b.qa=window.setTimeout(a.ke.bind(a,b),1E3*c)}function tf(a){null!=a.qa&&(window.clearTimeout(a.qa),a.qa=null)};function Rf(a,b){return new Promise(function(c,d){var e=new XMLHttpRequest;e.open(b.method,a,!0);e.responseType="arraybuffer";e.timeout=b.retryParameters.timeout;e.withCredentials=b.allowCrossSiteCredentials;e.onload=function(b){b=b.target;var e=b.getAllResponseHeaders().split("\r\n").reduce(function(a,b){var c=b.split(": ");a[c[0].toLowerCase()]=c.slice(1).join(": ");return a},{});if(200<=b.status&&299>=b.status&&202!=b.status)b.responseURL&&(a=b.responseURL),c({uri:a,data:b.response,headers:e,fromCache:!!e["x-shaka-from-cache"]});
else{var f=null;try{f=Ta(b.response)}catch(m){}d(new t(401==b.status||403==b.status?2:1,1,1001,a,b.status,f,e))}};e.onerror=function(){d(new t(1,1,1002,a))};e.ontimeout=function(){d(new t(1,1,1003,a))};for(var f in b.headers)e.setRequestHeader(f,b.headers[f]);e.send(b.body)})}n("shaka.net.HttpPlugin",Rf);Ea.http=Rf;Ea.https=Rf;function Sf(){this.a=null;this.b=[];this.c={}}k=Sf.prototype;k.init=function(a,b){return Tf(this,a,b).then(function(){var b=Object.keys(a);return Promise.all(b.map(function(a){return Uf(this,a).then(function(b){this.c[a]=b}.bind(this))}.bind(this)))}.bind(this))};k.m=function(){return Promise.all(this.b.map(function(a){try{a.transaction.abort()}catch(b){}return a.L["catch"](y)})).then(function(){this.a&&(this.a.close(),this.a=null)}.bind(this))};
k.get=function(a,b){var c;return Vf(this,a,"readonly",function(a){c=a.get(b)}).then(function(){return c.result})};k.forEach=function(a,b){return Vf(this,a,"readonly",function(a){a.openCursor().onsuccess=function(a){if(a=a.target.result)b(a.value),a["continue"]()}})};function Wf(a,b,c){return Vf(a,b,"readwrite",function(a){a.put(c)})}k.remove=function(a,b){return Vf(this,a,"readwrite",function(a){a["delete"](b)})};
function Xf(a,b,c){return Vf(a,"segment","readwrite",function(a){for(var d=0;d<b.length;d++)a["delete"](b[d]).onsuccess=c||function(){}})}function Uf(a,b){var c=0;return Vf(a,b,"readonly",function(a){a.openCursor(null,"prev").onsuccess=function(a){(a=a.target.result)&&(c=a.key+1)}}).then(function(){return c})}
function Vf(a,b,c,d){var e={transaction:a.a.transaction([b],c),L:new A};e.transaction.oncomplete=function(){this.b.splice(this.b.indexOf(e),1);e.L.resolve()}.bind(a);e.transaction.onabort=function(a){this.b.splice(this.b.indexOf(e),1);Yf(e.transaction,e.L,a)}.bind(a);e.transaction.onerror=function(a){a.preventDefault()}.bind(a);b=e.transaction.objectStore(b);d(b);a.b.push(e);return e.L}
function Tf(a,b,c){var d=window.indexedDB.open("shaka_offline_db",1),e=!1,f=new A;d.onupgradeneeded=function(a){e=!0;a=a.target.result;for(var c in b)a.createObjectStore(c,{keyPath:b[c]})};d.onsuccess=function(a){c&&!e?(a.target.result.close(),setTimeout(function(){Tf(this,b,c-1).then(f.resolve,f.reject)}.bind(this),1E3)):(this.a=a.target.result,f.resolve())}.bind(a);d.onerror=Yf.bind(null,d,f);return f}
function Yf(a,b,c){a.error?b.reject(new t(2,9,9001,a.error)):b.reject(new t(2,9,9002));c.preventDefault()};var Zf={manifest:"key",segment:"key"};function $f(a){var b=ag(a.periods[0],[],new T(null,0)),c=Zb(b,null,null),b=ac(b,null);c.push.apply(c,b);return{offlineUri:"offline:"+a.key,originalManifestUri:a.originalManifestUri,duration:a.duration,size:a.size,expiration:void 0==a.expiration?Infinity:a.expiration,tracks:c,appMetadata:a.appMetadata}}
function ag(a,b,c){var d=a.streams.filter(function(a){return"text"==a.contentType}),e=a.streams.filter(function(a){return"audio"==a.contentType}),f=a.streams.filter(function(a){return"video"==a.contentType});b=bg(e,f,b);d=d.map(cg);a.streams.forEach(function(a){a=dg(a);c.Ha(0,a)});return{startTime:a.startTime,variants:b,textStreams:d}}function dg(a){return a.segments.map(function(a,c){return new O(c,a.startTime,a.endTime,function(){return[a.uri]},0,null)})}
function bg(a,b,c){var d=[];if(!a.length&&!b.length)return d;a.length?b.length||(b=[null]):a=[null];for(var e=0,f=0;f<a.length;f++)for(var g=0;g<b.length;g++)if(eg(a[f],b[g])){var h=a[f];var l=b[g],m=c;h={id:e++,language:h?h.language:"",primary:!!h&&h.primary||!!l&&l.primary,audio:cg(h),video:cg(l),bandwidth:0,drmInfos:m,allowedByApplication:!0,allowedByKeySystem:!0};d.push(h)}return d}
function eg(a,b){if(!(a&&b&&a.variantIds&&b.variantIds))return!0;for(var c=0;c<a.variantIds.length;c++)if(b.variantIds.some(function(b){return b==a.variantIds[c]}))return!0;return!1}
function cg(a){if(!a)return null;var b=dg(a),b=new S(b);return{id:a.id,createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:b.find.bind(b),getSegmentReference:b.get.bind(b),initSegmentReference:a.initSegmentUri?new Zc(function(){return[a.initSegmentUri]},0,null):null,presentationTimeOffset:a.presentationTimeOffset,mimeType:a.mimeType,codecs:a.codecs,width:a.width||void 0,height:a.height||void 0,frameRate:a.frameRate||void 0,kind:a.kind,encrypted:a.encrypted,keyId:a.keyId,language:a.language,
label:a.label||null,type:a.contentType,primary:a.primary,trickModeVideo:null,containsEmsgBoxes:!1,roles:[]}}function fg(){return window.indexedDB?new Sf:null};function gg(a,b,c,d){this.b={};this.l=[];this.o=d;this.j=a;this.v=b;this.A=c;this.i=this.a=null;this.f=this.g=this.h=this.c=0}gg.prototype.m=function(){var a=this.j,b=this.l,c=this.i||Promise.resolve(),c=c.then(function(){return Xf(a,b)});this.b={};this.l=[];this.i=this.a=this.A=this.v=this.j=this.o=null;return c};function hg(a,b,c,d,e){a.b[b]=a.b[b]||[];a.b[b].push({uris:c.a(),X:c.X,M:c.M,Rb:d,Hb:e})}
function ig(a,b){a.c=0;a.h=0;a.g=0;a.f=0;Na(a.b).forEach(function(a){a.forEach(function(a){null!=a.M?this.c+=a.M-a.X+1:this.g+=a.Rb}.bind(this))}.bind(a));a.a=b;a.a.size=a.c;var c=Na(a.b).map(function(a){var b=0,c=function(){if(!this.o)return Promise.reject(new t(2,9,9002));if(b>=a.length)return Promise.resolve();var d=a[b++];return jg(this,d).then(c)}.bind(this);return c()}.bind(a));a.b={};a.i=Promise.all(c).then(function(){return Wf(this.j,"manifest",b)}.bind(a)).then(function(){this.l=[]}.bind(a));
return a.i}
function jg(a,b){var c=C(b.uris,a.A);if(b.X||null!=b.M)c.headers.Range="bytes="+b.X+"-"+(null==b.M?"":b.M);var d;return a.v.request(1,c).then(function(a){if(!this.a)return Promise.reject(new t(2,9,9002));d=a.data.byteLength;this.l.push(b.Hb.key);b.Hb.data=a.data;return Wf(this.j,"segment",b.Hb)}.bind(a)).then(function(){if(!this.a)return Promise.reject(new t(2,9,9002));null==b.M?(this.a.size+=d,this.f+=b.Rb):this.h+=d;var a=(this.h+this.f)/(this.c+this.g),c=$f(this.a);this.o.progressCallback(c,a)}.bind(a))}
;function kg(){this.a=-1}k=kg.prototype;k.configure=function(){};k.start=function(a){var b=/^offline:([0-9]+)$/.exec(a);if(!b)return Promise.reject(new t(2,1,9004,a));var c=Number(b[1]),d=fg();this.a=c;return d?d.init(Zf).then(function(){return d.get("manifest",c)}).then(function(a){if(!a)throw new t(2,9,9003,c);return lg(a)}).then(function(a){return d.m().then(function(){return a})},function(a){return d.m().then(function(){throw a;})}):Promise.reject(new t(2,9,9E3))};k.stop=function(){return Promise.resolve()};
k.update=function(){};k.onExpirationUpdated=function(a,b){var c=fg();c.init(Zf).then(function(){return c.get("manifest",this.a)}.bind(this)).then(function(d){if(d&&!(0>d.sessionIds.indexOf(a))&&(void 0==d.expiration||d.expiration>b))return d.expiration=b,Wf(c,"manifest",d)})["catch"](function(){}).then(function(){return c.m()})};
function lg(a){var b=new T(null,0);b.pa(a.duration);var c=a.drmInfo?[a.drmInfo]:[];return{presentationTimeline:b,minBufferTime:10,offlineSessionIds:a.sessionIds,periods:a.periods.map(function(a){return ag(a,c,b)})}}Dd["application/x-offline-manifest"]=kg;function mg(a){if(/^offline:([0-9]+)$/.exec(a)){var b={uri:a,data:new ArrayBuffer(0),headers:{"content-type":"application/x-offline-manifest"}};return Promise.resolve(b)}if(b=/^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a)){var c=Number(b[1]),d=fg();return d?d.init(Zf).then(function(){return d.get("segment",c)}).then(function(b){return d.m().then(function(){if(!b)throw new t(2,9,9003,c);return{uri:a,data:b.data,headers:{}}})}):Promise.reject(new t(2,9,9E3))}return Promise.reject(new t(2,1,9004,a))}
n("shaka.offline.OfflineScheme",mg);Ea.offline=mg;function ng(){this.a=Promise.resolve();this.b=this.c=this.f=!1;this.i=new Promise(function(a){this.g=a}.bind(this))}ng.prototype.then=function(a){this.a=this.a.then(a).then(function(a){return this.b?(this.g(),Promise.reject(this.h)):Promise.resolve(a)}.bind(this));return this};function og(a){a.f||(a.a=a.a.then(function(a){this.c=!0;return Promise.resolve(a)}.bind(a),function(a){this.c=!0;return this.b?(this.g(),Promise.reject(this.h)):Promise.reject(a)}.bind(a)));a.f=!0;return a.a}
ng.prototype.cancel=function(a){if(this.c)return Promise.resolve();this.b=!0;this.h=a;return this.i};function W(a,b){p.call(this);this.O=!1;this.f=a;this.A=null;this.l=new D;this.Qb=new H;this.Ya=this.c=this.h=this.a=this.v=this.g=this.Wa=this.ja=this.N=this.j=this.o=null;this.Dc=1E9;this.Va=[];this.ka=!1;this.Za=!0;this.la=this.J=null;this.G={};this.Xa=[];this.B={};this.b=pg(this);this.ob={width:Infinity,height:Infinity};this.i=qg();this.Ua=0;this.ia=this.b.preferredAudioLanguage;this.Ca=this.b.preferredTextLanguage;this.lb=this.mb="";b&&b(this);this.o=new B(this.de.bind(this));this.Wa=rg(this);
for(var c=0;c<this.f.textTracks.length;++c){var d=this.f.textTracks[c];d.mode="disabled";"Shaka Player TextTrack"==d.label&&(this.A=d)}this.A||(this.A=this.f.addTextTrack("subtitles","Shaka Player TextTrack"));this.A.mode="hidden";E(this.l,this.f,"error",this.yd.bind(this))}ba(W);n("shaka.Player",W);
W.prototype.m=function(){this.O=!0;var a=Promise.resolve();this.J&&(a=this.J.cancel(new t(2,7,7E3)));return a.then(function(){var a=Promise.all([this.la,sg(this),this.l?this.l.m():null,this.o?this.o.m():null]);this.b=this.o=this.Qb=this.l=this.A=this.f=null;return a}.bind(this))};W.prototype.destroy=W.prototype.m;W.version="v2.1.4";var tg={};W.registerSupportPlugin=function(a,b){tg[a]=b};
W.isBrowserSupported=function(){return!!window.Promise&&!!window.Uint8Array&&!!Array.prototype.forEach&&!!window.MediaSource&&!!window.MediaSource.isTypeSupported&&!!window.MediaKeys&&!!window.navigator&&!!window.navigator.requestMediaKeySystemAccess&&!!window.MediaKeySystemAccess&&!!window.MediaKeySystemAccess.prototype.getConfiguration};W.probeSupport=function(){return qb().then(function(a){var b=Fd(),c=Eb();a={manifest:b,media:c,drm:a};for(var d in tg)a[d]=tg[d]();return a})};
W.prototype.load=function(a,b,c){var d=this.hb(),e=new ng;this.J=e;this.dispatchEvent(new I("loading"));var f=Date.now();return og(e.then(function(){return d}).then(function(){this.i=qg();E(this.l,this.f,"playing",this.Sa.bind(this));E(this.l,this.f,"pause",this.Sa.bind(this));E(this.l,this.f,"ended",this.Sa.bind(this));return Gd(a,this.o,this.b.manifest.retryParameters,c)}.bind(this)).then(function(b){this.h=new b;this.h.configure(this.b.manifest);b={networkingEngine:this.o,filterPeriod:this.fb.bind(this),
onTimelineRegionAdded:this.xd.bind(this),onEvent:this.gb.bind(this),onError:this.ya.bind(this)};return 2<this.h.start.length?this.h.start(a,this.o,b.filterPeriod,b.onError,b.onEvent):this.h.start(a,b)}.bind(this)).then(function(b){if(0==b.periods.length)throw new t(2,4,4014);this.c=b;this.Ya=a;this.j=new bb(this.o,this.ya.bind(this),this.be.bind(this),this.ae.bind(this));this.j.configure(this.b.drm);return this.j.init(b,!1)}.bind(this)).then(function(){this.c.periods.forEach(this.fb.bind(this));this.Ua=
Date.now()/1E3;this.ia=this.b.preferredAudioLanguage;this.Ca=this.b.preferredTextLanguage;return Promise.all([eb(this.j,this.f),this.Wa])}.bind(this)).then(function(){this.b.abr.manager.init(this.Lb.bind(this));this.g=new ff(this.f,this.c,this.b.streaming,b||null,this.ce.bind(this),this.gb.bind(this));this.v=new of(this.f,this.c,this.b.streaming,this.zc.bind(this),this.gb.bind(this),this.$d.bind(this));this.ja=new Db(this.f,this.N,this.A);this.a=new sf(this.c,{Oa:this.g,K:this.ja,dd:this.o,bc:this.ed.bind(this),
ac:this.Gc.bind(this),onError:this.ya.bind(this),onEvent:this.gb.bind(this),kd:this.ld.bind(this),Ab:this.ud.bind(this)});this.a.configure(this.b.streaming);ug(this);return this.a.init()}.bind(this)).then(function(){if(this.b.streaming.startAtSegmentBoundary){var a=vg(this,jf(this.g));gf(this.g,a)}this.c.periods.forEach(this.fb.bind(this));wg(this);xg(this);var a=V(this.a),b=dc(a,this.ia);this.b.abr.manager.setVariants(b);a.variants.some(function(a){return a.primary});this.Xa.forEach(this.v.v.bind(this.v));
this.Xa=[];La(this.l,this.f,"loadeddata",function(){this.i.loadLatency=(Date.now()-f)/1E3}.bind(this));this.J=null}.bind(this)))["catch"](function(a){this.J==e&&(this.J=null,this.dispatchEvent(new I("unloading")));return Promise.reject(a)}.bind(this))};W.prototype.load=W.prototype.load;
function ug(a){function b(a){return(a.video?a.video.codecs.split(".")[0]:"")+"-"+(a.audio?a.audio.codecs.split(".")[0]:"")}var c={};a.c.periods.forEach(function(a){a.variants.forEach(function(a){var d=b(a);d in c||(c[d]=[]);c[d].push(a)})});var d=null,e=Infinity;Qa(c,function(a,b){var c=0,f=0;b.forEach(function(a){c+=a.bandwidth;++f});var g=c/f;g<e&&(d=a,e=g)});a.c.periods.forEach(function(a){a.variants=a.variants.filter(function(a){return b(a)==d?!0:!1})})}
function rg(a){a.N=new MediaSource;var b=new A;E(a.l,a.N,"sourceopen",b.resolve);a.f.src=window.URL.createObjectURL(a.N);return b}W.prototype.configure=function(a){a.abr&&a.abr.manager&&a.abr.manager!=this.b.abr.manager&&(this.b.abr.manager.stop(),a.abr.manager.init(this.Lb.bind(this)));Ca(this.b,a,pg(this),yg(),"");zg(this)};W.prototype.configure=W.prototype.configure;
function zg(a){a.h&&a.h.configure(a.b.manifest);a.j&&a.j.configure(a.b.drm);if(a.a){a.a.configure(a.b.streaming);try{a.c.periods.forEach(a.fb.bind(a))}catch(b){a.ya(b)}Ag(a,V(a.a))}a.b.abr.enabled&&!a.Za?a.b.abr.manager.enable():a.b.abr.manager.disable();a.b.abr.manager.setDefaultEstimate(a.b.abr.defaultBandwidthEstimate);a.b.abr.manager.setRestrictions(a.b.abr.restrictions)}W.prototype.getConfiguration=function(){var a=pg(this);Ca(a,this.b,pg(this),yg(),"");return a};
W.prototype.getConfiguration=W.prototype.getConfiguration;W.prototype.Rd=function(){var a=pg(this);a.abr&&a.abr.manager&&a.abr.manager!=this.b.abr.manager&&(this.b.abr.manager.stop(),a.abr.manager.init(this.Lb.bind(this)));this.b=pg(this);zg(this)};W.prototype.resetConfiguration=W.prototype.Rd;W.prototype.Sc=function(){return this.f};W.prototype.getMediaElement=W.prototype.Sc;W.prototype.Wb=function(){return this.o};W.prototype.getNetworkingEngine=W.prototype.Wb;W.prototype.Rc=function(){return this.Ya};
W.prototype.getManifestUri=W.prototype.Rc;W.prototype.$=function(){return this.c?this.c.presentationTimeline.$():!1};W.prototype.isLive=W.prototype.$;W.prototype.va=function(){return this.c?this.c.presentationTimeline.va():!1};W.prototype.isInProgress=W.prototype.va;W.prototype.Td=function(){var a=0,b=0;this.c&&(b=this.c.presentationTimeline,a=b.ma(),b=b.bb());return{start:a,end:b}};W.prototype.seekRange=W.prototype.Td;W.prototype.keySystem=function(){return this.j?this.j.keySystem():""};
W.prototype.keySystem=W.prototype.keySystem;W.prototype.drmInfo=function(){return this.j?this.j.b:null};W.prototype.drmInfo=W.prototype.drmInfo;W.prototype.ab=function(){return this.j?this.j.ab():Infinity};W.prototype.getExpiration=W.prototype.ab;W.prototype.$c=function(){return this.ka};W.prototype.isBuffering=W.prototype.$c;
W.prototype.hb=function(){if(this.O)return Promise.resolve();this.dispatchEvent(new I("unloading"));var a=Promise.resolve();this.J&&(a=this.J.cancel(new t(2,7,7E3)));return a.then(function(){this.la||(this.la=Bg(this).then(function(){this.la=null}.bind(this)));return this.la}.bind(this))};W.prototype.unload=W.prototype.hb;W.prototype.rb=function(){return this.g?this.g.rb():0};W.prototype.getPlaybackRate=W.prototype.rb;W.prototype.ne=function(a){this.g&&lf(this.g,a);this.a&&xf(this.a,1!=a)};
W.prototype.trickPlay=W.prototype.ne;W.prototype.Hc=function(){this.g&&lf(this.g,1);this.a&&xf(this.a,!1)};W.prototype.cancelTrickPlay=W.prototype.Hc;W.prototype.getTracks=function(){return this.Yb().concat(this.Xb())};W.prototype.getTracks=W.prototype.getTracks;W.prototype.Wd=function(a,b){"text"==a.type?this.tc(a):(this.configure({abr:{enabled:!1}}),this.uc(a,b))};W.prototype.selectTrack=W.prototype.Wd;
W.prototype.Yb=function(){if(!this.c)return[];var a=hc(this.c,jf(this.g)),b=this.B[a]||{};return Zb(this.c.periods[a],b.audio,b.video)};W.prototype.getVariantTracks=W.prototype.Yb;W.prototype.Xb=function(){if(!this.c)return[];var a=hc(this.c,jf(this.g));return ac(this.c.periods[a],(this.B[a]||{}).text).filter(function(a){return 0>this.Va.indexOf(a.id)}.bind(this))};W.prototype.getTextTracks=W.prototype.Xb;
W.prototype.tc=function(a){if(this.a&&(a=cc(V(this.a),a))){Cg(this,a,!1);var b={};b.text=a;Dg(this,b,!0)}};W.prototype.selectTextTrack=W.prototype.tc;
W.prototype.uc=function(a,b){if(this.a){var c={},d=bc(V(this.a),a),e=vf(this.a);if(d){if(!d.allowedByApplication||!d.allowedByKeySystem)return;d.audio&&(Eg(this,d.audio),d.audio!=e.audio&&(c.audio=d.audio));d.video&&(Eg(this,d.video),d.video!=e.video&&(c.video=d.video))}Na(c).forEach(function(a){Cg(this,a,!1)}.bind(this));(d=e.text)&&(c.text=d);Dg(this,c,b)}};W.prototype.selectVariantTrack=W.prototype.uc;
W.prototype.Pc=function(){return this.a?$b(V(this.a).variants).map(function(a){return a.language}).filter(Aa):[]};W.prototype.getAudioLanguages=W.prototype.Pc;W.prototype.Yc=function(){return this.a?V(this.a).textStreams.map(function(a){return a.language}).filter(Aa):[]};W.prototype.getTextLanguages=W.prototype.Yc;W.prototype.Ud=function(a,b){if(this.a){var c=V(this.a);this.ia=a;this.mb=b||"";Ag(this,c)}};W.prototype.selectAudioLanguage=W.prototype.Ud;
W.prototype.Vd=function(a,b){if(this.a){var c=V(this.a);this.Ca=a;this.lb=b||"";Ag(this,c)}};W.prototype.selectTextLanguage=W.prototype.Vd;W.prototype.bd=function(){return"showing"==this.A.mode};W.prototype.isTextTrackVisible=W.prototype.bd;W.prototype.Yd=function(a){this.A.mode=a?"showing":"hidden";Fg(this)};W.prototype.setTextTrackVisibility=W.prototype.Yd;W.prototype.Uc=function(){return this.c?new Date(1E3*this.c.presentationTimeline.f+1E3*this.f.currentTime):null};
W.prototype.getPlayheadTimeAsDate=W.prototype.Uc;
W.prototype.getStats=function(){Gg(this);this.Sa();var a=null,b=null,c=this.f&&this.f.getVideoPlaybackQuality?this.f.getVideoPlaybackQuality():{};this.g&&this.c&&(a=hc(this.c,jf(this.g)),b=this.B[a],b=gc(b.audio,b.video,this.c.periods[a].variants),a=b.video||{});a||(a={});b||(b={});return{width:a.width||0,height:a.height||0,streamBandwidth:b.bandwidth||0,decodedFrames:Number(c.totalVideoFrames),droppedFrames:Number(c.droppedVideoFrames),estimatedBandwidth:this.b.abr.manager.getBandwidthEstimate(),loadLatency:this.i.loadLatency,
playTime:this.i.playTime,bufferingTime:this.i.bufferingTime,switchHistory:Da(this.i.switchHistory),stateHistory:Da(this.i.stateHistory)}};W.prototype.getStats=W.prototype.getStats;
W.prototype.addTextTrack=function(a,b,c,d,e,f){if(!this.a)return Promise.reject();for(var g=V(this.a),h,l=0;l<this.c.periods.length;l++)if(this.c.periods[l]==g){if(l==this.c.periods.length-1){if(h=this.c.presentationTimeline.Y()-g.startTime,Infinity==h)return Promise.reject()}else h=this.c.periods[l+1].startTime-g.startTime;break}var m={id:this.Dc++,createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:function(){return 1},getSegmentReference:function(b){return 1!=b?null:new O(1,0,
h,function(){return[a]},0,null)},initSegmentReference:null,presentationTimeOffset:0,mimeType:d,codecs:e||"",kind:c,encrypted:!1,keyId:null,language:b,label:f||null,type:"text",primary:!1,trickModeVideo:null,containsEmsgBoxes:!1,roles:[]};this.Va.push(m.id);g.textStreams.push(m);return wf(this.a,m).then(function(){if(!this.O){var a=this.c.periods.indexOf(g),d=vf(this.a);d.text&&(this.B[a].text=d.text.id);this.Va.splice(this.Va.indexOf(m.id),1);Ag(this,g);wg(this);return{id:m.id,active:!1,type:"text",
bandwidth:0,language:b,label:f||null,kind:c,width:null,height:null}}}.bind(this))};W.prototype.addTextTrack=W.prototype.addTextTrack;W.prototype.Jb=function(a,b){this.ob.width=a;this.ob.height=b};W.prototype.setMaxHardwareResolution=W.prototype.Jb;function Cg(a,b,c){a.i.switchHistory.push({timestamp:Date.now()/1E3,id:b.id,type:b.type,fromAdaptation:c});Eg(a,b)}function Eg(a,b){var c=ic(a.c,b);a.B[c]||(a.B[c]={});a.B[c][b.type]=b.id}
function sg(a){a.l&&(a.l.ha(a.N,"sourceopen"),a.l.ha(a.f,"loadeddata"),a.l.ha(a.f,"playing"),a.l.ha(a.f,"pause"),a.l.ha(a.f,"ended"));a.f&&(a.f.removeAttribute("src"),a.f.load());var b=Promise.all([a.b?a.b.abr.manager.stop():null,a.j?a.j.m():null,a.ja?a.ja.m():null,a.g?a.g.m():null,a.v?a.v.m():null,a.a?a.a.m():null,a.h?a.h.stop():null]);a.j=null;a.ja=null;a.g=null;a.v=null;a.a=null;a.h=null;a.c=null;a.Ya=null;a.Wa=null;a.N=null;a.Xa=[];a.B={};a.G={};a.i=qg();return b}
function Bg(a){return a.h?sg(a).then(function(){this.O||(this.zc(!1),this.Wa=rg(this))}.bind(a)):Promise.resolve()}function yg(){return{".drm.servers":"",".drm.clearKeys":"",".drm.advanced":{distinctiveIdentifierRequired:!1,persistentStateRequired:!1,videoRobustness:"",audioRobustness:"",serverCertificate:null}}}
function pg(a){return{drm:{retryParameters:Fa(),servers:{},clearKeys:{},advanced:{},delayLicenseRequestUntilPlayed:!1},manifest:{retryParameters:Fa(),dash:{customScheme:function(a){if(a)return null},clockSyncUri:"",ignoreDrmInfo:!1},hls:{defaultTimeOffset:0}},streaming:{retryParameters:Fa(),infiniteRetriesForLiveStreams:!0,rebufferingGoal:2,bufferingGoal:10,bufferBehind:30,ignoreTextStreamFailures:!1,startAtSegmentBoundary:!1,smallGapLimit:.5,jumpLargeGaps:!1},abr:{manager:a.Qb,enabled:!0,defaultBandwidthEstimate:5E5,
restrictions:{minWidth:0,maxWidth:Infinity,minHeight:0,maxHeight:Infinity,minPixels:0,maxPixels:Infinity,minBandwidth:0,maxBandwidth:Infinity}},preferredAudioLanguage:"",preferredTextLanguage:"",restrictions:{minWidth:0,maxWidth:Infinity,minHeight:0,maxHeight:Infinity,minPixels:0,maxPixels:Infinity,minBandwidth:0,maxBandwidth:Infinity}}}
function qg(){return{width:NaN,height:NaN,streamBandwidth:NaN,decodedFrames:NaN,droppedFrames:NaN,estimatedBandwidth:NaN,loadLatency:NaN,playTime:0,bufferingTime:0,switchHistory:[],stateHistory:[]}}k=W.prototype;k.fb=function(a){var b=this.a?vf(this.a):{};Wb(this.j,b,a);b=0<$b(a.variants).length;Vb(a,this.b.restrictions,this.ob)&&this.a&&V(this.a)==a&&wg(this);a=1>$b(a.variants).length;if(!b)throw new t(2,4,4011);if(a)throw new t(2,4,4012);};
function Dg(a,b,c){for(var d in b){var e=b[d],f=c||!1;"text"==d&&(f=!0);a.Za?a.G[d]={stream:e,Kc:f}:yf(a.a,d,e,f)}}function Gg(a){if(a.c){var b=Date.now()/1E3;a.ka?a.i.bufferingTime+=b-a.Ua:a.i.playTime+=b-a.Ua;a.Ua=b}}
function vg(a,b){function c(a,b){if(!a)return null;var c=a.findSegmentPosition(b-e.startTime);return null==c?null:(c=a.getSegmentReference(c))?c.startTime+e.startTime:null}var d=vf(a.a),e=V(a.a),f=c(d.video,b),d=c(d.audio,b);return null!=f&&null!=d?Math.max(f,d):null!=f?f:null!=d?d:b}k.de=function(a,b){this.b.abr.manager.segmentDownloaded(a,b)};k.zc=function(a){Gg(this);this.ka=a;this.Sa();if(this.g){var b=this.g;a!=b.h&&(b.h=a,lf(b,b.g))}this.dispatchEvent(new I("buffering",{buffering:a}))};
k.$d=function(){wg(this)};k.Sa=function(){if(!this.O){var a=this.ka?"buffering":this.f.ended?"ended":this.f.paused?"paused":"playing";var b=Date.now()/1E3;if(this.i.stateHistory.length){var c=this.i.stateHistory[this.i.stateHistory.length-1];c.duration=b-c.timestamp;if(a==c.state)return}this.i.stateHistory.push({timestamp:b,state:a,duration:0})}};k.ce=function(){if(this.v){var a=this.v;a.c.forEach(a.o.bind(a,!0))}this.a&&Bf(this.a)};
function Hg(a,b,c,d,e){if(!c||1>c.length)return a.ya(new t(2,4,4012)),{};a.b.abr.manager.setVariants(c);a.b.abr.manager.setTextStreams(d);var f=[];e&&(f=["video","audio"],b.textStreams.length&&f.push("text"));e=vf(a.a);var g=a.a;var h=g.c.video||g.c.audio;g=h?g.b.periods[h.wa]:null;if(b=fc(e.audio,e.video,g?g.variants:b.variants)){b.allowedByApplication&&b.allowedByKeySystem||(f.push("audio"),f.push("video"));for(var l in e)b=e[l],"audio"==b.type&&b.language!=c[0].language?f.push(l):"text"==b.type&&
0<d.length&&b.language!=d[0].language&&f.push(l)}f=f.filter(Aa);if(0<f.length){c={};try{c=a.b.abr.manager.chooseStreams(f)}catch(m){a.ya(m)}return c}return{}}function Ag(a,b){var c={audio:!1,text:!1},d=dc(b,a.ia,c,a.mb),e=ec(b,a.Ca,c,a.lb),d=Hg(a,b,d,e),f;for(f in d)Cg(a,d[f],!0);Dg(a,d,!0);xg(a);d.text&&d.audio&&c.text&&d.text.language!=d.audio.language&&(a.A.mode="showing",Fg(a))}
k.ed=function(a){this.Za=!0;this.b.abr.manager.disable();var b=dc(a,this.ia,void 0,this.mb),c=ec(a,this.Ca,void 0,this.lb);a=Hg(this,a,b,c,!0);for(var d in this.G)a[d]=this.G[d].stream;this.G={};for(d in a)Cg(this,a[d],!0);return a};k.Gc=function(){this.Za=!1;this.b.abr.enabled&&this.b.abr.manager.enable();for(var a in this.G){var b=this.G[a];yf(this.a,a,b.stream,b.Kc)}this.G={}};k.ld=function(){this.h&&this.h.update&&this.h.update()};k.ud=function(){this.g&&this.g.Ab()};
k.Lb=function(a,b){var c=vf(this.a),d;for(d in a){var e=a[d];c[d]!=e?Cg(this,e,!0):delete a[d]}if(!Ma(a)&&this.a){for(d in a)yf(this.a,d,a[d],b||!1);xg(this)}};function xg(a){Promise.resolve().then(function(){this.O||this.dispatchEvent(new I("adaptation"))}.bind(a))}function wg(a){Promise.resolve().then(function(){this.O||this.dispatchEvent(new I("trackschanged"))}.bind(a))}function Fg(a){a.dispatchEvent(new I("texttrackvisibility"))}k.ya=function(a){this.O||this.dispatchEvent(new I("error",{detail:a}))};
k.xd=function(a){this.v?this.v.v(a):this.Xa.push(a)};k.gb=function(a){this.dispatchEvent(a)};k.yd=function(){if(this.f.error){var a=this.f.error.code;if(1!=a){var b=this.f.error.msExtendedCode;b&&(0>b&&(b+=Math.pow(2,32)),b=b.toString(16));this.ya(new t(2,3,3016,a,b))}}};
k.be=function(a){var b=["output-restricted","internal-error"],c=V(this.a),d=!1;c.variants.forEach(function(c){var e=[];c.audio&&e.push(c.audio);c.video&&e.push(c.video);e.forEach(function(e){var f=c.allowedByKeySystem;e.keyId&&(e=a[e.keyId],c.allowedByKeySystem=!!e&&0>b.indexOf(e));f!=c.allowedByKeySystem&&(d=!0)})});var e=vf(this.a);(e=fc(e.audio,e.video,c.variants))&&!e.allowedByKeySystem&&Ag(this,c);d&&wg(this)};
k.ae=function(a,b){if(this.h&&this.h.onExpirationUpdated)this.h.onExpirationUpdated(a,b);this.dispatchEvent(new I("expirationupdated"))};function X(a){if(!a||a.constructor!=W)throw new t(2,9,9008);this.a=fg();this.f=a;this.i=Ig(this);this.b=null;this.v=!1;this.j=null;this.g=-1;this.l=0;this.c=null;this.h=new gg(this.a,a.o,a.getConfiguration().streaming.retryParameters,this.i)}n("shaka.offline.Storage",X);function Jg(){return!!window.indexedDB}X.support=Jg;X.prototype.m=function(){var a=this.a,b=this.h?this.h.m()["catch"](function(){}).then(function(){if(a)return a.m()}):Promise.resolve();this.i=this.f=this.h=this.a=null;return b};
X.prototype.destroy=X.prototype.m;X.prototype.configure=function(a){Ca(this.i,a,Ig(this),{},"")};X.prototype.configure=X.prototype.configure;
X.prototype.le=function(a,b,c){function d(a){f=a}if(this.v)return Promise.reject(new t(2,9,9006));this.v=!0;var e,f=null;return Kg(this).then(function(){Y(this);return Lg(this,a,d,c)}.bind(this)).then(function(c){Y(this);this.c=c.manifest;this.b=c.Lc;if(this.c.presentationTimeline.$()||this.c.presentationTimeline.va())throw new t(2,9,9005,a);this.c.periods.forEach(this.o.bind(this));this.g=this.a.c.manifest++;this.l=0;c=this.c.periods.map(this.B.bind(this));var d=this.b.b,f=jb(this.b);if(d){if(!f.length)throw new t(2,
9,9007,a);d.initData=[]}e={key:this.g,originalManifestUri:a,duration:this.l,size:0,expiration:this.b.ab(),periods:c,sessionIds:f,drmInfo:d,appMetadata:b};return ig(this.h,e)}.bind(this)).then(function(){Y(this);if(f)throw f;return Mg(this)}.bind(this)).then(function(){return $f(e)}.bind(this))["catch"](function(a){return Mg(this)["catch"](y).then(function(){throw a;})}.bind(this))};X.prototype.store=X.prototype.le;
X.prototype.remove=function(a){function b(a){6013!=a.code&&(e=a)}var c=a.offlineUri,d=/^offline:([0-9]+)$/.exec(c);if(!d)return Promise.reject(new t(2,9,9004,c));var e=null,f,g,h=Number(d[1]);return Kg(this).then(function(){Y(this);return this.a.get("manifest",h)}.bind(this)).then(function(a){Y(this);if(!a)throw new t(2,9,9003,c);f=a;a=lg(f);g=new bb(this.f.o,b,function(){},function(){});g.configure(this.f.getConfiguration().drm);return g.init(a,!0)}.bind(this)).then(function(){return gb(g,f.sessionIds)}.bind(this)).then(function(){return g.m()}.bind(this)).then(function(){Y(this);
if(e)throw e;var b=f.periods.map(function(a){return a.streams.map(function(a){var b=a.segments.map(function(a){a=/^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a.uri);return Number(a[1])});a.initSegmentUri&&(a=/^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a.initSegmentUri),b.push(Number(a[1])));return b}).reduce(x,[])}).reduce(x,[]),c=0,d=b.length,g=this.i.progressCallback;return Xf(this.a,b,function(){c++;g(a,c/d)})}.bind(this)).then(function(){Y(this);this.i.progressCallback(a,1);return this.a.remove("manifest",
h)}.bind(this))};X.prototype.remove=X.prototype.remove;X.prototype.list=function(){var a=[];return Kg(this).then(function(){Y(this);return this.a.forEach("manifest",function(b){a.push($f(b))})}.bind(this)).then(function(){return a})};X.prototype.list=X.prototype.list;
function Lg(a,b,c,d){function e(){}var f=a.f.o,g=a.f.getConfiguration(),h,l,m;return Gd(b,f,g.manifest.retryParameters,d).then(function(a){Y(this);m=new a;m.configure(g.manifest);return m.start(b,{networkingEngine:f,filterPeriod:this.o.bind(this),onTimelineRegionAdded:function(){},onEvent:function(){},onError:c})}.bind(a)).then(function(a){Y(this);h=a;l=new bb(f,c,e,function(){});l.configure(g.drm);return l.init(h,!0)}.bind(a)).then(function(){Y(this);return Ng(h)}.bind(a)).then(function(){Y(this);
return fb(l)}.bind(a)).then(function(){Y(this);return m.stop()}.bind(a)).then(function(){Y(this);return{manifest:h,Lc:l}}.bind(a))["catch"](function(a){if(m)return m.stop().then(function(){throw a;});throw a;})}
X.prototype.A=function(a){for(var b=[],c=Sb(this.f.getConfiguration().preferredAudioLanguage),d=[0,Qb,Rb],e=a.filter(function(a){return"variant"==a.type}),d=d.map(function(a){return e.filter(function(b){b=Sb(b.language);return Pb(a,c,b)})}),f,g=0;g<d.length;g++)if(d[g].length){f=d[g];break}f||(d=e.filter(function(a){return a.primary}),d.length&&(f=d));f||(f=e,e.map(function(a){return a.language}).filter(Aa));var h=f.filter(function(a){return a.height&&480>=a.height});h.length&&(h.sort(function(a,
b){return b.height-a.height}),f=h.filter(function(a){return a.height==h[0].height}));f.sort(function(a,b){return a.bandwidth-b.bandwidth});f.length&&b.push(f[Math.floor(f.length/2)]);b.push.apply(b,a.filter(function(a){return"text"==a.type}));return b};function Ig(a){return{trackSelectionCallback:a.A.bind(a),progressCallback:function(a,c){if(a||c)return null}}}function Kg(a){return a.a?a.a.a?Promise.resolve():a.a.init(Zf):Promise.reject(new t(2,9,9E3))}
X.prototype.o=function(a){var b={};if(this.j){var c=this.j.filter(function(a){return"variant"==a.type}),d=null;c.length&&(d=bc(a,c[0]));d&&(d.video&&(b.video=d.video),d.audio&&(b.audio=d.audio))}Wb(this.b,b,a);Vb(a,this.f.getConfiguration().restrictions,{width:Infinity,height:Infinity})};function Mg(a){var b=a.b?a.b.m():Promise.resolve();a.b=null;a.c=null;a.v=!1;a.j=null;a.g=-1;return b}
function Ng(a){var b=a.periods.map(function(a){return a.variants}).reduce(x,[]).map(function(a){var b=[];a.audio&&b.push(a.audio);a.video&&b.push(a.video);return b}).reduce(x,[]).filter(Aa);a=a.periods.map(function(a){return a.textStreams}).reduce(x,[]);b.push.apply(b,a);return Promise.all(b.map(function(a){return a.createSegmentIndex()}))}
X.prototype.B=function(a){var b,c,d=Zb(a,null,null),e=ac(a,null),d=this.i.trackSelectionCallback(d.concat(e));this.j||(this.j=d,this.c.periods.forEach(this.o.bind(this)));for(e=d.length-1;0<e;--e){var f=!1;for(c=e-1;0<=c;--c)if(d[e].type==d[c].type&&d[e].kind==d[c].kind&&d[e].language==d[c].language){f=!0;break}if(f)break}f=[];for(e=0;e<d.length;e++)(b=bc(a,d[e]))?(b.audio&&((c=f.filter(function(a){return a.id==b.audio.id})[0])?c.variantIds.push(b.id):(c=b.video?b.bandwidth/2:b.bandwidth,f.push(Og(this,
a,b.audio,c,b.id)))),b.video&&((c=f.filter(function(a){return a.id==b.video.id})[0])?c.variantIds.push(b.id):(c=b.audio?b.bandwidth/2:b.bandwidth,f.push(Og(this,a,b.video,c,b.id))))):f.push(Og(this,a,cc(a,d[e]),0));return{startTime:a.startTime,streams:f}};
function Og(a,b,c,d,e){var f=[],g=a.c.presentationTimeline.ma();var h=g;for(var l=c.findSegmentPosition(g),m=null!=l?c.getSegmentReference(l):null;m;)h=a.a.c.segment++,hg(a.h,c.type,m,(m.endTime-m.startTime)*d/8,{key:h,data:null,manifestKey:a.g,streamNumber:c.id,segmentNumber:h}),f.push({startTime:m.startTime,endTime:m.endTime,uri:"offline:"+a.g+"/"+c.id+"/"+h}),h=m.endTime+b.startTime,m=c.getSegmentReference(++l);a.l=Math.max(a.l,h-g);b=null;c.initSegmentReference&&(h=a.a.c.segment++,b="offline:"+
a.g+"/"+c.id+"/"+h,hg(a.h,c.contentType,c.initSegmentReference,0,{key:h,data:null,manifestKey:a.g,streamNumber:c.id,segmentNumber:-1}));a=[];null!=e&&a.push(e);return{id:c.id,primary:c.primary,presentationTimeOffset:c.presentationTimeOffset||0,contentType:c.type,mimeType:c.mimeType,codecs:c.codecs,frameRate:c.frameRate,kind:c.kind,language:c.language,label:c.label,width:c.width||null,height:c.height||null,initSegmentUri:b,encrypted:c.encrypted,keyId:c.keyId,segments:f,variantIds:a}}
function Y(a){if(!a.f)throw new t(2,9,9002);}tg.offline=Jg;n("shaka.polyfill.installAll",function(){for(var a=0;a<Pg.length;++a)Pg[a]()});var Pg=[];function Qg(a){Pg.push(a)}n("shaka.polyfill.register",Qg);function Rg(a){var b=a.type.replace(/^(webkit|moz|MS)/,"").toLowerCase();if("function"===typeof Event)var c=new Event(b,a);else c=document.createEvent("Event"),c.initEvent(b,a.bubbles,a.cancelable);a.target.dispatchEvent(c)}
Qg(function(){if(window.Document){var a=Element.prototype;a.requestFullscreen=a.requestFullscreen||a.mozRequestFullScreen||a.msRequestFullscreen||a.webkitRequestFullscreen;a=Document.prototype;a.exitFullscreen=a.exitFullscreen||a.mozCancelFullScreen||a.msExitFullscreen||a.webkitExitFullscreen;"fullscreenElement"in document||(Object.defineProperty(document,"fullscreenElement",{get:function(){return document.mozFullScreenElement||document.msFullscreenElement||document.webkitFullscreenElement}}),Object.defineProperty(document,
"fullscreenEnabled",{get:function(){return document.mozFullScreenEnabled||document.msFullscreenEnabled||document.webkitFullscreenEnabled}}));document.addEventListener("webkitfullscreenchange",Rg);document.addEventListener("webkitfullscreenerror",Rg);document.addEventListener("mozfullscreenchange",Rg);document.addEventListener("mozfullscreenerror",Rg);document.addEventListener("MSFullscreenChange",Rg);document.addEventListener("MSFullscreenError",Rg)}});Qg(function(){var a=navigator.userAgent;a&&0<=a.indexOf("CrKey")&&delete window.indexedDB});Qg(function(){if(4503599627370497!=Math.round(4503599627370497)){var a=Math.round;Math.round=function(b){var c=b;4503599627370496>=b&&(c=a(b));return c}}});function Sg(a){this.f=[];this.b=[];this.a=[];(new Q).da("pssh",this.c.bind(this)).parse(a.buffer)}Sg.prototype.c=function(a){if(!(1<a.version)){var b=$a(a.s.Ka(16)),c=[];if(0<a.version)for(var d=a.s.D(),e=0;e<d;++e){var f=$a(a.s.Ka(16));c.push(f)}d=a.s.D();a.s.I(d);this.b.push.apply(this.b,c);this.f.push(b);this.a.push({start:a.start,end:a.start+a.size-1})}};function Tg(a,b){try{var c=new Ug(a,b);return Promise.resolve(c)}catch(d){return Promise.reject(d)}}
function Ug(a,b){this.keySystem=a;for(var c=!1,d=0;d<b.length;++d){var e=b[d];var f={audioCapabilities:[],videoCapabilities:[],persistentState:"optional",distinctiveIdentifier:"optional",initDataTypes:e.initDataTypes,sessionTypes:["temporary"],label:e.label},g=!1;if(e.audioCapabilities)for(var h=0;h<e.audioCapabilities.length;++h){var l=e.audioCapabilities[h];if(l.contentType){g=!0;var m=l.contentType.split(";")[0];MSMediaKeys.isTypeSupported(this.keySystem,m)&&(f.audioCapabilities.push(l),c=!0)}}if(e.videoCapabilities)for(h=
0;h<e.videoCapabilities.length;++h)l=e.videoCapabilities[h],l.contentType&&(g=!0,m=l.contentType.split(";")[0],MSMediaKeys.isTypeSupported(this.keySystem,m)&&(f.videoCapabilities.push(l),c=!0));g||(c=MSMediaKeys.isTypeSupported(this.keySystem,"video/mp4"));"required"==e.persistentState&&(f.persistentState="required",f.sessionTypes=["persistent-license"]);if(c){this.a=f;return}}e=Error("Unsupported keySystem");e.name="NotSupportedError";e.code=DOMException.NOT_SUPPORTED_ERR;throw e;}
Ug.prototype.createMediaKeys=function(){var a=new Vg(this.keySystem);return Promise.resolve(a)};Ug.prototype.getConfiguration=function(){return this.a};function Wg(a){var b=this.mediaKeys;b&&b!=a&&Xg(b,null);delete this.mediaKeys;return(this.mediaKeys=a)?Xg(a,this):Promise.resolve()}function Vg(a){this.a=new MSMediaKeys(a);this.b=new D}Vg.prototype.createSession=function(a){if("temporary"!=(a||"temporary"))throw new TypeError("Session type "+a+" is unsupported on this platform.");return new Yg(this.a)};
Vg.prototype.setServerCertificate=function(){return Promise.resolve(!1)};function Xg(a,b){function c(){b.msSetMediaKeys(d.a);b.removeEventListener("loadedmetadata",c)}Ja(a.b);if(!b)return Promise.resolve();E(a.b,b,"msneedkey",Zg);var d=a;try{return 1<=b.readyState?b.msSetMediaKeys(a.a):b.addEventListener("loadedmetadata",c),Promise.resolve()}catch(e){return Promise.reject(e)}}
function Yg(a){p.call(this);this.c=null;this.g=a;this.b=this.a=null;this.f=new D;this.sessionId="";this.expiration=NaN;this.closed=new A;this.keyStatuses=new $g}ba(Yg);k=Yg.prototype;k.generateRequest=function(a,b){this.a=new A;try{this.c=this.g.createSession("video/mp4",new Uint8Array(b),null),E(this.f,this.c,"mskeymessage",this.pd.bind(this)),E(this.f,this.c,"mskeyadded",this.nd.bind(this)),E(this.f,this.c,"mskeyerror",this.od.bind(this)),ah(this,"status-pending")}catch(c){this.a.reject(c)}return this.a};
k.load=function(){return Promise.reject(Error("MediaKeySession.load not yet supported"))};k.update=function(a){this.b=new A;try{this.c.update(new Uint8Array(a))}catch(b){this.b.reject(b)}return this.b};k.close=function(){try{this.c.close(),this.closed.resolve(),Ja(this.f)}catch(a){this.closed.reject(a)}return this.closed};k.remove=function(){return Promise.reject(Error("MediaKeySession.remove is only applicable for persistent licenses, which are not supported on this platform"))};
function Zg(a){var b=document.createEvent("CustomEvent");b.initCustomEvent("encrypted",!1,!1,null);b.initDataType="cenc";var c=a.initData;if(c){var d=new Sg(c);if(1>=d.a.length)a=c;else{var e=[];for(a=0;a<d.a.length;a++)e.push(c.subarray(d.a[a].start,d.a[a].end+1));c=Ga(e,bh);for(a=d=0;a<c.length;a++)d+=c[a].length;d=new Uint8Array(d);for(a=e=0;a<c.length;a++)d.set(c[a],e),e+=c[a].length;a=d}}else a=c;b.initData=a;this.dispatchEvent(b)}function bh(a,b){return ab(a,b)}
k.pd=function(a){this.a&&(this.a.resolve(),this.a=null);this.dispatchEvent(new I("message",{messageType:void 0==this.keyStatuses.sb()?"licenserequest":"licenserenewal",message:a.message.buffer}))};k.nd=function(){this.a?(ah(this,"usable"),this.a.resolve(),this.a=null):this.b&&(ah(this,"usable"),this.b.resolve(),this.b=null)};
k.od=function(){var a=Error("EME PatchedMediaKeysMs key error");a.errorCode=this.c.error;if(this.a)this.a.reject(a),this.a=null;else if(this.b)this.b.reject(a),this.b=null;else switch(this.c.error.code){case MSMediaKeyError.MS_MEDIA_KEYERR_OUTPUT:case MSMediaKeyError.MS_MEDIA_KEYERR_HARDWARECHANGE:ah(this,"output-not-allowed");default:ah(this,"internal-error")}};function ah(a,b){a.keyStatuses.Kb(b);a.dispatchEvent(new I("keystatuseschange"))}function $g(){this.size=0;this.a=void 0}var ch;k=$g.prototype;
k.Kb=function(a){this.size=void 0==a?0:1;this.a=a};k.sb=function(){return this.a};k.forEach=function(a){this.a&&a(this.a,ch)};k.get=function(a){if(this.has(a))return this.a};k.has=function(a){var b=ch;return this.a&&ab(new Uint8Array(a),new Uint8Array(b))?!0:!1};k.entries=function(){};k.keys=function(){};k.values=function(){};function dh(){return Promise.reject(Error("The key system specified is not supported."))}function eh(a){return a?Promise.reject(Error("MediaKeys not supported.")):Promise.resolve()}function fh(){throw new TypeError("Illegal constructor.");}fh.prototype.createSession=function(){};fh.prototype.setServerCertificate=function(){};function gh(){throw new TypeError("Illegal constructor.");}gh.prototype.getConfiguration=function(){};gh.prototype.createMediaKeys=function(){};var hh="";function ih(a){hh=a;jh=(new Uint8Array([0])).buffer;navigator.requestMediaKeySystemAccess=kh;delete HTMLMediaElement.prototype.mediaKeys;HTMLMediaElement.prototype.mediaKeys=null;HTMLMediaElement.prototype.setMediaKeys=lh;window.MediaKeys=mh;window.MediaKeySystemAccess=nh}function oh(a){var b=hh;return b?b+a.charAt(0).toUpperCase()+a.slice(1):a}function kh(a,b){try{var c=new nh(a,b);return Promise.resolve(c)}catch(d){return Promise.reject(d)}}
function lh(a){var b=this.mediaKeys;b&&b!=a&&ph(b,null);delete this.mediaKeys;(this.mediaKeys=a)&&ph(a,this);return Promise.resolve()}
function nh(a,b){this.a=this.keySystem=a;var c=!0;"org.w3.clearkey"==a&&(this.a="webkit-org.w3.clearkey",c=!1);var d=!1;var e=document.getElementsByTagName("video");var f=e.length?e[0]:document.createElement("video");for(var g=0;g<b.length;++g){e=b[g];var h={audioCapabilities:[],videoCapabilities:[],persistentState:"optional",distinctiveIdentifier:"optional",initDataTypes:e.initDataTypes,sessionTypes:["temporary"],label:e.label},l=!1;if(e.audioCapabilities)for(var m=0;m<e.audioCapabilities.length;++m){var q=
e.audioCapabilities[m];if(q.contentType){var l=!0,r=q.contentType.split(";")[0];f.canPlayType(r,this.a)&&(h.audioCapabilities.push(q),d=!0)}}if(e.videoCapabilities)for(m=0;m<e.videoCapabilities.length;++m)q=e.videoCapabilities[m],q.contentType&&(l=!0,f.canPlayType(q.contentType,this.a)&&(h.videoCapabilities.push(q),d=!0));l||(d=f.canPlayType("video/mp4",this.a)||f.canPlayType("video/webm",this.a));"required"==e.persistentState&&(c?(h.persistentState="required",h.sessionTypes=["persistent-license"]):
d=!1);if(d){this.b=h;return}}c="Unsupported keySystem";if("org.w3.clearkey"==a||"com.widevine.alpha"==a)c="None of the requested configurations were supported.";c=Error(c);c.name="NotSupportedError";c.code=DOMException.NOT_SUPPORTED_ERR;throw c;}nh.prototype.createMediaKeys=function(){var a=new mh(this.a);return Promise.resolve(a)};nh.prototype.getConfiguration=function(){return this.b};function mh(a){this.g=a;this.b=null;this.a=new D;this.c=[];this.f={}}
function ph(a,b){a.b=b;Ja(a.a);var c=hh;b&&(E(a.a,b,c+"needkey",a.Cd.bind(a)),E(a.a,b,c+"keymessage",a.Bd.bind(a)),E(a.a,b,c+"keyadded",a.zd.bind(a)),E(a.a,b,c+"keyerror",a.Ad.bind(a)))}k=mh.prototype;k.createSession=function(a){var b=a||"temporary";if("temporary"!=b&&"persistent-license"!=b)throw new TypeError("Session type "+a+" is unsupported on this platform.");a=this.b||document.createElement("video");a.src||(a.src="about:blank");b=new qh(a,this.g,b);this.c.push(b);return b};
k.setServerCertificate=function(){return Promise.resolve(!1)};k.Cd=function(a){var b=document.createEvent("CustomEvent");b.initCustomEvent("encrypted",!1,!1,null);b.initDataType="webm";b.initData=a.initData;this.b.dispatchEvent(b)};k.Bd=function(a){var b=rh(this,a.sessionId);b&&(a=new I("message",{messageType:void 0==b.keyStatuses.sb()?"licenserequest":"licenserenewal",message:a.message}),b.b&&(b.b.resolve(),b.b=null),b.dispatchEvent(a))};
k.zd=function(a){if(a=rh(this,a.sessionId))sh(a,"usable"),a.a&&a.a.resolve(),a.a=null};
k.Ad=function(a){var b=rh(this,a.sessionId);if(b){var c=Error("EME v0.1b key error");c.errorCode=a.errorCode;c.errorCode.systemCode=a.systemCode;!a.sessionId&&b.b?(c.method="generateRequest",45==a.systemCode&&(c.message="Unsupported session type."),b.b.reject(c),b.b=null):a.sessionId&&b.a?(c.method="update",b.a.reject(c),b.a=null):(c=a.systemCode,a.errorCode.code==MediaKeyError.MEDIA_KEYERR_OUTPUT?sh(b,"output-restricted"):1==c?sh(b,"expired"):sh(b,"internal-error"))}};
function rh(a,b){var c=a.f[b];return c?c:(c=a.c.shift())?(c.sessionId=b,a.f[b]=c):null}function qh(a,b,c){p.call(this);this.f=a;this.h=!1;this.a=this.b=null;this.c=b;this.g=c;this.sessionId="";this.expiration=NaN;this.closed=new A;this.keyStatuses=new th}ba(qh);
function uh(a,b,c){if(a.h)return Promise.reject(Error("The session is already initialized."));a.h=!0;try{if("persistent-license"==a.g)if(c)var d=new Uint8Array(Ua("LOAD_SESSION|"+c));else{var e=Ua("PERSISTENT|"),f=new Uint8Array(e.byteLength+b.byteLength);f.set(new Uint8Array(e),0);f.set(new Uint8Array(b),e.byteLength);d=f}else d=new Uint8Array(b)}catch(h){return Promise.reject(h)}a.b=new A;var g=oh("generateKeyRequest");try{a.f[g](a.c,d)}catch(h){if("InvalidStateError"!=h.name)return a.b=null,Promise.reject(h);
setTimeout(function(){try{this.f[g](this.c,d)}catch(l){this.b.reject(l),this.b=null}}.bind(a),10)}return a.b}k=qh.prototype;
k.Mb=function(a,b){if(this.a)this.a.then(this.Mb.bind(this,a,b))["catch"](this.Mb.bind(this,a,b));else{this.a=a;if("webkit-org.w3.clearkey"==this.c){var c=F(b);var d=JSON.parse(c);"oct"!=d.keys[0].kty&&(this.a.reject(Error("Response is not a valid JSON Web Key Set.")),this.a=null);c=Ya(d.keys[0].k);d=Ya(d.keys[0].kid)}else c=new Uint8Array(b),d=null;var e=oh("addKey");try{this.f[e](this.c,c,d,this.sessionId)}catch(f){this.a.reject(f),this.a=null}}};
function sh(a,b){a.keyStatuses.Kb(b);a.dispatchEvent(new I("keystatuseschange"))}k.generateRequest=function(a,b){return uh(this,b,null)};k.load=function(a){return"persistent-license"==this.g?uh(this,null,a):Promise.reject(Error("Not a persistent session."))};k.update=function(a){var b=new A;this.Mb(b,a);return b};
k.close=function(){if("persistent-license"!=this.g){if(!this.sessionId)return this.closed.reject(Error("The session is not callable.")),this.closed;var a=oh("cancelKeyRequest");try{this.f[a](this.c,this.sessionId)}catch(b){}}this.closed.resolve();return this.closed};k.remove=function(){return"persistent-license"!=this.g?Promise.reject(Error("Not a persistent session.")):this.close()};function th(){this.size=0;this.a=void 0}var jh;k=th.prototype;k.Kb=function(a){this.size=void 0==a?0:1;this.a=a};
k.sb=function(){return this.a};k.forEach=function(a){this.a&&a(this.a,jh)};k.get=function(a){if(this.has(a))return this.a};k.has=function(a){var b=jh;return this.a&&ab(new Uint8Array(a),new Uint8Array(b))?!0:!1};k.entries=function(){};k.keys=function(){};k.values=function(){};Qg(function(){!window.HTMLVideoElement||navigator.requestMediaKeySystemAccess&&MediaKeySystemAccess.prototype.getConfiguration||(HTMLMediaElement.prototype.webkitGenerateKeyRequest?ih("webkit"):HTMLMediaElement.prototype.generateKeyRequest?ih(""):window.MSMediaKeys?(ch=(new Uint8Array([0])).buffer,delete HTMLMediaElement.prototype.mediaKeys,HTMLMediaElement.prototype.mediaKeys=null,HTMLMediaElement.prototype.setMediaKeys=Wg,window.MediaKeys=Vg,window.MediaKeySystemAccess=Ug,navigator.requestMediaKeySystemAccess=
Tg):(navigator.requestMediaKeySystemAccess=dh,delete HTMLMediaElement.prototype.mediaKeys,HTMLMediaElement.prototype.mediaKeys=null,HTMLMediaElement.prototype.setMediaKeys=eh,window.MediaKeys=fh,window.MediaKeySystemAccess=gh))});function vh(){var a=MediaSource.prototype.addSourceBuffer;MediaSource.prototype.addSourceBuffer=function(){var b=a.apply(this,arguments);b.abort=function(){};return b}}
function wh(){var a=MediaSource.prototype.endOfStream;MediaSource.prototype.endOfStream=function(){for(var b,d=0,e=0;e<this.sourceBuffers.length;++e)b=this.sourceBuffers[e],b=b.buffered.end(b.buffered.length-1),d=Math.max(d,b);if(!isNaN(this.duration)&&d<this.duration)for(this.Zb=!0,e=0;e<this.sourceBuffers.length;++e)b=this.sourceBuffers[e],b.Tb=!1;return a.apply(this,arguments)};var b=MediaSource.prototype.addSourceBuffer;MediaSource.prototype.addSourceBuffer=function(){var a=b.apply(this,arguments);
a.N=this;a.addEventListener("updateend",xh,!1);this.a||(this.addEventListener("sourceclose",yh,!1),this.a=!0);return a}}function xh(a){var b=a.target,c=b.N;if(c.Zb){a.preventDefault();a.stopPropagation();a.stopImmediatePropagation();b.Tb=!0;for(a=0;a<c.sourceBuffers.length;++a)if(0==c.sourceBuffers[a].Tb)return;c.Zb=!1}}function yh(a){a=a.target;for(var b=0;b<a.sourceBuffers.length;++b)a.sourceBuffers[b].removeEventListener("updateend",xh,!1);a.removeEventListener("sourceclose",yh,!1)}
Qg(function(){if(window.MediaSource){var a=navigator.vendor,b=navigator.appVersion;!a||!b||0>a.indexOf("Apple")||(0<=b.indexOf("Version/8")?window.MediaSource=null:0<=b.indexOf("Version/9")?vh():0<=b.indexOf("Version/10")&&(vh(),wh()))}});function Z(a){this.c=[];this.b=[];this.Aa=zh;if(a)try{a(this.fa.bind(this),this.a.bind(this))}catch(b){this.a(b)}}var zh=0;function Ah(a){var b=new Z;b.fa(void 0);return b.then(function(){return a})}function Bh(a){var b=new Z;b.a(a);return b}function Ch(a){function b(a,b,c){a.Aa==zh&&(e[b]=c,d++,d==e.length&&a.fa(e))}var c=new Z;if(!a.length)return c.fa([]),c;for(var d=0,e=Array(a.length),f=c.a.bind(c),g=0;g<a.length;++g)a[g]&&a[g].then?a[g].then(b.bind(null,c,g),f):b(c,g,a[g]);return c}
function Dh(a){for(var b=new Z,c=b.fa.bind(b),d=b.a.bind(b),e=0;e<a.length;++e)a[e]&&a[e].then?a[e].then(c,d):c(a[e]);return b}Z.prototype.then=function(a,b){var c=new Z;switch(this.Aa){case 1:Eh(this,c,a);break;case 2:Eh(this,c,b);break;case zh:this.c.push({L:c,pb:a}),this.b.push({L:c,pb:b})}return c};Z.prototype["catch"]=function(a){return this.then(void 0,a)};
Z.prototype.fa=function(a){if(this.Aa==zh){this.jb=a;this.Aa=1;for(a=0;a<this.c.length;++a)Eh(this,this.c[a].L,this.c[a].pb);this.c=[];this.b=[]}};Z.prototype.a=function(a){if(this.Aa==zh){this.jb=a;this.Aa=2;for(a=0;a<this.b.length;++a)Eh(this,this.b[a].L,this.b[a].pb);this.c=[];this.b=[]}};
function Eh(a,b,c){Fh.push(function(){if(c&&"function"==typeof c){try{var a=c(this.jb)}catch(f){b.a(f);return}try{var e=a&&a.then}catch(f){b.a(f);return}a instanceof Z?a==b?b.a(new TypeError("Chaining cycle detected")):a.then(b.fa.bind(b),b.a.bind(b)):e?Gh(a,e,b):b.fa(a)}else 1==this.Aa?b.fa(this.jb):b.a(this.jb)}.bind(a));null==Hh&&(Hh=Ih(Jh))}
function Gh(a,b,c){try{var d=!1;b.call(a,function(a){if(!d){d=!0;try{var b=a&&a.then}catch(g){c.a(g);return}b?Gh(a,b,c):c.fa(a)}},c.a.bind(c))}catch(e){c.a(e)}}function Jh(){for(;Fh.length;){null!=Hh&&(Kh(Hh),Hh=null);var a=Fh;Fh=[];for(var b=0;b<a.length;++b)a[b]()}}function Ih(){return 0}function Kh(){}var Hh=null,Fh=[];
Qg(function(a){window.setImmediate?(Ih=function(a){return window.setImmediate(a)},Kh=function(a){return window.clearImmediate(a)}):(Ih=function(a){return window.setTimeout(a,0)},Kh=function(a){return window.clearTimeout(a)});if(!window.Promise||a)window.Promise=Z,window.Promise.resolve=Ah,window.Promise.reject=Bh,window.Promise.all=Ch,window.Promise.race=Dh,window.Promise.prototype.then=Z.prototype.then,window.Promise.prototype["catch"]=Z.prototype["catch"]});Qg(function(){if(window.HTMLMediaElement){var a=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){var b=a.apply(this,arguments);b&&b["catch"](function(){});return b}}});function Lh(){return{droppedVideoFrames:this.webkitDroppedFrameCount,totalVideoFrames:this.webkitDecodedFrameCount,corruptedVideoFrames:0,creationTime:NaN,totalFrameDelay:0}}Qg(function(){if(window.HTMLVideoElement){var a=HTMLVideoElement.prototype;!a.getVideoPlaybackQuality&&"webkitDroppedFrameCount"in a&&(a.getVideoPlaybackQuality=Lh)}});function Mh(a,b,c){return new window.TextTrackCue(a,b,c)}function Nh(a,b,c){return new window.TextTrackCue(a+"-"+b+"-"+c,a,b,c)}Qg(function(){if(!window.VTTCue&&window.TextTrackCue){var a=TextTrackCue.length;if(3==a)window.VTTCue=Mh;else if(6==a)window.VTTCue=Nh;else{try{var b=!!Mh(1,2,"")}catch(c){b=!1}b&&(window.VTTCue=Mh)}}});}.call(g,this));
if (typeof(module)!="undefined"&&module.exports)module.exports=g.shaka;
else if (typeof(define)!="undefined" && define.amd)define(function(){return g.shaka});
else this.shaka=g.shaka;
})();


},{}],6:[function(_dereq_,module,exports){
// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);

},{}],7:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WebVRManager = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Emitter = _dereq_('./emitter.js');
var Modes = _dereq_('./modes.js');
var Util = _dereq_('./util.js');

/**
 * Everything having to do with the WebVR button.
 * Emits a 'click' event when it's clicked.
 */
function ButtonManager(opt_root) {
  var root = opt_root || document.body;
  this.loadIcons_();

  // Make the fullscreen button.
  var fsButton = this.createButton();
  fsButton.src = this.ICONS.fullscreen;
  fsButton.title = 'Fullscreen mode';
  var s = fsButton.style;
  s.bottom = 0;
  s.right = 0;
  fsButton.addEventListener('click', this.createClickHandler_('fs'));
  root.appendChild(fsButton);
  this.fsButton = fsButton;

  // Make the VR button.
  var vrButton = this.createButton();
  vrButton.src = this.ICONS.cardboard;
  vrButton.title = 'Virtual reality mode';
  var s = vrButton.style;
  s.bottom = 0;
  s.right = '48px';
  vrButton.addEventListener('click', this.createClickHandler_('vr'));
  root.appendChild(vrButton);
  this.vrButton = vrButton;

  this.isVisible = true;

}
ButtonManager.prototype = new Emitter();

ButtonManager.prototype.createButton = function() {
  var button = document.createElement('img');
  button.className = 'webvr-button';
  var s = button.style;
  s.position = 'absolute';
  s.width = '24px'
  s.height = '24px';
  s.backgroundSize = 'cover';
  s.backgroundColor = 'transparent';
  s.border = 0;
  s.userSelect = 'none';
  s.webkitUserSelect = 'none';
  s.MozUserSelect = 'none';
  s.cursor = 'pointer';
  s.padding = '12px';
  s.zIndex = 1;
  s.display = 'none';
  s.boxSizing = 'content-box';

  // Prevent button from being selected and dragged.
  button.draggable = false;
  button.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });

  // Style it on hover.
  button.addEventListener('mouseenter', function(e) {
    s.filter = s.webkitFilter = 'drop-shadow(0 0 5px rgba(255,255,255,1))';
  });
  button.addEventListener('mouseleave', function(e) {
    s.filter = s.webkitFilter = '';
  });
  return button;
};

ButtonManager.prototype.setMode = function(mode, isVRCompatible) {
  isVRCompatible = isVRCompatible || WebVRConfig.FORCE_ENABLE_VR;
  if (!this.isVisible) {
    return;
  }
  switch (mode) {
    case Modes.NORMAL:
      this.fsButton.style.display = 'block';
      this.fsButton.src = this.ICONS.fullscreen;
      this.vrButton.style.display = (isVRCompatible ? 'block' : 'none');
      break;
    case Modes.MAGIC_WINDOW:
      this.fsButton.style.display = 'block';
      this.fsButton.src = this.ICONS.exitFullscreen;
      this.vrButton.style.display = 'none';
      break;
    case Modes.VR:
      this.fsButton.style.display = 'none';
      this.vrButton.style.display = 'none';
      break;
  }

  // Hack for Safari Mac/iOS to force relayout (svg-specific issue)
  // http://goo.gl/hjgR6r
  var oldValue = this.fsButton.style.display;
  this.fsButton.style.display = 'inline-block';
  this.fsButton.offsetHeight;
  this.fsButton.style.display = oldValue;
};

ButtonManager.prototype.setVisibility = function(isVisible) {
  this.isVisible = isVisible;
  this.fsButton.style.display = isVisible ? 'block' : 'none';
  this.vrButton.style.display = isVisible ? 'block' : 'none';
};

ButtonManager.prototype.createClickHandler_ = function(eventName) {
  return function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.emit(eventName);
  }.bind(this);
};

ButtonManager.prototype.loadIcons_ = function() {
  // Preload some hard-coded SVG.
  this.ICONS = {};
  this.ICONS.cardboard = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMjAuNzQgNkgzLjIxQzIuNTUgNiAyIDYuNTcgMiA3LjI4djEwLjQ0YzAgLjcuNTUgMS4yOCAxLjIzIDEuMjhoNC43OWMuNTIgMCAuOTYtLjMzIDEuMTQtLjc5bDEuNC0zLjQ4Yy4yMy0uNTkuNzktMS4wMSAxLjQ0LTEuMDFzMS4yMS40MiAxLjQ1IDEuMDFsMS4zOSAzLjQ4Yy4xOS40Ni42My43OSAxLjExLjc5aDQuNzljLjcxIDAgMS4yNi0uNTcgMS4yNi0xLjI4VjcuMjhjMC0uNy0uNTUtMS4yOC0xLjI2LTEuMjh6TTcuNSAxNC42MmMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTMgMS4xOCAwIDIuMTIuOTYgMi4xMiAyLjEzcy0uOTUgMi4xMi0yLjEyIDIuMTJ6bTkgMGMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTNzMi4xMi45NiAyLjEyIDIuMTMtLjk1IDIuMTItMi4xMiAyLjEyeiIvPgogICAgPHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgyNHYyNEgwVjB6Ii8+Cjwvc3ZnPgo=');
  this.ICONS.fullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNyAxNEg1djVoNXYtMkg3di0zem0tMi00aDJWN2gzVjVINXY1em0xMiA3aC0zdjJoNXYtNWgtMnYzek0xNCA1djJoM3YzaDJWNWgtNXoiLz4KPC9zdmc+Cg==');
  this.ICONS.exitFullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNSAxNmgzdjNoMnYtNUg1djJ6bTMtOEg1djJoNVY1SDh2M3ptNiAxMWgydi0zaDN2LTJoLTV2NXptMi0xMVY1aC0ydjVoNVY4aC0zeiIvPgo8L3N2Zz4K');
  this.ICONS.settings = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNMTkuNDMgMTIuOThjLjA0LS4zMi4wNy0uNjQuMDctLjk4cy0uMDMtLjY2LS4wNy0uOThsMi4xMS0xLjY1Yy4xOS0uMTUuMjQtLjQyLjEyLS42NGwtMi0zLjQ2Yy0uMTItLjIyLS4zOS0uMy0uNjEtLjIybC0yLjQ5IDFjLS41Mi0uNC0xLjA4LS43My0xLjY5LS45OGwtLjM4LTIuNjVDMTQuNDYgMi4xOCAxNC4yNSAyIDE0IDJoLTRjLS4yNSAwLS40Ni4xOC0uNDkuNDJsLS4zOCAyLjY1Yy0uNjEuMjUtMS4xNy41OS0xLjY5Ljk4bC0yLjQ5LTFjLS4yMy0uMDktLjQ5IDAtLjYxLjIybC0yIDMuNDZjLS4xMy4yMi0uMDcuNDkuMTIuNjRsMi4xMSAxLjY1Yy0uMDQuMzItLjA3LjY1LS4wNy45OHMuMDMuNjYuMDcuOThsLTIuMTEgMS42NWMtLjE5LjE1LS4yNC40Mi0uMTIuNjRsMiAzLjQ2Yy4xMi4yMi4zOS4zLjYxLjIybDIuNDktMWMuNTIuNCAxLjA4LjczIDEuNjkuOThsLjM4IDIuNjVjLjAzLjI0LjI0LjQyLjQ5LjQyaDRjLjI1IDAgLjQ2LS4xOC40OS0uNDJsLjM4LTIuNjVjLjYxLS4yNSAxLjE3LS41OSAxLjY5LS45OGwyLjQ5IDFjLjIzLjA5LjQ5IDAgLjYxLS4yMmwyLTMuNDZjLjEyLS4yMi4wNy0uNDktLjEyLS42NGwtMi4xMS0xLjY1ek0xMiAxNS41Yy0xLjkzIDAtMy41LTEuNTctMy41LTMuNXMxLjU3LTMuNSAzLjUtMy41IDMuNSAxLjU3IDMuNSAzLjUtMS41NyAzLjUtMy41IDMuNXoiLz4KPC9zdmc+Cg==');
};

module.exports = ButtonManager;

},{"./emitter.js":2,"./modes.js":3,"./util.js":4}],2:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function Emitter() {
  this.callbacks = {};
}

Emitter.prototype.emit = function(eventName) {
  var callbacks = this.callbacks[eventName];
  if (!callbacks) {
    //console.log('No valid callback specified.');
    return;
  }
  var args = [].slice.call(arguments);
  // Eliminate the first param (the callback).
  args.shift();
  for (var i = 0; i < callbacks.length; i++) {
    callbacks[i].apply(this, args);
  }
};

Emitter.prototype.on = function(eventName, callback) {
  if (eventName in this.callbacks) {
    this.callbacks[eventName].push(callback);
  } else {
    this.callbacks[eventName] = [callback];
  }
};

module.exports = Emitter;

},{}],3:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Modes = {
  UNKNOWN: 0,
  // Not fullscreen, just tracking.
  NORMAL: 1,
  // Magic window immersive mode.
  MAGIC_WINDOW: 2,
  // Full screen split screen VR mode.
  VR: 3,
};

module.exports = Modes;

},{}],4:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = {};

Util.base64 = function(mimeType, base64) {
  return 'data:' + mimeType + ';base64,' + base64;
};

Util.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Util.isFirefox = function() {
  return /firefox/i.test(navigator.userAgent);
};

Util.isIOS = function() {
  return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
};

Util.isIFrame = function() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

Util.appendQueryParameter = function(url, key, value) {
  // Determine delimiter based on if the URL already GET parameters in it.
  var delimiter = (url.indexOf('?') < 0 ? '?' : '&');
  url += delimiter + key + '=' + value;
  return url;
};

// From http://goo.gl/4WX3tg
Util.getQueryParameter = function(name) {
  var name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

Util.isLandscapeMode = function() {
  return (window.orientation == 90 || window.orientation == -90);
};

Util.getScreenWidth = function() {
  return Math.max(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.getScreenHeight = function() {
  return Math.min(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

module.exports = Util;

},{}],5:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ButtonManager = _dereq_('./button-manager.js');
var Emitter = _dereq_('./emitter.js');
var Modes = _dereq_('./modes.js');
var Util = _dereq_('./util.js');

/**
 * Helper for getting in and out of VR mode.
 */
function WebVRManager(renderer, effect, params) {
  this.params = params || {};

  this.mode = Modes.UNKNOWN;

  // Set option to hide the button.
  this.hideButton = this.params.hideButton || false;
  // Whether or not the FOV should be distorted or un-distorted. By default, it
  // should be distorted, but in the case of vertex shader based distortion,
  // ensure that we use undistorted parameters.
  this.predistorted = !!this.params.predistorted;

  // Save the THREE.js renderer and effect for later.
  this.renderer = renderer;
  this.effect = effect;
  var polyfillWrapper = document.querySelector('.webvr-polyfill-fullscreen-wrapper');
  this.button = new ButtonManager(polyfillWrapper);

  this.isFullscreenDisabled = !!Util.getQueryParameter('no_fullscreen');
  this.startMode = Modes.NORMAL;
  var startModeParam = parseInt(Util.getQueryParameter('start_mode'));
  if (!isNaN(startModeParam)) {
    this.startMode = startModeParam;
  }

  if (this.hideButton) {
    this.button.setVisibility(false);
  }

  // Check if the browser is compatible with WebVR.
  this.getDeviceByType_(VRDisplay).then(function(hmd) {
    this.hmd = hmd;

    // Only enable VR mode if there's a VR device attached or we are running the
    // polyfill on mobile.
    if (!this.isVRCompatibleOverride) {
      this.isVRCompatible =  !hmd.isPolyfilled || Util.isMobile();
    }

    switch (this.startMode) {
      case Modes.MAGIC_WINDOW:
        this.setMode_(Modes.MAGIC_WINDOW);
        break;
      case Modes.VR:
        this.enterVRMode_();
        this.setMode_(Modes.VR);
        break;
      default:
        this.setMode_(Modes.NORMAL);
    }

    this.emit('initialized');
  }.bind(this));

  // Hook up button listeners.
  this.button.on('fs', this.onFSClick_.bind(this));
  this.button.on('vr', this.onVRClick_.bind(this));

  // Bind to fullscreen events.
  document.addEventListener('webkitfullscreenchange',
      this.onFullscreenChange_.bind(this));
  document.addEventListener('mozfullscreenchange',
      this.onFullscreenChange_.bind(this));
  document.addEventListener('msfullscreenchange',
      this.onFullscreenChange_.bind(this));

  // Bind to VR* specific events.
  window.addEventListener('vrdisplaypresentchange',
      this.onVRDisplayPresentChange_.bind(this));
  window.addEventListener('vrdisplaydeviceparamschange',
      this.onVRDisplayDeviceParamsChange_.bind(this));
}

WebVRManager.prototype = new Emitter();

// Expose these values externally.
WebVRManager.Modes = Modes;

WebVRManager.prototype.render = function(scene, camera, timestamp) {
  // Scene may be an array of two scenes, one for each eye.
  if (scene instanceof Array) {
    this.effect.render(scene[0], camera);
  } else {
    this.effect.render(scene, camera);
  }
};

WebVRManager.prototype.setVRCompatibleOverride = function(isVRCompatible) {
  this.isVRCompatible = isVRCompatible;
  this.isVRCompatibleOverride = true;

  // Don't actually change modes, just update the buttons.
  this.button.setMode(this.mode, this.isVRCompatible);
};

WebVRManager.prototype.setFullscreenCallback = function(callback) {
  this.fullscreenCallback = callback;
};

WebVRManager.prototype.setVRCallback = function(callback) {
  this.vrCallback = callback;
};

WebVRManager.prototype.setExitFullscreenCallback = function(callback) {
  this.exitFullscreenCallback = callback;
}

/**
 * Promise returns true if there is at least one HMD device available.
 */
WebVRManager.prototype.getDeviceByType_ = function(type) {
  return new Promise(function(resolve, reject) {
    navigator.getVRDisplays().then(function(displays) {
      // Promise succeeds, but check if there are any displays actually.
      for (var i = 0; i < displays.length; i++) {
        if (displays[i] instanceof type) {
          resolve(displays[i]);
          break;
        }
      }
      resolve(null);
    }, function() {
      // No displays are found.
      resolve(null);
    });
  });
};

/**
 * Helper for entering VR mode.
 */
WebVRManager.prototype.enterVRMode_ = function() {
  this.hmd.requestPresent([{
    source: this.renderer.domElement,
    predistorted: this.predistorted
  }]);
};

WebVRManager.prototype.setMode_ = function(mode) {
  var oldMode = this.mode;
  if (mode == this.mode) {
    console.warn('Not changing modes, already in %s', mode);
    return;
  }
  // console.log('Mode change: %s => %s', this.mode, mode);
  this.mode = mode;
  this.button.setMode(mode, this.isVRCompatible);

  // Emit an event indicating the mode changed.
  this.emit('modechange', mode, oldMode);
};

/**
 * Main button was clicked.
 */
WebVRManager.prototype.onFSClick_ = function() {
  switch (this.mode) {
    case Modes.NORMAL:
      // TODO: Remove this hack if/when iOS gets real fullscreen mode.
      // If this is an iframe on iOS, break out and open in no_fullscreen mode.
      if (Util.isIOS() && Util.isIFrame()) {
        if (this.fullscreenCallback) {
          this.fullscreenCallback();
        } else {
          var url = window.location.href;
          url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
          url = Util.appendQueryParameter(url, 'start_mode', Modes.MAGIC_WINDOW);
          top.location.href = url;
          return;
        }
      }
      this.setMode_(Modes.MAGIC_WINDOW);
      this.requestFullscreen_();
      break;
    case Modes.MAGIC_WINDOW:
      if (this.isFullscreenDisabled) {
        window.history.back();
        return;
      }
      if (this.exitFullscreenCallback) {
        this.exitFullscreenCallback();
      }
      this.setMode_(Modes.NORMAL);
      this.exitFullscreen_();
      break;
  }
};

/**
 * The VR button was clicked.
 */
WebVRManager.prototype.onVRClick_ = function() {
  // TODO: Remove this hack when iOS has fullscreen mode.
  // If this is an iframe on iOS, break out and open in no_fullscreen mode.
  if (this.mode == Modes.NORMAL && Util.isIOS() && Util.isIFrame()) {
    if (this.vrCallback) {
      this.vrCallback();
    } else {
      var url = window.location.href;
      url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
      url = Util.appendQueryParameter(url, 'start_mode', Modes.VR);
      top.location.href = url;
      return;
    }
  }
  this.enterVRMode_();
};

WebVRManager.prototype.requestFullscreen_ = function() {
  var canvas = document.body;
  //var canvas = this.renderer.domElement;
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
};

WebVRManager.prototype.exitFullscreen_ = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

WebVRManager.prototype.onVRDisplayPresentChange_ = function(e) {
  console.log('onVRDisplayPresentChange_', e);
  if (this.hmd.isPresenting) {
    this.setMode_(Modes.VR);
  } else {
    this.setMode_(Modes.NORMAL);
  }
};

WebVRManager.prototype.onVRDisplayDeviceParamsChange_ = function(e) {
  console.log('onVRDisplayDeviceParamsChange_', e);
};

WebVRManager.prototype.onFullscreenChange_ = function(e) {
  // If we leave full-screen, go back to normal mode.
  if (document.webkitFullscreenElement === null ||
      document.mozFullScreenElement === null) {
    this.setMode_(Modes.NORMAL);
  }
};

module.exports = WebVRManager;

},{"./button-manager.js":1,"./emitter.js":2,"./modes.js":3,"./util.js":4}]},{},[5])(5)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(_dereq_,module,exports){
(function (global){
/**
 * @license
 * webvr-polyfill
 * Copyright (c) 2015-2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * cardboard-vr-display
 * Copyright (c) 2015-2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * webvr-polyfill-dpdb 
 * Copyright (c) 2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * wglu-preserve-state
 * Copyright (c) 2016, Brandon Jones.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @license
 * nosleep.js
 * Copyright (c) 2017, Rich Tibbett
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WebVRPolyfill = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var isMobile = function isMobile() {
  return (/Android/i.test(navigator.userAgent) || /iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
};
var copyArray = function copyArray(source, dest) {
  for (var i = 0, n = source.length; i < n; i++) {
    dest[i] = source[i];
  }
};
var extend = function extend(dest, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }
  return dest;
};

var cardboardVrDisplay = createCommonjsModule(function (module, exports) {
/**
 * @license
 * cardboard-vr-display
 * Copyright (c) 2015-2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * gl-preserve-state
 * Copyright (c) 2016, Brandon Jones.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 * @license
 * webvr-polyfill-dpdb
 * Copyright (c) 2015-2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * nosleep.js
 * Copyright (c) 2017, Rich Tibbett
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
var MIN_TIMESTEP = 0.001;
var MAX_TIMESTEP = 1;
var dataUri = function dataUri(mimeType, svg) {
  return 'data:' + mimeType + ',' + encodeURIComponent(svg);
};
var lerp = function lerp(a, b, t) {
  return a + (b - a) * t;
};
var isIOS = function () {
  var isIOS = /iPad|iPhone|iPod/.test(navigator.platform);
  return function () {
    return isIOS;
  };
}();
var isWebViewAndroid = function () {
  var isWebViewAndroid = navigator.userAgent.indexOf('Version') !== -1 && navigator.userAgent.indexOf('Android') !== -1 && navigator.userAgent.indexOf('Chrome') !== -1;
  return function () {
    return isWebViewAndroid;
  };
}();
var isSafari = function () {
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  return function () {
    return isSafari;
  };
}();
var isFirefoxAndroid = function () {
  var isFirefoxAndroid = navigator.userAgent.indexOf('Firefox') !== -1 && navigator.userAgent.indexOf('Android') !== -1;
  return function () {
    return isFirefoxAndroid;
  };
}();
var getChromeVersion = function () {
  var match = navigator.userAgent.match(/.*Chrome\/([0-9]+)/);
  var value = match ? parseInt(match[1], 10) : null;
  return function () {
    return value;
  };
}();
var isSafariWithoutDeviceMotion = function () {
  var value = false;
  value = isIOS() && isSafari() && navigator.userAgent.indexOf('13_4') !== -1;
  return function () {
    return value;
  };
}();
var isChromeWithoutDeviceMotion = function () {
  var value = false;
  if (getChromeVersion() === 65) {
    var match = navigator.userAgent.match(/.*Chrome\/([0-9\.]*)/);
    if (match) {
      var _match$1$split = match[1].split('.'),
          _match$1$split2 = slicedToArray(_match$1$split, 4),
          major = _match$1$split2[0],
          minor = _match$1$split2[1],
          branch = _match$1$split2[2],
          build = _match$1$split2[3];
      value = parseInt(branch, 10) === 3325 && parseInt(build, 10) < 148;
    }
  }
  return function () {
    return value;
  };
}();
var isR7 = function () {
  var isR7 = navigator.userAgent.indexOf('R7 Build') !== -1;
  return function () {
    return isR7;
  };
}();
var isLandscapeMode = function isLandscapeMode() {
  var rtn = window.orientation == 90 || window.orientation == -90;
  return isR7() ? !rtn : rtn;
};
var isTimestampDeltaValid = function isTimestampDeltaValid(timestampDeltaS) {
  if (isNaN(timestampDeltaS)) {
    return false;
  }
  if (timestampDeltaS <= MIN_TIMESTEP) {
    return false;
  }
  if (timestampDeltaS > MAX_TIMESTEP) {
    return false;
  }
  return true;
};
var getScreenWidth = function getScreenWidth() {
  return Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio;
};
var getScreenHeight = function getScreenHeight() {
  return Math.min(window.screen.width, window.screen.height) * window.devicePixelRatio;
};
var requestFullscreen = function requestFullscreen(element) {
  if (isWebViewAndroid()) {
    return false;
  }
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    return false;
  }
  return true;
};
var exitFullscreen = function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else {
    return false;
  }
  return true;
};
var getFullscreenElement = function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
};
var linkProgram = function linkProgram(gl, vertexSource, fragmentSource, attribLocationMap) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  for (var attribName in attribLocationMap) {
    gl.bindAttribLocation(program, attribLocationMap[attribName], attribName);
  }gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
};
var getProgramUniforms = function getProgramUniforms(gl, program) {
  var uniforms = {};
  var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  var uniformName = '';
  for (var i = 0; i < uniformCount; i++) {
    var uniformInfo = gl.getActiveUniform(program, i);
    uniformName = uniformInfo.name.replace('[0]', '');
    uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
  }
  return uniforms;
};
var orthoMatrix = function orthoMatrix(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right),
      bt = 1 / (bottom - top),
      nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
};
var isMobile = function isMobile() {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
var extend = function extend(dest, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }
  return dest;
};
var safariCssSizeWorkaround = function safariCssSizeWorkaround(canvas) {
  if (isIOS()) {
    var width = canvas.style.width;
    var height = canvas.style.height;
    canvas.style.width = parseInt(width) + 1 + 'px';
    canvas.style.height = parseInt(height) + 'px';
    setTimeout(function () {
      canvas.style.width = width;
      canvas.style.height = height;
    }, 100);
  }
  window.canvas = canvas;
};
var frameDataFromPose = function () {
  var piOver180 = Math.PI / 180.0;
  var rad45 = Math.PI * 0.25;
  function mat4_perspectiveFromFieldOfView(out, fov, near, far) {
    var upTan = Math.tan(fov ? fov.upDegrees * piOver180 : rad45),
        downTan = Math.tan(fov ? fov.downDegrees * piOver180 : rad45),
        leftTan = Math.tan(fov ? fov.leftDegrees * piOver180 : rad45),
        rightTan = Math.tan(fov ? fov.rightDegrees * piOver180 : rad45),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);
    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = (upTan - downTan) * yScale * 0.5;
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = far * near / (near - far);
    out[15] = 0.0;
    return out;
  }
  function mat4_fromRotationTranslation(out, q, v) {
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;
    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function mat4_translate(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2],
        a00,
        a01,
        a02,
        a03,
        a10,
        a11,
        a12,
        a13,
        a20,
        a21,
        a22,
        a23;
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
      a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
      a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];
      out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
      out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
      out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return out;
  }
  function mat4_invert(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,
    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  var defaultOrientation = new Float32Array([0, 0, 0, 1]);
  var defaultPosition = new Float32Array([0, 0, 0]);
  function updateEyeMatrices(projection, view, pose, fov, offset, vrDisplay) {
    mat4_perspectiveFromFieldOfView(projection, fov || null, vrDisplay.depthNear, vrDisplay.depthFar);
    var orientation = pose.orientation || defaultOrientation;
    var position = pose.position || defaultPosition;
    mat4_fromRotationTranslation(view, orientation, position);
    if (offset) mat4_translate(view, view, offset);
    mat4_invert(view, view);
  }
  return function (frameData, pose, vrDisplay) {
    if (!frameData || !pose) return false;
    frameData.pose = pose;
    frameData.timestamp = pose.timestamp;
    updateEyeMatrices(frameData.leftProjectionMatrix, frameData.leftViewMatrix, pose, vrDisplay._getFieldOfView("left"), vrDisplay._getEyeOffset("left"), vrDisplay);
    updateEyeMatrices(frameData.rightProjectionMatrix, frameData.rightViewMatrix, pose, vrDisplay._getFieldOfView("right"), vrDisplay._getEyeOffset("right"), vrDisplay);
    return true;
  };
}();
var isInsideCrossOriginIFrame = function isInsideCrossOriginIFrame() {
  var isFramed = window.self !== window.top;
  var refOrigin = getOriginFromUrl(document.referrer);
  var thisOrigin = getOriginFromUrl(window.location.href);
  return isFramed && refOrigin !== thisOrigin;
};
var getOriginFromUrl = function getOriginFromUrl(url) {
  var domainIdx;
  var protoSepIdx = url.indexOf("://");
  if (protoSepIdx !== -1) {
    domainIdx = protoSepIdx + 3;
  } else {
    domainIdx = 0;
  }
  var domainEndIdx = url.indexOf('/', domainIdx);
  if (domainEndIdx === -1) {
    domainEndIdx = url.length;
  }
  return url.substring(0, domainEndIdx);
};
var getQuaternionAngle = function getQuaternionAngle(quat) {
  if (quat.w > 1) {
    console.warn('getQuaternionAngle: w > 1');
    return 0;
  }
  var angle = 2 * Math.acos(quat.w);
  return angle;
};
var warnOnce = function () {
  var observedWarnings = {};
  return function (key, message) {
    if (observedWarnings[key] === undefined) {
      console.warn('webvr-polyfill: ' + message);
      observedWarnings[key] = true;
    }
  };
}();
var deprecateWarning = function deprecateWarning(deprecated, suggested) {
  var alternative = suggested ? 'Please use ' + suggested + ' instead.' : '';
  warnOnce(deprecated, deprecated + ' has been deprecated. ' + 'This may not work on native WebVR displays. ' + alternative);
};
function WGLUPreserveGLState(gl, bindings, callback) {
  if (!bindings) {
    callback(gl);
    return;
  }
  var boundValues = [];
  var activeTexture = null;
  for (var i = 0; i < bindings.length; ++i) {
    var binding = bindings[i];
    switch (binding) {
      case gl.TEXTURE_BINDING_2D:
      case gl.TEXTURE_BINDING_CUBE_MAP:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31) {
          console.error("TEXTURE_BINDING_2D or TEXTURE_BINDING_CUBE_MAP must be followed by a valid texture unit");
          boundValues.push(null, null);
          break;
        }
        if (!activeTexture) {
          activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
        }
        gl.activeTexture(textureUnit);
        boundValues.push(gl.getParameter(binding), null);
        break;
      case gl.ACTIVE_TEXTURE:
        activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
        boundValues.push(null);
        break;
      default:
        boundValues.push(gl.getParameter(binding));
        break;
    }
  }
  callback(gl);
  for (var i = 0; i < bindings.length; ++i) {
    var binding = bindings[i];
    var boundValue = boundValues[i];
    switch (binding) {
      case gl.ACTIVE_TEXTURE:
        break;
      case gl.ARRAY_BUFFER_BINDING:
        gl.bindBuffer(gl.ARRAY_BUFFER, boundValue);
        break;
      case gl.COLOR_CLEAR_VALUE:
        gl.clearColor(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.COLOR_WRITEMASK:
        gl.colorMask(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.CURRENT_PROGRAM:
        gl.useProgram(boundValue);
        break;
      case gl.ELEMENT_ARRAY_BUFFER_BINDING:
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boundValue);
        break;
      case gl.FRAMEBUFFER_BINDING:
        gl.bindFramebuffer(gl.FRAMEBUFFER, boundValue);
        break;
      case gl.RENDERBUFFER_BINDING:
        gl.bindRenderbuffer(gl.RENDERBUFFER, boundValue);
        break;
      case gl.TEXTURE_BINDING_2D:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
          break;
        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, boundValue);
        break;
      case gl.TEXTURE_BINDING_CUBE_MAP:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
          break;
        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, boundValue);
        break;
      case gl.VIEWPORT:
        gl.viewport(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.BLEND:
      case gl.CULL_FACE:
      case gl.DEPTH_TEST:
      case gl.SCISSOR_TEST:
      case gl.STENCIL_TEST:
        if (boundValue) {
          gl.enable(binding);
        } else {
          gl.disable(binding);
        }
        break;
      default:
        console.log("No GL restore behavior for 0x" + binding.toString(16));
        break;
    }
    if (activeTexture) {
      gl.activeTexture(activeTexture);
    }
  }
}
var glPreserveState = WGLUPreserveGLState;
var distortionVS = ['attribute vec2 position;', 'attribute vec3 texCoord;', 'varying vec2 vTexCoord;', 'uniform vec4 viewportOffsetScale[2];', 'void main() {', '  vec4 viewport = viewportOffsetScale[int(texCoord.z)];', '  vTexCoord = (texCoord.xy * viewport.zw) + viewport.xy;', '  gl_Position = vec4( position, 1.0, 1.0 );', '}'].join('\n');
var distortionFS = ['precision mediump float;', 'uniform sampler2D diffuse;', 'varying vec2 vTexCoord;', 'void main() {', '  gl_FragColor = texture2D(diffuse, vTexCoord);', '}'].join('\n');
function CardboardDistorter(gl, cardboardUI, bufferScale, dirtySubmitFrameBindings) {
  this.gl = gl;
  this.cardboardUI = cardboardUI;
  this.bufferScale = bufferScale;
  this.dirtySubmitFrameBindings = dirtySubmitFrameBindings;
  this.ctxAttribs = gl.getContextAttributes();
  this.instanceExt = gl.getExtension('ANGLE_instanced_arrays');
  this.meshWidth = 20;
  this.meshHeight = 20;
  this.bufferWidth = gl.drawingBufferWidth;
  this.bufferHeight = gl.drawingBufferHeight;
  this.realBindFramebuffer = gl.bindFramebuffer;
  this.realEnable = gl.enable;
  this.realDisable = gl.disable;
  this.realColorMask = gl.colorMask;
  this.realClearColor = gl.clearColor;
  this.realViewport = gl.viewport;
  if (!isIOS()) {
    this.realCanvasWidth = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, 'width');
    this.realCanvasHeight = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, 'height');
  }
  this.isPatched = false;
  this.lastBoundFramebuffer = null;
  this.cullFace = false;
  this.depthTest = false;
  this.blend = false;
  this.scissorTest = false;
  this.stencilTest = false;
  this.viewport = [0, 0, 0, 0];
  this.colorMask = [true, true, true, true];
  this.clearColor = [0, 0, 0, 0];
  this.attribs = {
    position: 0,
    texCoord: 1
  };
  this.program = linkProgram(gl, distortionVS, distortionFS, this.attribs);
  this.uniforms = getProgramUniforms(gl, this.program);
  this.viewportOffsetScale = new Float32Array(8);
  this.setTextureBounds();
  this.vertexBuffer = gl.createBuffer();
  this.indexBuffer = gl.createBuffer();
  this.indexCount = 0;
  this.renderTarget = gl.createTexture();
  this.framebuffer = gl.createFramebuffer();
  this.depthStencilBuffer = null;
  this.depthBuffer = null;
  this.stencilBuffer = null;
  if (this.ctxAttribs.depth && this.ctxAttribs.stencil) {
    this.depthStencilBuffer = gl.createRenderbuffer();
  } else if (this.ctxAttribs.depth) {
    this.depthBuffer = gl.createRenderbuffer();
  } else if (this.ctxAttribs.stencil) {
    this.stencilBuffer = gl.createRenderbuffer();
  }
  this.patch();
  this.onResize();
}
CardboardDistorter.prototype.destroy = function () {
  var gl = this.gl;
  this.unpatch();
  gl.deleteProgram(this.program);
  gl.deleteBuffer(this.vertexBuffer);
  gl.deleteBuffer(this.indexBuffer);
  gl.deleteTexture(this.renderTarget);
  gl.deleteFramebuffer(this.framebuffer);
  if (this.depthStencilBuffer) {
    gl.deleteRenderbuffer(this.depthStencilBuffer);
  }
  if (this.depthBuffer) {
    gl.deleteRenderbuffer(this.depthBuffer);
  }
  if (this.stencilBuffer) {
    gl.deleteRenderbuffer(this.stencilBuffer);
  }
  if (this.cardboardUI) {
    this.cardboardUI.destroy();
  }
};
CardboardDistorter.prototype.onResize = function () {
  var gl = this.gl;
  var self = this;
  var glState = [gl.RENDERBUFFER_BINDING, gl.TEXTURE_BINDING_2D, gl.TEXTURE0];
  glPreserveState(gl, glState, function (gl) {
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, null);
    if (self.scissorTest) {
      self.realDisable.call(gl, gl.SCISSOR_TEST);
    }
    self.realColorMask.call(gl, true, true, true, true);
    self.realViewport.call(gl, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    self.realClearColor.call(gl, 0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, self.renderTarget);
    gl.texImage2D(gl.TEXTURE_2D, 0, self.ctxAttribs.alpha ? gl.RGBA : gl.RGB, self.bufferWidth, self.bufferHeight, 0, self.ctxAttribs.alpha ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, self.renderTarget, 0);
    if (self.ctxAttribs.depth && self.ctxAttribs.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.depthStencilBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, self.depthStencilBuffer);
    } else if (self.ctxAttribs.depth) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, self.depthBuffer);
    } else if (self.ctxAttribs.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.stencilBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, self.stencilBuffer);
    }
    if (!gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer incomplete!');
    }
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.lastBoundFramebuffer);
    if (self.scissorTest) {
      self.realEnable.call(gl, gl.SCISSOR_TEST);
    }
    self.realColorMask.apply(gl, self.colorMask);
    self.realViewport.apply(gl, self.viewport);
    self.realClearColor.apply(gl, self.clearColor);
  });
  if (this.cardboardUI) {
    this.cardboardUI.onResize();
  }
};
CardboardDistorter.prototype.patch = function () {
  if (this.isPatched) {
    return;
  }
  var self = this;
  var canvas = this.gl.canvas;
  var gl = this.gl;
  if (!isIOS()) {
    canvas.width = getScreenWidth() * this.bufferScale;
    canvas.height = getScreenHeight() * this.bufferScale;
    Object.defineProperty(canvas, 'width', {
      configurable: true,
      enumerable: true,
      get: function get() {
        return self.bufferWidth;
      },
      set: function set(value) {
        self.bufferWidth = value;
        self.realCanvasWidth.set.call(canvas, value);
        self.onResize();
      }
    });
    Object.defineProperty(canvas, 'height', {
      configurable: true,
      enumerable: true,
      get: function get() {
        return self.bufferHeight;
      },
      set: function set(value) {
        self.bufferHeight = value;
        self.realCanvasHeight.set.call(canvas, value);
        self.onResize();
      }
    });
  }
  this.lastBoundFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  if (this.lastBoundFramebuffer == null) {
    this.lastBoundFramebuffer = this.framebuffer;
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  }
  this.gl.bindFramebuffer = function (target, framebuffer) {
    self.lastBoundFramebuffer = framebuffer ? framebuffer : self.framebuffer;
    self.realBindFramebuffer.call(gl, target, self.lastBoundFramebuffer);
  };
  this.cullFace = gl.getParameter(gl.CULL_FACE);
  this.depthTest = gl.getParameter(gl.DEPTH_TEST);
  this.blend = gl.getParameter(gl.BLEND);
  this.scissorTest = gl.getParameter(gl.SCISSOR_TEST);
  this.stencilTest = gl.getParameter(gl.STENCIL_TEST);
  gl.enable = function (pname) {
    switch (pname) {
      case gl.CULL_FACE:
        self.cullFace = true;break;
      case gl.DEPTH_TEST:
        self.depthTest = true;break;
      case gl.BLEND:
        self.blend = true;break;
      case gl.SCISSOR_TEST:
        self.scissorTest = true;break;
      case gl.STENCIL_TEST:
        self.stencilTest = true;break;
    }
    self.realEnable.call(gl, pname);
  };
  gl.disable = function (pname) {
    switch (pname) {
      case gl.CULL_FACE:
        self.cullFace = false;break;
      case gl.DEPTH_TEST:
        self.depthTest = false;break;
      case gl.BLEND:
        self.blend = false;break;
      case gl.SCISSOR_TEST:
        self.scissorTest = false;break;
      case gl.STENCIL_TEST:
        self.stencilTest = false;break;
    }
    self.realDisable.call(gl, pname);
  };
  this.colorMask = gl.getParameter(gl.COLOR_WRITEMASK);
  gl.colorMask = function (r, g, b, a) {
    self.colorMask[0] = r;
    self.colorMask[1] = g;
    self.colorMask[2] = b;
    self.colorMask[3] = a;
    self.realColorMask.call(gl, r, g, b, a);
  };
  this.clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
  gl.clearColor = function (r, g, b, a) {
    self.clearColor[0] = r;
    self.clearColor[1] = g;
    self.clearColor[2] = b;
    self.clearColor[3] = a;
    self.realClearColor.call(gl, r, g, b, a);
  };
  this.viewport = gl.getParameter(gl.VIEWPORT);
  gl.viewport = function (x, y, w, h) {
    self.viewport[0] = x;
    self.viewport[1] = y;
    self.viewport[2] = w;
    self.viewport[3] = h;
    self.realViewport.call(gl, x, y, w, h);
  };
  this.isPatched = true;
  safariCssSizeWorkaround(canvas);
};
CardboardDistorter.prototype.unpatch = function () {
  if (!this.isPatched) {
    return;
  }
  var gl = this.gl;
  var canvas = this.gl.canvas;
  if (!isIOS()) {
    Object.defineProperty(canvas, 'width', this.realCanvasWidth);
    Object.defineProperty(canvas, 'height', this.realCanvasHeight);
  }
  canvas.width = this.bufferWidth;
  canvas.height = this.bufferHeight;
  gl.bindFramebuffer = this.realBindFramebuffer;
  gl.enable = this.realEnable;
  gl.disable = this.realDisable;
  gl.colorMask = this.realColorMask;
  gl.clearColor = this.realClearColor;
  gl.viewport = this.realViewport;
  if (this.lastBoundFramebuffer == this.framebuffer) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  this.isPatched = false;
  setTimeout(function () {
    safariCssSizeWorkaround(canvas);
  }, 1);
};
CardboardDistorter.prototype.setTextureBounds = function (leftBounds, rightBounds) {
  if (!leftBounds) {
    leftBounds = [0, 0, 0.5, 1];
  }
  if (!rightBounds) {
    rightBounds = [0.5, 0, 0.5, 1];
  }
  this.viewportOffsetScale[0] = leftBounds[0];
  this.viewportOffsetScale[1] = leftBounds[1];
  this.viewportOffsetScale[2] = leftBounds[2];
  this.viewportOffsetScale[3] = leftBounds[3];
  this.viewportOffsetScale[4] = rightBounds[0];
  this.viewportOffsetScale[5] = rightBounds[1];
  this.viewportOffsetScale[6] = rightBounds[2];
  this.viewportOffsetScale[7] = rightBounds[3];
};
CardboardDistorter.prototype.submitFrame = function () {
  var gl = this.gl;
  var self = this;
  var glState = [];
  if (!this.dirtySubmitFrameBindings) {
    glState.push(gl.CURRENT_PROGRAM, gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING, gl.TEXTURE_BINDING_2D, gl.TEXTURE0);
  }
  glPreserveState(gl, glState, function (gl) {
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, null);
    var positionDivisor = 0;
    var texCoordDivisor = 0;
    if (self.instanceExt) {
      positionDivisor = gl.getVertexAttrib(self.attribs.position, self.instanceExt.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE);
      texCoordDivisor = gl.getVertexAttrib(self.attribs.texCoord, self.instanceExt.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE);
    }
    if (self.cullFace) {
      self.realDisable.call(gl, gl.CULL_FACE);
    }
    if (self.depthTest) {
      self.realDisable.call(gl, gl.DEPTH_TEST);
    }
    if (self.blend) {
      self.realDisable.call(gl, gl.BLEND);
    }
    if (self.scissorTest) {
      self.realDisable.call(gl, gl.SCISSOR_TEST);
    }
    if (self.stencilTest) {
      self.realDisable.call(gl, gl.STENCIL_TEST);
    }
    self.realColorMask.call(gl, true, true, true, true);
    self.realViewport.call(gl, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (self.ctxAttribs.alpha || isIOS()) {
      self.realClearColor.call(gl, 0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.useProgram(self.program);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.enableVertexAttribArray(self.attribs.position);
    gl.enableVertexAttribArray(self.attribs.texCoord);
    gl.vertexAttribPointer(self.attribs.position, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(self.attribs.texCoord, 3, gl.FLOAT, false, 20, 8);
    if (self.instanceExt) {
      if (positionDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.position, 0);
      }
      if (texCoordDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.texCoord, 0);
      }
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(self.uniforms.diffuse, 0);
    gl.bindTexture(gl.TEXTURE_2D, self.renderTarget);
    gl.uniform4fv(self.uniforms.viewportOffsetScale, self.viewportOffsetScale);
    gl.drawElements(gl.TRIANGLES, self.indexCount, gl.UNSIGNED_SHORT, 0);
    if (self.cardboardUI) {
      self.cardboardUI.renderNoState();
    }
    self.realBindFramebuffer.call(self.gl, gl.FRAMEBUFFER, self.framebuffer);
    if (!self.ctxAttribs.preserveDrawingBuffer) {
      self.realClearColor.call(gl, 0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    if (!self.dirtySubmitFrameBindings) {
      self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.lastBoundFramebuffer);
    }
    if (self.cullFace) {
      self.realEnable.call(gl, gl.CULL_FACE);
    }
    if (self.depthTest) {
      self.realEnable.call(gl, gl.DEPTH_TEST);
    }
    if (self.blend) {
      self.realEnable.call(gl, gl.BLEND);
    }
    if (self.scissorTest) {
      self.realEnable.call(gl, gl.SCISSOR_TEST);
    }
    if (self.stencilTest) {
      self.realEnable.call(gl, gl.STENCIL_TEST);
    }
    self.realColorMask.apply(gl, self.colorMask);
    self.realViewport.apply(gl, self.viewport);
    if (self.ctxAttribs.alpha || !self.ctxAttribs.preserveDrawingBuffer) {
      self.realClearColor.apply(gl, self.clearColor);
    }
    if (self.instanceExt) {
      if (positionDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.position, positionDivisor);
      }
      if (texCoordDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.texCoord, texCoordDivisor);
      }
    }
  });
  if (isIOS()) {
    var canvas = gl.canvas;
    if (canvas.width != self.bufferWidth || canvas.height != self.bufferHeight) {
      self.bufferWidth = canvas.width;
      self.bufferHeight = canvas.height;
      self.onResize();
    }
  }
};
CardboardDistorter.prototype.updateDeviceInfo = function (deviceInfo) {
  var gl = this.gl;
  var self = this;
  var glState = [gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING];
  glPreserveState(gl, glState, function (gl) {
    var vertices = self.computeMeshVertices_(self.meshWidth, self.meshHeight, deviceInfo);
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    if (!self.indexCount) {
      var indices = self.computeMeshIndices_(self.meshWidth, self.meshHeight);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      self.indexCount = indices.length;
    }
  });
};
CardboardDistorter.prototype.computeMeshVertices_ = function (width, height, deviceInfo) {
  var vertices = new Float32Array(2 * width * height * 5);
  var lensFrustum = deviceInfo.getLeftEyeVisibleTanAngles();
  var noLensFrustum = deviceInfo.getLeftEyeNoLensTanAngles();
  var viewport = deviceInfo.getLeftEyeVisibleScreenRect(noLensFrustum);
  var vidx = 0;
  for (var e = 0; e < 2; e++) {
    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++, vidx++) {
        var u = i / (width - 1);
        var v = j / (height - 1);
        var s = u;
        var t = v;
        var x = lerp(lensFrustum[0], lensFrustum[2], u);
        var y = lerp(lensFrustum[3], lensFrustum[1], v);
        var d = Math.sqrt(x * x + y * y);
        var r = deviceInfo.distortion.distortInverse(d);
        var p = x * r / d;
        var q = y * r / d;
        u = (p - noLensFrustum[0]) / (noLensFrustum[2] - noLensFrustum[0]);
        v = (q - noLensFrustum[3]) / (noLensFrustum[1] - noLensFrustum[3]);
        u = (viewport.x + u * viewport.width - 0.5) * 2.0;
        v = (viewport.y + v * viewport.height - 0.5) * 2.0;
        vertices[vidx * 5 + 0] = u;
        vertices[vidx * 5 + 1] = v;
        vertices[vidx * 5 + 2] = s;
        vertices[vidx * 5 + 3] = t;
        vertices[vidx * 5 + 4] = e;
      }
    }
    var w = lensFrustum[2] - lensFrustum[0];
    lensFrustum[0] = -(w + lensFrustum[0]);
    lensFrustum[2] = w - lensFrustum[2];
    w = noLensFrustum[2] - noLensFrustum[0];
    noLensFrustum[0] = -(w + noLensFrustum[0]);
    noLensFrustum[2] = w - noLensFrustum[2];
    viewport.x = 1 - (viewport.x + viewport.width);
  }
  return vertices;
};
CardboardDistorter.prototype.computeMeshIndices_ = function (width, height) {
  var indices = new Uint16Array(2 * (width - 1) * (height - 1) * 6);
  var halfwidth = width / 2;
  var halfheight = height / 2;
  var vidx = 0;
  var iidx = 0;
  for (var e = 0; e < 2; e++) {
    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++, vidx++) {
        if (i == 0 || j == 0) continue;
        if (i <= halfwidth == j <= halfheight) {
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - width - 1;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx - width - 1;
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - 1;
        } else {
          indices[iidx++] = vidx - 1;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx - 1;
          indices[iidx++] = vidx - width - 1;
        }
      }
    }
  }
  return indices;
};
CardboardDistorter.prototype.getOwnPropertyDescriptor_ = function (proto, attrName) {
  var descriptor = Object.getOwnPropertyDescriptor(proto, attrName);
  if (descriptor.get === undefined || descriptor.set === undefined) {
    descriptor.configurable = true;
    descriptor.enumerable = true;
    descriptor.get = function () {
      return this.getAttribute(attrName);
    };
    descriptor.set = function (val) {
      this.setAttribute(attrName, val);
    };
  }
  return descriptor;
};
var uiVS = ['attribute vec2 position;', 'uniform mat4 projectionMat;', 'void main() {', '  gl_Position = projectionMat * vec4( position, -1.0, 1.0 );', '}'].join('\n');
var uiFS = ['precision mediump float;', 'uniform vec4 color;', 'void main() {', '  gl_FragColor = color;', '}'].join('\n');
var DEG2RAD = Math.PI / 180.0;
var kAnglePerGearSection = 60;
var kOuterRimEndAngle = 12;
var kInnerRimBeginAngle = 20;
var kOuterRadius = 1;
var kMiddleRadius = 0.75;
var kInnerRadius = 0.3125;
var kCenterLineThicknessDp = 4;
var kButtonWidthDp = 28;
var kTouchSlopFactor = 1.5;
function CardboardUI(gl) {
  this.gl = gl;
  this.attribs = {
    position: 0
  };
  this.program = linkProgram(gl, uiVS, uiFS, this.attribs);
  this.uniforms = getProgramUniforms(gl, this.program);
  this.vertexBuffer = gl.createBuffer();
  this.gearOffset = 0;
  this.gearVertexCount = 0;
  this.arrowOffset = 0;
  this.arrowVertexCount = 0;
  this.projMat = new Float32Array(16);
  this.listener = null;
  this.onResize();
}
CardboardUI.prototype.destroy = function () {
  var gl = this.gl;
  if (this.listener) {
    gl.canvas.removeEventListener('click', this.listener, false);
  }
  gl.deleteProgram(this.program);
  gl.deleteBuffer(this.vertexBuffer);
};
CardboardUI.prototype.listen = function (optionsCallback, backCallback) {
  var canvas = this.gl.canvas;
  this.listener = function (event) {
    var midline = canvas.clientWidth / 2;
    var buttonSize = kButtonWidthDp * kTouchSlopFactor;
    if (event.clientX > midline - buttonSize && event.clientX < midline + buttonSize && event.clientY > canvas.clientHeight - buttonSize) {
      optionsCallback(event);
    }
    else if (event.clientX < buttonSize && event.clientY < buttonSize) {
        backCallback(event);
      }
  };
  canvas.addEventListener('click', this.listener, false);
};
CardboardUI.prototype.onResize = function () {
  var gl = this.gl;
  var self = this;
  var glState = [gl.ARRAY_BUFFER_BINDING];
  glPreserveState(gl, glState, function (gl) {
    var vertices = [];
    var midline = gl.drawingBufferWidth / 2;
    var physicalPixels = Math.max(screen.width, screen.height) * window.devicePixelRatio;
    var scalingRatio = gl.drawingBufferWidth / physicalPixels;
    var dps = scalingRatio * window.devicePixelRatio;
    var lineWidth = kCenterLineThicknessDp * dps / 2;
    var buttonSize = kButtonWidthDp * kTouchSlopFactor * dps;
    var buttonScale = kButtonWidthDp * dps / 2;
    var buttonBorder = (kButtonWidthDp * kTouchSlopFactor - kButtonWidthDp) * dps;
    vertices.push(midline - lineWidth, buttonSize);
    vertices.push(midline - lineWidth, gl.drawingBufferHeight);
    vertices.push(midline + lineWidth, buttonSize);
    vertices.push(midline + lineWidth, gl.drawingBufferHeight);
    self.gearOffset = vertices.length / 2;
    function addGearSegment(theta, r) {
      var angle = (90 - theta) * DEG2RAD;
      var x = Math.cos(angle);
      var y = Math.sin(angle);
      vertices.push(kInnerRadius * x * buttonScale + midline, kInnerRadius * y * buttonScale + buttonScale);
      vertices.push(r * x * buttonScale + midline, r * y * buttonScale + buttonScale);
    }
    for (var i = 0; i <= 6; i++) {
      var segmentTheta = i * kAnglePerGearSection;
      addGearSegment(segmentTheta, kOuterRadius);
      addGearSegment(segmentTheta + kOuterRimEndAngle, kOuterRadius);
      addGearSegment(segmentTheta + kInnerRimBeginAngle, kMiddleRadius);
      addGearSegment(segmentTheta + (kAnglePerGearSection - kInnerRimBeginAngle), kMiddleRadius);
      addGearSegment(segmentTheta + (kAnglePerGearSection - kOuterRimEndAngle), kOuterRadius);
    }
    self.gearVertexCount = vertices.length / 2 - self.gearOffset;
    self.arrowOffset = vertices.length / 2;
    function addArrowVertex(x, y) {
      vertices.push(buttonBorder + x, gl.drawingBufferHeight - buttonBorder - y);
    }
    var angledLineWidth = lineWidth / Math.sin(45 * DEG2RAD);
    addArrowVertex(0, buttonScale);
    addArrowVertex(buttonScale, 0);
    addArrowVertex(buttonScale + angledLineWidth, angledLineWidth);
    addArrowVertex(angledLineWidth, buttonScale + angledLineWidth);
    addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
    addArrowVertex(0, buttonScale);
    addArrowVertex(buttonScale, buttonScale * 2);
    addArrowVertex(buttonScale + angledLineWidth, buttonScale * 2 - angledLineWidth);
    addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
    addArrowVertex(0, buttonScale);
    addArrowVertex(angledLineWidth, buttonScale - lineWidth);
    addArrowVertex(kButtonWidthDp * dps, buttonScale - lineWidth);
    addArrowVertex(angledLineWidth, buttonScale + lineWidth);
    addArrowVertex(kButtonWidthDp * dps, buttonScale + lineWidth);
    self.arrowVertexCount = vertices.length / 2 - self.arrowOffset;
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  });
};
CardboardUI.prototype.render = function () {
  var gl = this.gl;
  var self = this;
  var glState = [gl.CULL_FACE, gl.DEPTH_TEST, gl.BLEND, gl.SCISSOR_TEST, gl.STENCIL_TEST, gl.COLOR_WRITEMASK, gl.VIEWPORT, gl.CURRENT_PROGRAM, gl.ARRAY_BUFFER_BINDING];
  glPreserveState(gl, glState, function (gl) {
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.STENCIL_TEST);
    gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    self.renderNoState();
  });
};
CardboardUI.prototype.renderNoState = function () {
  var gl = this.gl;
  gl.useProgram(this.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.enableVertexAttribArray(this.attribs.position);
  gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 8, 0);
  gl.uniform4f(this.uniforms.color, 1.0, 1.0, 1.0, 1.0);
  orthoMatrix(this.projMat, 0, gl.drawingBufferWidth, 0, gl.drawingBufferHeight, 0.1, 1024.0);
  gl.uniformMatrix4fv(this.uniforms.projectionMat, false, this.projMat);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.drawArrays(gl.TRIANGLE_STRIP, this.gearOffset, this.gearVertexCount);
  gl.drawArrays(gl.TRIANGLE_STRIP, this.arrowOffset, this.arrowVertexCount);
};
function Distortion(coefficients) {
  this.coefficients = coefficients;
}
Distortion.prototype.distortInverse = function (radius) {
  var r0 = 0;
  var r1 = 1;
  var dr0 = radius - this.distort(r0);
  while (Math.abs(r1 - r0) > 0.0001             ) {
    var dr1 = radius - this.distort(r1);
    var r2 = r1 - dr1 * ((r1 - r0) / (dr1 - dr0));
    r0 = r1;
    r1 = r2;
    dr0 = dr1;
  }
  return r1;
};
Distortion.prototype.distort = function (radius) {
  var r2 = radius * radius;
  var ret = 0;
  for (var i = 0; i < this.coefficients.length; i++) {
    ret = r2 * (ret + this.coefficients[i]);
  }
  return (ret + 1) * radius;
};
var degToRad = Math.PI / 180;
var radToDeg = 180 / Math.PI;
var Vector3 = function Vector3(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};
Vector3.prototype = {
  constructor: Vector3,
  set: function set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },
  copy: function copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  },
  length: function length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  normalize: function normalize() {
    var scalar = this.length();
    if (scalar !== 0) {
      var invScalar = 1 / scalar;
      this.multiplyScalar(invScalar);
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return this;
  },
  multiplyScalar: function multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
  },
  applyQuaternion: function applyQuaternion(q) {
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var qx = q.x;
    var qy = q.y;
    var qz = q.z;
    var qw = q.w;
    var ix = qw * x + qy * z - qz * y;
    var iy = qw * y + qz * x - qx * z;
    var iz = qw * z + qx * y - qy * x;
    var iw = -qx * x - qy * y - qz * z;
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return this;
  },
  dot: function dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  crossVectors: function crossVectors(a, b) {
    var ax = a.x,
        ay = a.y,
        az = a.z;
    var bx = b.x,
        by = b.y,
        bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }
};
var Quaternion = function Quaternion(x, y, z, w) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = w !== undefined ? w : 1;
};
Quaternion.prototype = {
  constructor: Quaternion,
  set: function set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  },
  copy: function copy(quaternion) {
    this.x = quaternion.x;
    this.y = quaternion.y;
    this.z = quaternion.z;
    this.w = quaternion.w;
    return this;
  },
  setFromEulerXYZ: function setFromEulerXYZ(x, y, z) {
    var c1 = Math.cos(x / 2);
    var c2 = Math.cos(y / 2);
    var c3 = Math.cos(z / 2);
    var s1 = Math.sin(x / 2);
    var s2 = Math.sin(y / 2);
    var s3 = Math.sin(z / 2);
    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 + s1 * s2 * c3;
    this.w = c1 * c2 * c3 - s1 * s2 * s3;
    return this;
  },
  setFromEulerYXZ: function setFromEulerYXZ(x, y, z) {
    var c1 = Math.cos(x / 2);
    var c2 = Math.cos(y / 2);
    var c3 = Math.cos(z / 2);
    var s1 = Math.sin(x / 2);
    var s2 = Math.sin(y / 2);
    var s3 = Math.sin(z / 2);
    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 - s1 * s2 * c3;
    this.w = c1 * c2 * c3 + s1 * s2 * s3;
    return this;
  },
  setFromAxisAngle: function setFromAxisAngle(axis, angle) {
    var halfAngle = angle / 2,
        s = Math.sin(halfAngle);
    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(halfAngle);
    return this;
  },
  multiply: function multiply(q) {
    return this.multiplyQuaternions(this, q);
  },
  multiplyQuaternions: function multiplyQuaternions(a, b) {
    var qax = a.x,
        qay = a.y,
        qaz = a.z,
        qaw = a.w;
    var qbx = b.x,
        qby = b.y,
        qbz = b.z,
        qbw = b.w;
    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    return this;
  },
  inverse: function inverse() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    this.normalize();
    return this;
  },
  normalize: function normalize() {
    var l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    if (l === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      l = 1 / l;
      this.x = this.x * l;
      this.y = this.y * l;
      this.z = this.z * l;
      this.w = this.w * l;
    }
    return this;
  },
  slerp: function slerp(qb, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);
    var x = this.x,
        y = this.y,
        z = this.z,
        w = this.w;
    var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
    if (cosHalfTheta < 0) {
      this.w = -qb.w;
      this.x = -qb.x;
      this.y = -qb.y;
      this.z = -qb.z;
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }
    if (cosHalfTheta >= 1.0) {
      this.w = w;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    var halfTheta = Math.acos(cosHalfTheta);
    var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
    if (Math.abs(sinHalfTheta) < 0.001) {
      this.w = 0.5 * (w + this.w);
      this.x = 0.5 * (x + this.x);
      this.y = 0.5 * (y + this.y);
      this.z = 0.5 * (z + this.z);
      return this;
    }
    var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
        ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    this.w = w * ratioA + this.w * ratioB;
    this.x = x * ratioA + this.x * ratioB;
    this.y = y * ratioA + this.y * ratioB;
    this.z = z * ratioA + this.z * ratioB;
    return this;
  },
  setFromUnitVectors: function () {
    var v1, r;
    var EPS = 0.000001;
    return function (vFrom, vTo) {
      if (v1 === undefined) v1 = new Vector3();
      r = vFrom.dot(vTo) + 1;
      if (r < EPS) {
        r = 0;
        if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
          v1.set(-vFrom.y, vFrom.x, 0);
        } else {
          v1.set(0, -vFrom.z, vFrom.y);
        }
      } else {
        v1.crossVectors(vFrom, vTo);
      }
      this.x = v1.x;
      this.y = v1.y;
      this.z = v1.z;
      this.w = r;
      this.normalize();
      return this;
    };
  }()
};
function Device(params) {
  this.width = params.width || getScreenWidth();
  this.height = params.height || getScreenHeight();
  this.widthMeters = params.widthMeters;
  this.heightMeters = params.heightMeters;
  this.bevelMeters = params.bevelMeters;
}
var DEFAULT_ANDROID = new Device({
  widthMeters: 0.110,
  heightMeters: 0.062,
  bevelMeters: 0.004
});
var DEFAULT_IOS = new Device({
  widthMeters: 0.1038,
  heightMeters: 0.0584,
  bevelMeters: 0.004
});
var Viewers = {
  CardboardV1: new CardboardViewer({
    id: 'CardboardV1',
    label: 'Cardboard I/O 2014',
    fov: 40,
    interLensDistance: 0.060,
    baselineLensDistance: 0.035,
    screenLensDistance: 0.042,
    distortionCoefficients: [0.441, 0.156],
    inverseCoefficients: [-0.4410035, 0.42756155, -0.4804439, 0.5460139, -0.58821183, 0.5733938, -0.48303202, 0.33299083, -0.17573841, 0.0651772, -0.01488963, 0.001559834]
  }),
  CardboardV2: new CardboardViewer({
    id: 'CardboardV2',
    label: 'Cardboard I/O 2015',
    fov: 60,
    interLensDistance: 0.064,
    baselineLensDistance: 0.035,
    screenLensDistance: 0.039,
    distortionCoefficients: [0.34, 0.55],
    inverseCoefficients: [-0.33836704, -0.18162185, 0.862655, -1.2462051, 1.0560602, -0.58208317, 0.21609078, -0.05444823, 0.009177956, -9.904169E-4, 6.183535E-5, -1.6981803E-6]
  })
};
function DeviceInfo(deviceParams, additionalViewers) {
  this.viewer = Viewers.CardboardV2;
  this.updateDeviceParams(deviceParams);
  this.distortion = new Distortion(this.viewer.distortionCoefficients);
  for (var i = 0; i < additionalViewers.length; i++) {
    var viewer = additionalViewers[i];
    Viewers[viewer.id] = new CardboardViewer(viewer);
  }
}
DeviceInfo.prototype.updateDeviceParams = function (deviceParams) {
  this.device = this.determineDevice_(deviceParams) || this.device;
};
DeviceInfo.prototype.getDevice = function () {
  return this.device;
};
DeviceInfo.prototype.setViewer = function (viewer) {
  this.viewer = viewer;
  this.distortion = new Distortion(this.viewer.distortionCoefficients);
};
DeviceInfo.prototype.determineDevice_ = function (deviceParams) {
  if (!deviceParams) {
    if (isIOS()) {
      console.warn('Using fallback iOS device measurements.');
      return DEFAULT_IOS;
    } else {
      console.warn('Using fallback Android device measurements.');
      return DEFAULT_ANDROID;
    }
  }
  var METERS_PER_INCH = 0.0254;
  var metersPerPixelX = METERS_PER_INCH / deviceParams.xdpi;
  var metersPerPixelY = METERS_PER_INCH / deviceParams.ydpi;
  var width = getScreenWidth();
  var height = getScreenHeight();
  return new Device({
    widthMeters: metersPerPixelX * width,
    heightMeters: metersPerPixelY * height,
    bevelMeters: deviceParams.bevelMm * 0.001
  });
};
DeviceInfo.prototype.getDistortedFieldOfViewLeftEye = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var eyeToScreenDistance = viewer.screenLensDistance;
  var outerDist = (device.widthMeters - viewer.interLensDistance) / 2;
  var innerDist = viewer.interLensDistance / 2;
  var bottomDist = viewer.baselineLensDistance - device.bevelMeters;
  var topDist = device.heightMeters - bottomDist;
  var outerAngle = radToDeg * Math.atan(distortion.distort(outerDist / eyeToScreenDistance));
  var innerAngle = radToDeg * Math.atan(distortion.distort(innerDist / eyeToScreenDistance));
  var bottomAngle = radToDeg * Math.atan(distortion.distort(bottomDist / eyeToScreenDistance));
  var topAngle = radToDeg * Math.atan(distortion.distort(topDist / eyeToScreenDistance));
  return {
    leftDegrees: Math.min(outerAngle, viewer.fov),
    rightDegrees: Math.min(innerAngle, viewer.fov),
    downDegrees: Math.min(bottomAngle, viewer.fov),
    upDegrees: Math.min(topAngle, viewer.fov)
  };
};
DeviceInfo.prototype.getLeftEyeVisibleTanAngles = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var fovLeft = Math.tan(-degToRad * viewer.fov);
  var fovTop = Math.tan(degToRad * viewer.fov);
  var fovRight = Math.tan(degToRad * viewer.fov);
  var fovBottom = Math.tan(-degToRad * viewer.fov);
  var halfWidth = device.widthMeters / 4;
  var halfHeight = device.heightMeters / 2;
  var verticalLensOffset = viewer.baselineLensDistance - device.bevelMeters - halfHeight;
  var centerX = viewer.interLensDistance / 2 - halfWidth;
  var centerY = -verticalLensOffset;
  var centerZ = viewer.screenLensDistance;
  var screenLeft = distortion.distort((centerX - halfWidth) / centerZ);
  var screenTop = distortion.distort((centerY + halfHeight) / centerZ);
  var screenRight = distortion.distort((centerX + halfWidth) / centerZ);
  var screenBottom = distortion.distort((centerY - halfHeight) / centerZ);
  var result = new Float32Array(4);
  result[0] = Math.max(fovLeft, screenLeft);
  result[1] = Math.min(fovTop, screenTop);
  result[2] = Math.min(fovRight, screenRight);
  result[3] = Math.max(fovBottom, screenBottom);
  return result;
};
DeviceInfo.prototype.getLeftEyeNoLensTanAngles = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var result = new Float32Array(4);
  var fovLeft = distortion.distortInverse(Math.tan(-degToRad * viewer.fov));
  var fovTop = distortion.distortInverse(Math.tan(degToRad * viewer.fov));
  var fovRight = distortion.distortInverse(Math.tan(degToRad * viewer.fov));
  var fovBottom = distortion.distortInverse(Math.tan(-degToRad * viewer.fov));
  var halfWidth = device.widthMeters / 4;
  var halfHeight = device.heightMeters / 2;
  var verticalLensOffset = viewer.baselineLensDistance - device.bevelMeters - halfHeight;
  var centerX = viewer.interLensDistance / 2 - halfWidth;
  var centerY = -verticalLensOffset;
  var centerZ = viewer.screenLensDistance;
  var screenLeft = (centerX - halfWidth) / centerZ;
  var screenTop = (centerY + halfHeight) / centerZ;
  var screenRight = (centerX + halfWidth) / centerZ;
  var screenBottom = (centerY - halfHeight) / centerZ;
  result[0] = Math.max(fovLeft, screenLeft);
  result[1] = Math.min(fovTop, screenTop);
  result[2] = Math.min(fovRight, screenRight);
  result[3] = Math.max(fovBottom, screenBottom);
  return result;
};
DeviceInfo.prototype.getLeftEyeVisibleScreenRect = function (undistortedFrustum) {
  var viewer = this.viewer;
  var device = this.device;
  var dist = viewer.screenLensDistance;
  var eyeX = (device.widthMeters - viewer.interLensDistance) / 2;
  var eyeY = viewer.baselineLensDistance - device.bevelMeters;
  var left = (undistortedFrustum[0] * dist + eyeX) / device.widthMeters;
  var top = (undistortedFrustum[1] * dist + eyeY) / device.heightMeters;
  var right = (undistortedFrustum[2] * dist + eyeX) / device.widthMeters;
  var bottom = (undistortedFrustum[3] * dist + eyeY) / device.heightMeters;
  return {
    x: left,
    y: bottom,
    width: right - left,
    height: top - bottom
  };
};
DeviceInfo.prototype.getFieldOfViewLeftEye = function (opt_isUndistorted) {
  return opt_isUndistorted ? this.getUndistortedFieldOfViewLeftEye() : this.getDistortedFieldOfViewLeftEye();
};
DeviceInfo.prototype.getFieldOfViewRightEye = function (opt_isUndistorted) {
  var fov = this.getFieldOfViewLeftEye(opt_isUndistorted);
  return {
    leftDegrees: fov.rightDegrees,
    rightDegrees: fov.leftDegrees,
    upDegrees: fov.upDegrees,
    downDegrees: fov.downDegrees
  };
};
DeviceInfo.prototype.getUndistortedFieldOfViewLeftEye = function () {
  var p = this.getUndistortedParams_();
  return {
    leftDegrees: radToDeg * Math.atan(p.outerDist),
    rightDegrees: radToDeg * Math.atan(p.innerDist),
    downDegrees: radToDeg * Math.atan(p.bottomDist),
    upDegrees: radToDeg * Math.atan(p.topDist)
  };
};
DeviceInfo.prototype.getUndistortedViewportLeftEye = function () {
  var p = this.getUndistortedParams_();
  var viewer = this.viewer;
  var device = this.device;
  var eyeToScreenDistance = viewer.screenLensDistance;
  var screenWidth = device.widthMeters / eyeToScreenDistance;
  var screenHeight = device.heightMeters / eyeToScreenDistance;
  var xPxPerTanAngle = device.width / screenWidth;
  var yPxPerTanAngle = device.height / screenHeight;
  var x = Math.round((p.eyePosX - p.outerDist) * xPxPerTanAngle);
  var y = Math.round((p.eyePosY - p.bottomDist) * yPxPerTanAngle);
  return {
    x: x,
    y: y,
    width: Math.round((p.eyePosX + p.innerDist) * xPxPerTanAngle) - x,
    height: Math.round((p.eyePosY + p.topDist) * yPxPerTanAngle) - y
  };
};
DeviceInfo.prototype.getUndistortedParams_ = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var eyeToScreenDistance = viewer.screenLensDistance;
  var halfLensDistance = viewer.interLensDistance / 2 / eyeToScreenDistance;
  var screenWidth = device.widthMeters / eyeToScreenDistance;
  var screenHeight = device.heightMeters / eyeToScreenDistance;
  var eyePosX = screenWidth / 2 - halfLensDistance;
  var eyePosY = (viewer.baselineLensDistance - device.bevelMeters) / eyeToScreenDistance;
  var maxFov = viewer.fov;
  var viewerMax = distortion.distortInverse(Math.tan(degToRad * maxFov));
  var outerDist = Math.min(eyePosX, viewerMax);
  var innerDist = Math.min(halfLensDistance, viewerMax);
  var bottomDist = Math.min(eyePosY, viewerMax);
  var topDist = Math.min(screenHeight - eyePosY, viewerMax);
  return {
    outerDist: outerDist,
    innerDist: innerDist,
    topDist: topDist,
    bottomDist: bottomDist,
    eyePosX: eyePosX,
    eyePosY: eyePosY
  };
};
function CardboardViewer(params) {
  this.id = params.id;
  this.label = params.label;
  this.fov = params.fov;
  this.interLensDistance = params.interLensDistance;
  this.baselineLensDistance = params.baselineLensDistance;
  this.screenLensDistance = params.screenLensDistance;
  this.distortionCoefficients = params.distortionCoefficients;
  this.inverseCoefficients = params.inverseCoefficients;
}
DeviceInfo.Viewers = Viewers;
var format = 1;
var last_updated = "2019-11-09T17:36:14Z";
var devices = [{"type":"android","rules":[{"mdmh":"asus/*/Nexus 7/*"},{"ua":"Nexus 7"}],"dpi":[320.8,323],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"asus/*/ASUS_X00PD/*"},{"ua":"ASUS_X00PD"}],"dpi":245,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"asus/*/ASUS_X008D/*"},{"ua":"ASUS_X008D"}],"dpi":282,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"asus/*/ASUS_Z00AD/*"},{"ua":"ASUS_Z00AD"}],"dpi":[403,404.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 2 XL/*"},{"ua":"Pixel 2 XL"}],"dpi":537.9,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 3 XL/*"},{"ua":"Pixel 3 XL"}],"dpi":[558.5,553.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel XL/*"},{"ua":"Pixel XL"}],"dpi":[537.9,533],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 3/*"},{"ua":"Pixel 3"}],"dpi":442.4,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 2/*"},{"ua":"Pixel 2"}],"dpi":441,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"Google/*/Pixel/*"},{"ua":"Pixel"}],"dpi":[432.6,436.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"HTC/*/HTC6435LVW/*"},{"ua":"HTC6435LVW"}],"dpi":[449.7,443.3],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One XL/*"},{"ua":"HTC One XL"}],"dpi":[315.3,314.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"htc/*/Nexus 9/*"},{"ua":"Nexus 9"}],"dpi":289,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One M9/*"},{"ua":"HTC One M9"}],"dpi":[442.5,443.3],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One_M8/*"},{"ua":"HTC One_M8"}],"dpi":[449.7,447.4],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One/*"},{"ua":"HTC One"}],"dpi":472.8,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Huawei/*/Nexus 6P/*"},{"ua":"Nexus 6P"}],"dpi":[515.1,518],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Huawei/*/BLN-L24/*"},{"ua":"HONORBLN-L24"}],"dpi":480,"bw":4,"ac":500},{"type":"android","rules":[{"mdmh":"Huawei/*/BKL-L09/*"},{"ua":"BKL-L09"}],"dpi":403,"bw":3.47,"ac":500},{"type":"android","rules":[{"mdmh":"LENOVO/*/Lenovo PB2-690Y/*"},{"ua":"Lenovo PB2-690Y"}],"dpi":[457.2,454.713],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/Nexus 5X/*"},{"ua":"Nexus 5X"}],"dpi":[422,419.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LGMS345/*"},{"ua":"LGMS345"}],"dpi":[221.7,219.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/LG-D800/*"},{"ua":"LG-D800"}],"dpi":[422,424.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/LG-D850/*"},{"ua":"LG-D850"}],"dpi":[537.9,541.9],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/VS985 4G/*"},{"ua":"VS985 4G"}],"dpi":[537.9,535.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/Nexus 5/*"},{"ua":"Nexus 5 B"}],"dpi":[442.4,444.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/Nexus 4/*"},{"ua":"Nexus 4"}],"dpi":[319.8,318.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LG-P769/*"},{"ua":"LG-P769"}],"dpi":[240.6,247.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LGMS323/*"},{"ua":"LGMS323"}],"dpi":[206.6,204.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LGLS996/*"},{"ua":"LGLS996"}],"dpi":[403.4,401.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Micromax/*/4560MMX/*"},{"ua":"4560MMX"}],"dpi":[240,219.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Micromax/*/A250/*"},{"ua":"Micromax A250"}],"dpi":[480,446.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Micromax/*/Micromax AQ4501/*"},{"ua":"Micromax AQ4501"}],"dpi":240,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/G5/*"},{"ua":"Moto G (5) Plus"}],"dpi":[403.4,403],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/DROID RAZR/*"},{"ua":"DROID RAZR"}],"dpi":[368.1,256.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT830C/*"},{"ua":"XT830C"}],"dpi":[254,255.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1021/*"},{"ua":"XT1021"}],"dpi":[254,256.7],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1023/*"},{"ua":"XT1023"}],"dpi":[254,256.7],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1028/*"},{"ua":"XT1028"}],"dpi":[326.6,327.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1034/*"},{"ua":"XT1034"}],"dpi":[326.6,328.4],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1053/*"},{"ua":"XT1053"}],"dpi":[315.3,316.1],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1562/*"},{"ua":"XT1562"}],"dpi":[403.4,402.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/Nexus 6/*"},{"ua":"Nexus 6 B"}],"dpi":[494.3,489.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1063/*"},{"ua":"XT1063"}],"dpi":[295,296.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1064/*"},{"ua":"XT1064"}],"dpi":[295,295.6],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1092/*"},{"ua":"XT1092"}],"dpi":[422,424.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1095/*"},{"ua":"XT1095"}],"dpi":[422,423.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/G4/*"},{"ua":"Moto G (4)"}],"dpi":401,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/A0001/*"},{"ua":"A0001"}],"dpi":[403.4,401],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE E1001/*"},{"ua":"ONE E1001"}],"dpi":[442.4,441.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE E1003/*"},{"ua":"ONE E1003"}],"dpi":[442.4,441.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE E1005/*"},{"ua":"ONE E1005"}],"dpi":[442.4,441.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A2001/*"},{"ua":"ONE A2001"}],"dpi":[391.9,405.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A2003/*"},{"ua":"ONE A2003"}],"dpi":[391.9,405.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A2005/*"},{"ua":"ONE A2005"}],"dpi":[391.9,405.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A3000/*"},{"ua":"ONEPLUS A3000"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A3003/*"},{"ua":"ONEPLUS A3003"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A3010/*"},{"ua":"ONEPLUS A3010"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A5000/*"},{"ua":"ONEPLUS A5000 "}],"dpi":[403.411,399.737],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A5010/*"},{"ua":"ONEPLUS A5010"}],"dpi":[403,400],"bw":2,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6000/*"},{"ua":"ONEPLUS A6000"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6003/*"},{"ua":"ONEPLUS A6003"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6010/*"},{"ua":"ONEPLUS A6010"}],"dpi":401,"bw":2,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6013/*"},{"ua":"ONEPLUS A6013"}],"dpi":401,"bw":2,"ac":500},{"type":"android","rules":[{"mdmh":"OPPO/*/X909/*"},{"ua":"X909"}],"dpi":[442.4,444.1],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9082/*"},{"ua":"GT-I9082"}],"dpi":[184.7,185.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G360P/*"},{"ua":"SM-G360P"}],"dpi":[196.7,205.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/Nexus S/*"},{"ua":"Nexus S"}],"dpi":[234.5,229.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9300/*"},{"ua":"GT-I9300"}],"dpi":[304.8,303.9],"bw":5,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-T230NU/*"},{"ua":"SM-T230NU"}],"dpi":216,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SGH-T399/*"},{"ua":"SGH-T399"}],"dpi":[217.7,231.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SGH-M919/*"},{"ua":"SGH-M919"}],"dpi":[440.8,437.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N9005/*"},{"ua":"SM-N9005"}],"dpi":[386.4,387],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SAMSUNG-SM-N900A/*"},{"ua":"SAMSUNG-SM-N900A"}],"dpi":[386.4,387.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9500/*"},{"ua":"GT-I9500"}],"dpi":[442.5,443.3],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9505/*"},{"ua":"GT-I9505"}],"dpi":439.4,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G900F/*"},{"ua":"SM-G900F"}],"dpi":[415.6,431.6],"bw":5,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G900M/*"},{"ua":"SM-G900M"}],"dpi":[415.6,431.6],"bw":5,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G800F/*"},{"ua":"SM-G800F"}],"dpi":326.8,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G906S/*"},{"ua":"SM-G906S"}],"dpi":[562.7,572.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9300/*"},{"ua":"GT-I9300"}],"dpi":[306.7,304.8],"bw":5,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-T535/*"},{"ua":"SM-T535"}],"dpi":[142.6,136.4],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N920C/*"},{"ua":"SM-N920C"}],"dpi":[515.1,518.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N920P/*"},{"ua":"SM-N920P"}],"dpi":[386.3655,390.144],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N920W8/*"},{"ua":"SM-N920W8"}],"dpi":[515.1,518.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9300I/*"},{"ua":"GT-I9300I"}],"dpi":[304.8,305.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9195/*"},{"ua":"GT-I9195"}],"dpi":[249.4,256.7],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SPH-L520/*"},{"ua":"SPH-L520"}],"dpi":[249.4,255.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SAMSUNG-SGH-I717/*"},{"ua":"SAMSUNG-SGH-I717"}],"dpi":285.8,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SPH-D710/*"},{"ua":"SPH-D710"}],"dpi":[217.7,204.2],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-N7100/*"},{"ua":"GT-N7100"}],"dpi":265.1,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SCH-I605/*"},{"ua":"SCH-I605"}],"dpi":265.1,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/Galaxy Nexus/*"},{"ua":"Galaxy Nexus"}],"dpi":[315.3,314.2],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N910H/*"},{"ua":"SM-N910H"}],"dpi":[515.1,518],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N910C/*"},{"ua":"SM-N910C"}],"dpi":[515.2,520.2],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G130M/*"},{"ua":"SM-G130M"}],"dpi":[165.9,164.8],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G928I/*"},{"ua":"SM-G928I"}],"dpi":[515.1,518.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G920F/*"},{"ua":"SM-G920F"}],"dpi":580.6,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G920P/*"},{"ua":"SM-G920P"}],"dpi":[522.5,577],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G925F/*"},{"ua":"SM-G925F"}],"dpi":580.6,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G925V/*"},{"ua":"SM-G925V"}],"dpi":[522.5,576.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G930F/*"},{"ua":"SM-G930F"}],"dpi":576.6,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G935F/*"},{"ua":"SM-G935F"}],"dpi":533,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G950F/*"},{"ua":"SM-G950F"}],"dpi":[562.707,565.293],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G955U/*"},{"ua":"SM-G955U"}],"dpi":[522.514,525.762],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G955F/*"},{"ua":"SM-G955F"}],"dpi":[522.514,525.762],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960F/*"},{"ua":"SM-G960F"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G9600/*"},{"ua":"SM-G9600"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960T/*"},{"ua":"SM-G960T"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960N/*"},{"ua":"SM-G960N"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960U/*"},{"ua":"SM-G960U"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G9608/*"},{"ua":"SM-G9608"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960FD/*"},{"ua":"SM-G960FD"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960W/*"},{"ua":"SM-G960W"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G965F/*"},{"ua":"SM-G965F"}],"dpi":529,"bw":2,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/C6903/*"},{"ua":"C6903"}],"dpi":[442.5,443.3],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"Sony/*/D6653/*"},{"ua":"D6653"}],"dpi":[428.6,427.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/E6653/*"},{"ua":"E6653"}],"dpi":[428.6,425.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/E6853/*"},{"ua":"E6853"}],"dpi":[403.4,401.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/SGP321/*"},{"ua":"SGP321"}],"dpi":[224.7,224.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"TCT/*/ALCATEL ONE TOUCH Fierce/*"},{"ua":"ALCATEL ONE TOUCH Fierce"}],"dpi":[240,247.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"THL/*/thl 5000/*"},{"ua":"thl 5000"}],"dpi":[480,443.3],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Fly/*/IQ4412/*"},{"ua":"IQ4412"}],"dpi":307.9,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"ZTE/*/ZTE Blade L2/*"},{"ua":"ZTE Blade L2"}],"dpi":240,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"BENEVE/*/VR518/*"},{"ua":"VR518"}],"dpi":480,"bw":3,"ac":500},{"type":"ios","rules":[{"res":[640,960]}],"dpi":[325.1,328.4],"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[640,1136]}],"dpi":[317.1,320.2],"bw":3,"ac":1000},{"type":"ios","rules":[{"res":[750,1334]}],"dpi":326.4,"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[1242,2208]}],"dpi":[453.6,458.4],"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[1125,2001]}],"dpi":[410.9,415.4],"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[1125,2436]}],"dpi":458,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"Huawei/*/EML-L29/*"},{"ua":"EML-L29"}],"dpi":428,"bw":3.45,"ac":500},{"type":"android","rules":[{"mdmh":"Nokia/*/Nokia 7.1/*"},{"ua":"Nokia 7.1"}],"dpi":[432,431.9],"bw":3,"ac":500},{"type":"ios","rules":[{"res":[1242,2688]}],"dpi":458,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G570M/*"},{"ua":"SM-G570M"}],"dpi":320,"bw":3.684,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G970F/*"},{"ua":"SM-G970F"}],"dpi":438,"bw":2.281,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G973F/*"},{"ua":"SM-G973F"}],"dpi":550,"bw":2.002,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G975F/*"},{"ua":"SM-G975F"}],"dpi":522,"bw":2.054,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G977F/*"},{"ua":"SM-G977F"}],"dpi":505,"bw":2.334,"ac":500},{"type":"ios","rules":[{"res":[828,1792]}],"dpi":326,"bw":5,"ac":500}];
var DPDB_CACHE = {
	format: format,
	last_updated: last_updated,
	devices: devices
};
function Dpdb(url, onDeviceParamsUpdated) {
  this.dpdb = DPDB_CACHE;
  this.recalculateDeviceParams_();
  if (url) {
    this.onDeviceParamsUpdated = onDeviceParamsUpdated;
    var xhr = new XMLHttpRequest();
    var obj = this;
    xhr.open('GET', url, true);
    xhr.addEventListener('load', function () {
      obj.loading = false;
      if (xhr.status >= 200 && xhr.status <= 299) {
        obj.dpdb = JSON.parse(xhr.response);
        obj.recalculateDeviceParams_();
      } else {
        console.error('Error loading online DPDB!');
      }
    });
    xhr.send();
  }
}
Dpdb.prototype.getDeviceParams = function () {
  return this.deviceParams;
};
Dpdb.prototype.recalculateDeviceParams_ = function () {
  var newDeviceParams = this.calcDeviceParams_();
  if (newDeviceParams) {
    this.deviceParams = newDeviceParams;
    if (this.onDeviceParamsUpdated) {
      this.onDeviceParamsUpdated(this.deviceParams);
    }
  } else {
    console.error('Failed to recalculate device parameters.');
  }
};
Dpdb.prototype.calcDeviceParams_ = function () {
  var db = this.dpdb;
  if (!db) {
    console.error('DPDB not available.');
    return null;
  }
  if (db.format != 1) {
    console.error('DPDB has unexpected format version.');
    return null;
  }
  if (!db.devices || !db.devices.length) {
    console.error('DPDB does not have a devices section.');
    return null;
  }
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var width = getScreenWidth();
  var height = getScreenHeight();
  if (!db.devices) {
    console.error('DPDB has no devices section.');
    return null;
  }
  for (var i = 0; i < db.devices.length; i++) {
    var device = db.devices[i];
    if (!device.rules) {
      console.warn('Device[' + i + '] has no rules section.');
      continue;
    }
    if (device.type != 'ios' && device.type != 'android') {
      console.warn('Device[' + i + '] has invalid type.');
      continue;
    }
    if (isIOS() != (device.type == 'ios')) continue;
    var matched = false;
    for (var j = 0; j < device.rules.length; j++) {
      var rule = device.rules[j];
      if (this.ruleMatches_(rule, userAgent, width, height)) {
        matched = true;
        break;
      }
    }
    if (!matched) continue;
    var xdpi = device.dpi[0] || device.dpi;
    var ydpi = device.dpi[1] || device.dpi;
    return new DeviceParams({ xdpi: xdpi, ydpi: ydpi, bevelMm: device.bw });
  }
  console.warn('No DPDB device match.');
  return null;
};
Dpdb.prototype.ruleMatches_ = function (rule, ua, screenWidth, screenHeight) {
  if (!rule.ua && !rule.res) return false;
  if (rule.ua && rule.ua.substring(0, 2) === 'SM') rule.ua = rule.ua.substring(0, 7);
  if (rule.ua && ua.indexOf(rule.ua) < 0) return false;
  if (rule.res) {
    if (!rule.res[0] || !rule.res[1]) return false;
    var resX = rule.res[0];
    var resY = rule.res[1];
    if (Math.min(screenWidth, screenHeight) != Math.min(resX, resY) || Math.max(screenWidth, screenHeight) != Math.max(resX, resY)) {
      return false;
    }
  }
  return true;
};
function DeviceParams(params) {
  this.xdpi = params.xdpi;
  this.ydpi = params.ydpi;
  this.bevelMm = params.bevelMm;
}
function SensorSample(sample, timestampS) {
  this.set(sample, timestampS);
}
SensorSample.prototype.set = function (sample, timestampS) {
  this.sample = sample;
  this.timestampS = timestampS;
};
SensorSample.prototype.copy = function (sensorSample) {
  this.set(sensorSample.sample, sensorSample.timestampS);
};
function ComplementaryFilter(kFilter, isDebug) {
  this.kFilter = kFilter;
  this.isDebug = isDebug;
  this.currentAccelMeasurement = new SensorSample();
  this.currentGyroMeasurement = new SensorSample();
  this.previousGyroMeasurement = new SensorSample();
  if (isIOS()) {
    this.filterQ = new Quaternion(-1, 0, 0, 1);
  } else {
    this.filterQ = new Quaternion(1, 0, 0, 1);
  }
  this.previousFilterQ = new Quaternion();
  this.previousFilterQ.copy(this.filterQ);
  this.accelQ = new Quaternion();
  this.isOrientationInitialized = false;
  this.estimatedGravity = new Vector3();
  this.measuredGravity = new Vector3();
  this.gyroIntegralQ = new Quaternion();
}
ComplementaryFilter.prototype.addAccelMeasurement = function (vector, timestampS) {
  this.currentAccelMeasurement.set(vector, timestampS);
};
ComplementaryFilter.prototype.addGyroMeasurement = function (vector, timestampS) {
  this.currentGyroMeasurement.set(vector, timestampS);
  var deltaT = timestampS - this.previousGyroMeasurement.timestampS;
  if (isTimestampDeltaValid(deltaT)) {
    this.run_();
  }
  this.previousGyroMeasurement.copy(this.currentGyroMeasurement);
};
ComplementaryFilter.prototype.run_ = function () {
  if (!this.isOrientationInitialized) {
    this.accelQ = this.accelToQuaternion_(this.currentAccelMeasurement.sample);
    this.previousFilterQ.copy(this.accelQ);
    this.isOrientationInitialized = true;
    return;
  }
  var deltaT = this.currentGyroMeasurement.timestampS - this.previousGyroMeasurement.timestampS;
  var gyroDeltaQ = this.gyroToQuaternionDelta_(this.currentGyroMeasurement.sample, deltaT);
  this.gyroIntegralQ.multiply(gyroDeltaQ);
  this.filterQ.copy(this.previousFilterQ);
  this.filterQ.multiply(gyroDeltaQ);
  var invFilterQ = new Quaternion();
  invFilterQ.copy(this.filterQ);
  invFilterQ.inverse();
  this.estimatedGravity.set(0, 0, -1);
  this.estimatedGravity.applyQuaternion(invFilterQ);
  this.estimatedGravity.normalize();
  this.measuredGravity.copy(this.currentAccelMeasurement.sample);
  this.measuredGravity.normalize();
  var deltaQ = new Quaternion();
  deltaQ.setFromUnitVectors(this.estimatedGravity, this.measuredGravity);
  deltaQ.inverse();
  if (this.isDebug) {
    console.log('Delta: %d deg, G_est: (%s, %s, %s), G_meas: (%s, %s, %s)', radToDeg * getQuaternionAngle(deltaQ), this.estimatedGravity.x.toFixed(1), this.estimatedGravity.y.toFixed(1), this.estimatedGravity.z.toFixed(1), this.measuredGravity.x.toFixed(1), this.measuredGravity.y.toFixed(1), this.measuredGravity.z.toFixed(1));
  }
  var targetQ = new Quaternion();
  targetQ.copy(this.filterQ);
  targetQ.multiply(deltaQ);
  this.filterQ.slerp(targetQ, 1 - this.kFilter);
  this.previousFilterQ.copy(this.filterQ);
};
ComplementaryFilter.prototype.getOrientation = function () {
  return this.filterQ;
};
ComplementaryFilter.prototype.accelToQuaternion_ = function (accel) {
  var normAccel = new Vector3();
  normAccel.copy(accel);
  normAccel.normalize();
  var quat = new Quaternion();
  quat.setFromUnitVectors(new Vector3(0, 0, -1), normAccel);
  quat.inverse();
  return quat;
};
ComplementaryFilter.prototype.gyroToQuaternionDelta_ = function (gyro, dt) {
  var quat = new Quaternion();
  var axis = new Vector3();
  axis.copy(gyro);
  axis.normalize();
  quat.setFromAxisAngle(axis, gyro.length() * dt);
  return quat;
};
function PosePredictor(predictionTimeS, isDebug) {
  this.predictionTimeS = predictionTimeS;
  this.isDebug = isDebug;
  this.previousQ = new Quaternion();
  this.previousTimestampS = null;
  this.deltaQ = new Quaternion();
  this.outQ = new Quaternion();
}
PosePredictor.prototype.getPrediction = function (currentQ, gyro, timestampS) {
  if (!this.previousTimestampS) {
    this.previousQ.copy(currentQ);
    this.previousTimestampS = timestampS;
    return currentQ;
  }
  var axis = new Vector3();
  axis.copy(gyro);
  axis.normalize();
  var angularSpeed = gyro.length();
  if (angularSpeed < degToRad * 20) {
    if (this.isDebug) {
      console.log('Moving slowly, at %s deg/s: no prediction', (radToDeg * angularSpeed).toFixed(1));
    }
    this.outQ.copy(currentQ);
    this.previousQ.copy(currentQ);
    return this.outQ;
  }
  var predictAngle = angularSpeed * this.predictionTimeS;
  this.deltaQ.setFromAxisAngle(axis, predictAngle);
  this.outQ.copy(this.previousQ);
  this.outQ.multiply(this.deltaQ);
  this.previousQ.copy(currentQ);
  this.previousTimestampS = timestampS;
  return this.outQ;
};
function FusionPoseSensor(kFilter, predictionTime, yawOnly, isDebug) {
  this.yawOnly = yawOnly;
  this.accelerometer = new Vector3();
  this.gyroscope = new Vector3();
  this.filter = new ComplementaryFilter(kFilter, isDebug);
  this.posePredictor = new PosePredictor(predictionTime, isDebug);
  this.isFirefoxAndroid = isFirefoxAndroid();
  this.isIOS = isIOS();
  var chromeVersion = getChromeVersion();
  this.isDeviceMotionInRadians = !this.isIOS && chromeVersion && chromeVersion < 66;
  this.isWithoutDeviceMotion = isChromeWithoutDeviceMotion() || isSafariWithoutDeviceMotion();
  this.filterToWorldQ = new Quaternion();
  if (isIOS()) {
    this.filterToWorldQ.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
  } else {
    this.filterToWorldQ.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
  }
  this.inverseWorldToScreenQ = new Quaternion();
  this.worldToScreenQ = new Quaternion();
  this.originalPoseAdjustQ = new Quaternion();
  this.originalPoseAdjustQ.setFromAxisAngle(new Vector3(0, 0, 1), -window.orientation * Math.PI / 180);
  this.setScreenTransform_();
  if (isLandscapeMode()) {
    this.filterToWorldQ.multiply(this.inverseWorldToScreenQ);
  }
  this.resetQ = new Quaternion();
  this.orientationOut_ = new Float32Array(4);
  this.start();
}
FusionPoseSensor.prototype.getPosition = function () {
  return null;
};
FusionPoseSensor.prototype.getOrientation = function () {
  var orientation = void 0;
  if (this.isWithoutDeviceMotion && this._deviceOrientationQ) {
    this.deviceOrientationFixQ = this.deviceOrientationFixQ || function () {
      var z = new Quaternion().setFromAxisAngle(new Vector3(0, 0, -1), 0);
      var y = new Quaternion();
      if (window.orientation === -90) {
        y.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / -2);
      } else {
        y.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
      }
      return z.multiply(y);
    }();
    this.deviceOrientationFilterToWorldQ = this.deviceOrientationFilterToWorldQ || function () {
      var q = new Quaternion();
      q.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
      return q;
    }();
    orientation = this._deviceOrientationQ;
    var out = new Quaternion();
    out.copy(orientation);
    out.multiply(this.deviceOrientationFilterToWorldQ);
    out.multiply(this.resetQ);
    out.multiply(this.worldToScreenQ);
    out.multiplyQuaternions(this.deviceOrientationFixQ, out);
    if (this.yawOnly) {
      out.x = 0;
      out.z = 0;
      out.normalize();
    }
    this.orientationOut_[0] = out.x;
    this.orientationOut_[1] = out.y;
    this.orientationOut_[2] = out.z;
    this.orientationOut_[3] = out.w;
    return this.orientationOut_;
  } else {
    var filterOrientation = this.filter.getOrientation();
    orientation = this.posePredictor.getPrediction(filterOrientation, this.gyroscope, this.previousTimestampS);
  }
  var out = new Quaternion();
  out.copy(this.filterToWorldQ);
  out.multiply(this.resetQ);
  out.multiply(orientation);
  out.multiply(this.worldToScreenQ);
  if (this.yawOnly) {
    out.x = 0;
    out.z = 0;
    out.normalize();
  }
  this.orientationOut_[0] = out.x;
  this.orientationOut_[1] = out.y;
  this.orientationOut_[2] = out.z;
  this.orientationOut_[3] = out.w;
  return this.orientationOut_;
};
FusionPoseSensor.prototype.resetPose = function () {
  this.resetQ.copy(this.filter.getOrientation());
  this.resetQ.x = 0;
  this.resetQ.y = 0;
  this.resetQ.z *= -1;
  this.resetQ.normalize();
  if (isLandscapeMode()) {
    this.resetQ.multiply(this.inverseWorldToScreenQ);
  }
  this.resetQ.multiply(this.originalPoseAdjustQ);
};
FusionPoseSensor.prototype.onDeviceOrientation_ = function (e) {
  this._deviceOrientationQ = this._deviceOrientationQ || new Quaternion();
  var alpha = e.alpha,
      beta = e.beta,
      gamma = e.gamma;
  alpha = (alpha || 0) * Math.PI / 180;
  beta = (beta || 0) * Math.PI / 180;
  gamma = (gamma || 0) * Math.PI / 180;
  this._deviceOrientationQ.setFromEulerYXZ(beta, alpha, -gamma);
};
FusionPoseSensor.prototype.onDeviceMotion_ = function (deviceMotion) {
  this.updateDeviceMotion_(deviceMotion);
};
FusionPoseSensor.prototype.updateDeviceMotion_ = function (deviceMotion) {
  var accGravity = deviceMotion.accelerationIncludingGravity;
  var rotRate = deviceMotion.rotationRate;
  var timestampS = deviceMotion.timeStamp / 1000;
  var deltaS = timestampS - this.previousTimestampS;
  if (deltaS < 0) {
    warnOnce('fusion-pose-sensor:invalid:non-monotonic', 'Invalid timestamps detected: non-monotonic timestamp from devicemotion');
    this.previousTimestampS = timestampS;
    return;
  } else if (deltaS <= MIN_TIMESTEP || deltaS > MAX_TIMESTEP) {
    warnOnce('fusion-pose-sensor:invalid:outside-threshold', 'Invalid timestamps detected: Timestamp from devicemotion outside expected range.');
    this.previousTimestampS = timestampS;
    return;
  }
  this.accelerometer.set(-accGravity.x, -accGravity.y, -accGravity.z);
  if (rotRate) {
    if (isR7()) {
      this.gyroscope.set(-rotRate.beta, rotRate.alpha, rotRate.gamma);
    } else {
      this.gyroscope.set(rotRate.alpha, rotRate.beta, rotRate.gamma);
    }
    if (!this.isDeviceMotionInRadians) {
      this.gyroscope.multiplyScalar(Math.PI / 180);
    }
    this.filter.addGyroMeasurement(this.gyroscope, timestampS);
  }
  this.filter.addAccelMeasurement(this.accelerometer, timestampS);
  this.previousTimestampS = timestampS;
};
FusionPoseSensor.prototype.onOrientationChange_ = function (screenOrientation) {
  this.setScreenTransform_();
};
FusionPoseSensor.prototype.onMessage_ = function (event) {
  var message = event.data;
  if (!message || !message.type) {
    return;
  }
  var type = message.type.toLowerCase();
  if (type !== 'devicemotion') {
    return;
  }
  this.updateDeviceMotion_(message.deviceMotionEvent);
};
FusionPoseSensor.prototype.setScreenTransform_ = function () {
  this.worldToScreenQ.set(0, 0, 0, 1);
  switch (window.orientation) {
    case 0:
      break;
    case 90:
      this.worldToScreenQ.setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);
      break;
    case -90:
      this.worldToScreenQ.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
      break;
    case 180:
      break;
  }
  this.inverseWorldToScreenQ.copy(this.worldToScreenQ);
  this.inverseWorldToScreenQ.inverse();
};
FusionPoseSensor.prototype.start = function () {
  this.onDeviceMotionCallback_ = this.onDeviceMotion_.bind(this);
  this.onOrientationChangeCallback_ = this.onOrientationChange_.bind(this);
  this.onMessageCallback_ = this.onMessage_.bind(this);
  this.onDeviceOrientationCallback_ = this.onDeviceOrientation_.bind(this);
  if (isIOS() && isInsideCrossOriginIFrame()) {
    window.addEventListener('message', this.onMessageCallback_);
  }
  window.addEventListener('orientationchange', this.onOrientationChangeCallback_);
  if (this.isWithoutDeviceMotion) {
    window.addEventListener('deviceorientation', this.onDeviceOrientationCallback_);
  } else {
    window.addEventListener('devicemotion', this.onDeviceMotionCallback_);
  }
};
FusionPoseSensor.prototype.stop = function () {
  window.removeEventListener('devicemotion', this.onDeviceMotionCallback_);
  window.removeEventListener('deviceorientation', this.onDeviceOrientationCallback_);
  window.removeEventListener('orientationchange', this.onOrientationChangeCallback_);
  window.removeEventListener('message', this.onMessageCallback_);
};
var SENSOR_FREQUENCY = 60;
var X_AXIS = new Vector3(1, 0, 0);
var Z_AXIS = new Vector3(0, 0, 1);
var SENSOR_TO_VR = new Quaternion();
SENSOR_TO_VR.setFromAxisAngle(X_AXIS, -Math.PI / 2);
SENSOR_TO_VR.multiply(new Quaternion().setFromAxisAngle(Z_AXIS, Math.PI / 2));
var PoseSensor = function () {
  function PoseSensor(config) {
    classCallCheck(this, PoseSensor);
    this.config = config;
    this.sensor = null;
    this.fusionSensor = null;
    this._out = new Float32Array(4);
    this.api = null;
    this.errors = [];
    this._sensorQ = new Quaternion();
    this._outQ = new Quaternion();
    this._onSensorRead = this._onSensorRead.bind(this);
    this._onSensorError = this._onSensorError.bind(this);
    this.init();
  }
  createClass(PoseSensor, [{
    key: 'init',
    value: function init() {
      var sensor = null;
      try {
        sensor = new RelativeOrientationSensor({
          frequency: SENSOR_FREQUENCY,
          referenceFrame: 'screen'
        });
        sensor.addEventListener('error', this._onSensorError);
      } catch (error) {
        this.errors.push(error);
        if (error.name === 'SecurityError') {
          console.error('Cannot construct sensors due to the Feature Policy');
          console.warn('Attempting to fall back using "devicemotion"; however this will ' + 'fail in the future without correct permissions.');
          this.useDeviceMotion();
        } else if (error.name === 'ReferenceError') {
          this.useDeviceMotion();
        } else {
          console.error(error);
        }
      }
      if (sensor) {
        this.api = 'sensor';
        this.sensor = sensor;
        this.sensor.addEventListener('reading', this._onSensorRead);
        this.sensor.start();
      }
    }
  }, {
    key: 'useDeviceMotion',
    value: function useDeviceMotion() {
      this.api = 'devicemotion';
      this.fusionSensor = new FusionPoseSensor(this.config.K_FILTER, this.config.PREDICTION_TIME_S, this.config.YAW_ONLY, this.config.DEBUG);
      if (this.sensor) {
        this.sensor.removeEventListener('reading', this._onSensorRead);
        this.sensor.removeEventListener('error', this._onSensorError);
        this.sensor = null;
      }
    }
  }, {
    key: 'getOrientation',
    value: function getOrientation() {
      if (this.fusionSensor) {
        return this.fusionSensor.getOrientation();
      }
      if (!this.sensor || !this.sensor.quaternion) {
        this._out[0] = this._out[1] = this._out[2] = 0;
        this._out[3] = 1;
        return this._out;
      }
      var q = this.sensor.quaternion;
      this._sensorQ.set(q[0], q[1], q[2], q[3]);
      var out = this._outQ;
      out.copy(SENSOR_TO_VR);
      out.multiply(this._sensorQ);
      if (this.config.YAW_ONLY) {
        out.x = out.z = 0;
        out.normalize();
      }
      this._out[0] = out.x;
      this._out[1] = out.y;
      this._out[2] = out.z;
      this._out[3] = out.w;
      return this._out;
    }
  }, {
    key: '_onSensorError',
    value: function _onSensorError(event) {
      this.errors.push(event.error);
      if (event.error.name === 'NotAllowedError') {
        console.error('Permission to access sensor was denied');
      } else if (event.error.name === 'NotReadableError') {
        console.error('Sensor could not be read');
      } else {
        console.error(event.error);
      }
      this.useDeviceMotion();
    }
  }, {
    key: '_onSensorRead',
    value: function _onSensorRead() {}
  }]);
  return PoseSensor;
}();
var rotateInstructionsAsset = "<svg width='198' height='240' viewBox='0 0 198 240' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><path d='M149.625 109.527l6.737 3.891v.886c0 .177.013.36.038.549.01.081.02.162.027.242.14 1.415.974 2.998 2.105 3.999l5.72 5.062.081-.09s4.382-2.53 5.235-3.024l25.97 14.993v54.001c0 .771-.386 1.217-.948 1.217-.233 0-.495-.076-.772-.236l-23.967-13.838-.014.024-27.322 15.775-.85-1.323c-4.731-1.529-9.748-2.74-14.951-3.61a.27.27 0 0 0-.007.024l-5.067 16.961-7.891 4.556-.037-.063v27.59c0 .772-.386 1.217-.948 1.217-.232 0-.495-.076-.772-.236l-42.473-24.522c-.95-.549-1.72-1.877-1.72-2.967v-1.035l-.021.047a5.111 5.111 0 0 0-1.816-.399 5.682 5.682 0 0 0-.546.001 13.724 13.724 0 0 1-1.918-.041c-1.655-.153-3.2-.6-4.404-1.296l-46.576-26.89.005.012-10.278-18.75c-1.001-1.827-.241-4.216 1.698-5.336l56.011-32.345a4.194 4.194 0 0 1 2.099-.572c1.326 0 2.572.659 3.227 1.853l.005-.003.227.413-.006.004a9.63 9.63 0 0 0 1.477 2.018l.277.27c1.914 1.85 4.468 2.801 7.113 2.801 1.949 0 3.948-.517 5.775-1.572.013 0 7.319-4.219 7.319-4.219a4.194 4.194 0 0 1 2.099-.572c1.326 0 2.572.658 3.226 1.853l3.25 5.928.022-.018 6.785 3.917-.105-.182 46.881-26.965m0-1.635c-.282 0-.563.073-.815.218l-46.169 26.556-5.41-3.124-3.005-5.481c-.913-1.667-2.699-2.702-4.66-2.703-1.011 0-2.02.274-2.917.792a3825 3825 0 0 1-7.275 4.195l-.044.024a9.937 9.937 0 0 1-4.957 1.353c-2.292 0-4.414-.832-5.976-2.342l-.252-.245a7.992 7.992 0 0 1-1.139-1.534 1.379 1.379 0 0 0-.06-.122l-.227-.414a1.718 1.718 0 0 0-.095-.154c-.938-1.574-2.673-2.545-4.571-2.545-1.011 0-2.02.274-2.917.792L3.125 155.502c-2.699 1.559-3.738 4.94-2.314 7.538l10.278 18.75c.177.323.448.563.761.704l46.426 26.804c1.403.81 3.157 1.332 5.072 1.508a15.661 15.661 0 0 0 2.146.046 4.766 4.766 0 0 1 .396 0c.096.004.19.011.283.022.109 1.593 1.159 3.323 2.529 4.114l42.472 24.522c.524.302 1.058.455 1.59.455 1.497 0 2.583-1.2 2.583-2.852v-26.562l7.111-4.105a1.64 1.64 0 0 0 .749-.948l4.658-15.593c4.414.797 8.692 1.848 12.742 3.128l.533.829a1.634 1.634 0 0 0 2.193.531l26.532-15.317L193 192.433c.523.302 1.058.455 1.59.455 1.497 0 2.583-1.199 2.583-2.852v-54.001c0-.584-.312-1.124-.818-1.416l-25.97-14.993a1.633 1.633 0 0 0-1.636.001c-.606.351-2.993 1.73-4.325 2.498l-4.809-4.255c-.819-.725-1.461-1.933-1.561-2.936a7.776 7.776 0 0 0-.033-.294 2.487 2.487 0 0 1-.023-.336v-.886c0-.584-.312-1.123-.817-1.416l-6.739-3.891a1.633 1.633 0 0 0-.817-.219' fill='#455A64'/><path d='M96.027 132.636l46.576 26.891c1.204.695 1.979 1.587 2.242 2.541l-.01.007-81.374 46.982h-.001c-1.654-.152-3.199-.6-4.403-1.295l-46.576-26.891 83.546-48.235' fill='#FAFAFA'/><path d='M63.461 209.174c-.008 0-.015 0-.022-.002-1.693-.156-3.228-.609-4.441-1.309l-46.576-26.89a.118.118 0 0 1 0-.203l83.546-48.235a.117.117 0 0 1 .117 0l46.576 26.891c1.227.708 2.021 1.612 2.296 2.611a.116.116 0 0 1-.042.124l-.021.016-81.375 46.981a.11.11 0 0 1-.058.016zm-50.747-28.303l46.401 26.79c1.178.68 2.671 1.121 4.32 1.276l81.272-46.922c-.279-.907-1.025-1.73-2.163-2.387l-46.517-26.857-83.313 48.1z' fill='#607D8B'/><path d='M148.327 165.471a5.85 5.85 0 0 1-.546.001c-1.894-.083-3.302-1.038-3.145-2.132a2.693 2.693 0 0 0-.072-1.105l-81.103 46.822c.628.058 1.272.073 1.918.042.182-.009.364-.009.546-.001 1.894.083 3.302 1.038 3.145 2.132l79.257-45.759' fill='#FFF'/><path d='M69.07 211.347a.118.118 0 0 1-.115-.134c.045-.317-.057-.637-.297-.925-.505-.61-1.555-1.022-2.738-1.074a5.966 5.966 0 0 0-.535.001 14.03 14.03 0 0 1-1.935-.041.117.117 0 0 1-.103-.092.116.116 0 0 1 .055-.126l81.104-46.822a.117.117 0 0 1 .171.07c.104.381.129.768.074 1.153-.045.316.057.637.296.925.506.61 1.555 1.021 2.739 1.073.178.008.357.008.535-.001a.117.117 0 0 1 .064.218l-79.256 45.759a.114.114 0 0 1-.059.016zm-3.405-2.372c.089 0 .177.002.265.006 1.266.056 2.353.488 2.908 1.158.227.274.35.575.36.882l78.685-45.429c-.036 0-.072-.001-.107-.003-1.267-.056-2.354-.489-2.909-1.158-.282-.34-.402-.724-.347-1.107a2.604 2.604 0 0 0-.032-.91L63.846 208.97a13.91 13.91 0 0 0 1.528.012c.097-.005.194-.007.291-.007z' fill='#607D8B'/><path d='M2.208 162.134c-1.001-1.827-.241-4.217 1.698-5.337l56.011-32.344c1.939-1.12 4.324-.546 5.326 1.281l.232.41a9.344 9.344 0 0 0 1.47 2.021l.278.27c3.325 3.214 8.583 3.716 12.888 1.23l7.319-4.22c1.94-1.119 4.324-.546 5.325 1.282l3.25 5.928-83.519 48.229-10.278-18.75z' fill='#FAFAFA'/><path d='M12.486 181.001a.112.112 0 0 1-.031-.005.114.114 0 0 1-.071-.056L2.106 162.19c-1.031-1.88-.249-4.345 1.742-5.494l56.01-32.344a4.328 4.328 0 0 1 2.158-.588c1.415 0 2.65.702 3.311 1.882.01.008.018.017.024.028l.227.414a.122.122 0 0 1 .013.038 9.508 9.508 0 0 0 1.439 1.959l.275.266c1.846 1.786 4.344 2.769 7.031 2.769 1.977 0 3.954-.538 5.717-1.557a.148.148 0 0 1 .035-.013l7.284-4.206a4.321 4.321 0 0 1 2.157-.588c1.427 0 2.672.716 3.329 1.914l3.249 5.929a.116.116 0 0 1-.044.157l-83.518 48.229a.116.116 0 0 1-.059.016zm49.53-57.004c-.704 0-1.41.193-2.041.557l-56.01 32.345c-1.882 1.086-2.624 3.409-1.655 5.179l10.221 18.645 83.317-48.112-3.195-5.829c-.615-1.122-1.783-1.792-3.124-1.792a4.08 4.08 0 0 0-2.04.557l-7.317 4.225a.148.148 0 0 1-.035.013 11.7 11.7 0 0 1-5.801 1.569c-2.748 0-5.303-1.007-7.194-2.835l-.278-.27a9.716 9.716 0 0 1-1.497-2.046.096.096 0 0 1-.013-.037l-.191-.347a.11.11 0 0 1-.023-.029c-.615-1.123-1.783-1.793-3.124-1.793z' fill='#607D8B'/><path d='M42.434 155.808c-2.51-.001-4.697-1.258-5.852-3.365-1.811-3.304-.438-7.634 3.059-9.654l12.291-7.098a7.599 7.599 0 0 1 3.789-1.033c2.51 0 4.697 1.258 5.852 3.365 1.811 3.304.439 7.634-3.059 9.654l-12.291 7.098a7.606 7.606 0 0 1-3.789 1.033zm13.287-20.683a7.128 7.128 0 0 0-3.555.971l-12.291 7.098c-3.279 1.893-4.573 5.942-2.883 9.024 1.071 1.955 3.106 3.122 5.442 3.122a7.13 7.13 0 0 0 3.556-.97l12.291-7.098c3.279-1.893 4.572-5.942 2.883-9.024-1.072-1.955-3.106-3.123-5.443-3.123z' fill='#607D8B'/><path d='M149.588 109.407l6.737 3.89v.887c0 .176.013.36.037.549.011.081.02.161.028.242.14 1.415.973 2.998 2.105 3.999l7.396 6.545c.177.156.358.295.541.415 1.579 1.04 2.95.466 3.062-1.282.049-.784.057-1.595.023-2.429l-.003-.16v-1.151l25.987 15.003v54c0 1.09-.77 1.53-1.72.982l-42.473-24.523c-.95-.548-1.72-1.877-1.72-2.966v-34.033' fill='#FAFAFA'/><path d='M194.553 191.25c-.257 0-.54-.085-.831-.253l-42.472-24.521c-.981-.567-1.779-1.943-1.779-3.068v-34.033h.234v34.033c0 1.051.745 2.336 1.661 2.866l42.473 24.521c.424.245.816.288 1.103.122.285-.164.442-.52.442-1.002v-53.933l-25.753-14.868.003 1.106c.034.832.026 1.654-.024 2.439-.054.844-.396 1.464-.963 1.746-.619.309-1.45.173-2.28-.373a5.023 5.023 0 0 1-.553-.426l-7.397-6.544c-1.158-1.026-1.999-2.625-2.143-4.076a9.624 9.624 0 0 0-.027-.238 4.241 4.241 0 0 1-.038-.564v-.82l-6.68-3.856.117-.202 6.738 3.89.058.034v.954c0 .171.012.351.036.533.011.083.021.165.029.246.138 1.395.948 2.935 2.065 3.923l7.397 6.545c.173.153.35.289.527.406.758.499 1.504.63 2.047.359.49-.243.786-.795.834-1.551.05-.778.057-1.591.024-2.417l-.004-.163v-1.355l.175.1 25.987 15.004.059.033v54.068c0 .569-.198.996-.559 1.204a1.002 1.002 0 0 1-.506.131' fill='#607D8B'/><path d='M145.685 163.161l24.115 13.922-25.978 14.998-1.462-.307c-6.534-2.17-13.628-3.728-21.019-4.616-4.365-.524-8.663 1.096-9.598 3.62a2.746 2.746 0 0 0-.011 1.928c1.538 4.267 4.236 8.363 7.995 12.135l.532.845-25.977 14.997-24.115-13.922 75.518-43.6' fill='#FFF'/><path d='M94.282 220.818l-.059-.033-24.29-14.024.175-.101 75.577-43.634.058.033 24.29 14.024-26.191 15.122-.045-.01-1.461-.307c-6.549-2.174-13.613-3.725-21.009-4.614a13.744 13.744 0 0 0-1.638-.097c-3.758 0-7.054 1.531-7.837 3.642a2.62 2.62 0 0 0-.01 1.848c1.535 4.258 4.216 8.326 7.968 12.091l.016.021.526.835.006.01.064.102-.105.061-25.977 14.998-.058.033zm-23.881-14.057l23.881 13.788 24.802-14.32c.546-.315.846-.489 1.017-.575l-.466-.74c-3.771-3.787-6.467-7.881-8.013-12.168a2.851 2.851 0 0 1 .011-2.008c.815-2.199 4.203-3.795 8.056-3.795.557 0 1.117.033 1.666.099 7.412.891 14.491 2.445 21.041 4.621.836.175 1.215.254 1.39.304l25.78-14.884-23.881-13.788-75.284 43.466z' fill='#607D8B'/><path d='M167.23 125.979v50.871l-27.321 15.773-6.461-14.167c-.91-1.996-3.428-1.738-5.624.574a10.238 10.238 0 0 0-2.33 4.018l-6.46 21.628-27.322 15.774v-50.871l75.518-43.6' fill='#FFF'/><path d='M91.712 220.567a.127.127 0 0 1-.059-.016.118.118 0 0 1-.058-.101v-50.871c0-.042.023-.08.058-.101l75.519-43.6a.117.117 0 0 1 .175.101v50.871c0 .041-.023.08-.059.1l-27.321 15.775a.118.118 0 0 1-.094.01.12.12 0 0 1-.071-.063l-6.46-14.168c-.375-.822-1.062-1.275-1.934-1.275-1.089 0-2.364.686-3.5 1.881a10.206 10.206 0 0 0-2.302 3.972l-6.46 21.627a.118.118 0 0 1-.054.068L91.77 220.551a.12.12 0 0 1-.058.016zm.117-50.92v50.601l27.106-15.65 6.447-21.583a10.286 10.286 0 0 1 2.357-4.065c1.18-1.242 2.517-1.954 3.669-1.954.969 0 1.731.501 2.146 1.411l6.407 14.051 27.152-15.676v-50.601l-75.284 43.466z' fill='#607D8B'/><path d='M168.543 126.213v50.87l-27.322 15.774-6.46-14.168c-.91-1.995-3.428-1.738-5.624.574a10.248 10.248 0 0 0-2.33 4.019l-6.461 21.627-27.321 15.774v-50.87l75.518-43.6' fill='#FFF'/><path d='M93.025 220.8a.123.123 0 0 1-.059-.015.12.12 0 0 1-.058-.101v-50.871c0-.042.023-.08.058-.101l75.518-43.6a.112.112 0 0 1 .117 0c.036.02.059.059.059.1v50.871a.116.116 0 0 1-.059.101l-27.321 15.774a.111.111 0 0 1-.094.01.115.115 0 0 1-.071-.062l-6.46-14.168c-.375-.823-1.062-1.275-1.935-1.275-1.088 0-2.363.685-3.499 1.881a10.19 10.19 0 0 0-2.302 3.971l-6.461 21.628a.108.108 0 0 1-.053.067l-27.322 15.775a.12.12 0 0 1-.058.015zm.117-50.919v50.6l27.106-15.649 6.447-21.584a10.293 10.293 0 0 1 2.357-4.065c1.179-1.241 2.516-1.954 3.668-1.954.969 0 1.732.502 2.147 1.412l6.407 14.051 27.152-15.676v-50.601l-75.284 43.466z' fill='#607D8B'/><path d='M169.8 177.083l-27.322 15.774-6.46-14.168c-.91-1.995-3.428-1.738-5.625.574a10.246 10.246 0 0 0-2.329 4.019l-6.461 21.627-27.321 15.774v-50.87l75.518-43.6v50.87z' fill='#FAFAFA'/><path d='M94.282 220.917a.234.234 0 0 1-.234-.233v-50.871c0-.083.045-.161.117-.202l75.518-43.601a.234.234 0 1 1 .35.202v50.871a.233.233 0 0 1-.116.202l-27.322 15.775a.232.232 0 0 1-.329-.106l-6.461-14.168c-.36-.789-.992-1.206-1.828-1.206-1.056 0-2.301.672-3.415 1.844a10.099 10.099 0 0 0-2.275 3.924l-6.46 21.628a.235.235 0 0 1-.107.136l-27.322 15.774a.23.23 0 0 1-.116.031zm.233-50.969v50.331l26.891-15.525 6.434-21.539a10.41 10.41 0 0 1 2.384-4.112c1.201-1.265 2.569-1.991 3.753-1.991 1.018 0 1.818.526 2.253 1.48l6.354 13.934 26.982-15.578v-50.331l-75.051 43.331z' fill='#607D8B'/><path d='M109.894 199.943c-1.774 0-3.241-.725-4.244-2.12a.224.224 0 0 1 .023-.294.233.233 0 0 1 .301-.023c.78.547 1.705.827 2.75.827 1.323 0 2.754-.439 4.256-1.306 5.311-3.067 9.631-10.518 9.631-16.611 0-1.927-.442-3.56-1.278-4.724a.232.232 0 0 1 .323-.327c1.671 1.172 2.591 3.381 2.591 6.219 0 6.242-4.426 13.863-9.865 17.003-1.574.908-3.084 1.356-4.488 1.356zm-2.969-1.542c.813.651 1.82.877 2.968.877h.001c1.321 0 2.753-.327 4.254-1.194 5.311-3.067 9.632-10.463 9.632-16.556 0-1.979-.463-3.599-1.326-4.761.411 1.035.625 2.275.625 3.635 0 6.243-4.426 13.883-9.865 17.023-1.574.909-3.084 1.317-4.49 1.317-.641 0-1.243-.149-1.799-.341z' fill='#607D8B'/><path d='M113.097 197.23c5.384-3.108 9.748-10.636 9.748-16.814 0-2.051-.483-3.692-1.323-4.86-1.784-1.252-4.374-1.194-7.257.47-5.384 3.108-9.748 10.636-9.748 16.814 0 2.051.483 3.692 1.323 4.86 1.784 1.252 4.374 1.194 7.257-.47' fill='#FAFAFA'/><path d='M108.724 198.614c-1.142 0-2.158-.213-3.019-.817-.021-.014-.04.014-.055-.007-.894-1.244-1.367-2.948-1.367-4.973 0-6.242 4.426-13.864 9.865-17.005 1.574-.908 3.084-1.363 4.49-1.363 1.142 0 2.158.309 3.018.913a.23.23 0 0 1 .056.056c.894 1.244 1.367 2.972 1.367 4.997 0 6.243-4.426 13.783-9.865 16.923-1.574.909-3.084 1.276-4.49 1.276zm-2.718-1.109c.774.532 1.688.776 2.718.776 1.323 0 2.754-.413 4.256-1.28 5.311-3.066 9.631-10.505 9.631-16.598 0-1.909-.434-3.523-1.255-4.685-.774-.533-1.688-.799-2.718-.799-1.323 0-2.755.441-4.256 1.308-5.311 3.066-9.631 10.506-9.631 16.599 0 1.909.434 3.517 1.255 4.679z' fill='#607D8B'/><path d='M149.318 114.262l-9.984 8.878 15.893 11.031 5.589-6.112-11.498-13.797' fill='#FAFAFA'/><path d='M169.676 120.84l-9.748 5.627c-3.642 2.103-9.528 2.113-13.147.024-3.62-2.089-3.601-5.488.041-7.591l9.495-5.608-6.729-3.885-81.836 47.071 45.923 26.514 3.081-1.779c.631-.365.869-.898.618-1.39-2.357-4.632-2.593-9.546-.683-14.262 5.638-13.92 24.509-24.815 48.618-28.07 8.169-1.103 16.68-.967 24.704.394.852.145 1.776.008 2.407-.357l3.081-1.778-25.825-14.91' fill='#FAFAFA'/><path d='M113.675 183.459a.47.47 0 0 1-.233-.062l-45.924-26.515a.468.468 0 0 1 .001-.809l81.836-47.071a.467.467 0 0 1 .466 0l6.729 3.885a.467.467 0 0 1-.467.809l-6.496-3.75-80.9 46.533 44.988 25.973 2.848-1.644c.192-.111.62-.409.435-.773-2.416-4.748-2.658-9.814-.7-14.65 2.806-6.927 8.885-13.242 17.582-18.263 8.657-4.998 19.518-8.489 31.407-10.094 8.198-1.107 16.79-.97 24.844.397.739.125 1.561.007 2.095-.301l2.381-1.374-25.125-14.506a.467.467 0 0 1 .467-.809l25.825 14.91a.467.467 0 0 1 0 .809l-3.081 1.779c-.721.417-1.763.575-2.718.413-7.963-1.351-16.457-1.486-24.563-.392-11.77 1.589-22.512 5.039-31.065 9.977-8.514 4.916-14.456 11.073-17.183 17.805-1.854 4.578-1.623 9.376.666 13.875.37.725.055 1.513-.8 2.006l-3.081 1.78a.476.476 0 0 1-.234.062' fill='#455A64'/><path d='M153.316 128.279c-2.413 0-4.821-.528-6.652-1.586-1.818-1.049-2.82-2.461-2.82-3.975 0-1.527 1.016-2.955 2.861-4.02l9.493-5.607a.233.233 0 1 1 .238.402l-9.496 5.609c-1.696.979-2.628 2.263-2.628 3.616 0 1.34.918 2.608 2.585 3.571 3.549 2.049 9.343 2.038 12.914-.024l9.748-5.628a.234.234 0 0 1 .234.405l-9.748 5.628c-1.858 1.072-4.296 1.609-6.729 1.609' fill='#607D8B'/><path d='M113.675 182.992l-45.913-26.508M113.675 183.342a.346.346 0 0 1-.175-.047l-45.913-26.508a.35.35 0 1 1 .35-.607l45.913 26.508a.35.35 0 0 1-.175.654' fill='#455A64'/><path d='M67.762 156.484v54.001c0 1.09.77 2.418 1.72 2.967l42.473 24.521c.95.549 1.72.11 1.72-.98v-54.001' fill='#FAFAFA'/><path d='M112.727 238.561c-.297 0-.62-.095-.947-.285l-42.473-24.521c-1.063-.613-1.895-2.05-1.895-3.27v-54.001a.35.35 0 1 1 .701 0v54.001c0 .96.707 2.18 1.544 2.663l42.473 24.522c.344.198.661.243.87.122.206-.119.325-.411.325-.799v-54.001a.35.35 0 1 1 .7 0v54.001c0 .655-.239 1.154-.675 1.406a1.235 1.235 0 0 1-.623.162' fill='#455A64'/><path d='M112.86 147.512h-.001c-2.318 0-4.499-.522-6.142-1.471-1.705-.984-2.643-2.315-2.643-3.749 0-1.445.952-2.791 2.68-3.788l12.041-6.953c1.668-.962 3.874-1.493 6.212-1.493 2.318 0 4.499.523 6.143 1.472 1.704.984 2.643 2.315 2.643 3.748 0 1.446-.952 2.791-2.68 3.789l-12.042 6.952c-1.668.963-3.874 1.493-6.211 1.493zm12.147-16.753c-2.217 0-4.298.497-5.861 1.399l-12.042 6.952c-1.502.868-2.33 1.998-2.33 3.182 0 1.173.815 2.289 2.293 3.142 1.538.889 3.596 1.378 5.792 1.378h.001c2.216 0 4.298-.497 5.861-1.399l12.041-6.953c1.502-.867 2.33-1.997 2.33-3.182 0-1.172-.814-2.288-2.292-3.142-1.539-.888-3.596-1.377-5.793-1.377z' fill='#607D8B'/><path d='M165.63 123.219l-5.734 3.311c-3.167 1.828-8.286 1.837-11.433.02-3.147-1.817-3.131-4.772.036-6.601l5.734-3.31 11.397 6.58' fill='#FAFAFA'/><path d='M154.233 117.448l9.995 5.771-4.682 2.704c-1.434.827-3.352 1.283-5.399 1.283-2.029 0-3.923-.449-5.333-1.263-1.29-.744-2-1.694-2-2.674 0-.991.723-1.955 2.036-2.713l5.383-3.108m0-.809l-5.734 3.31c-3.167 1.829-3.183 4.784-.036 6.601 1.568.905 3.623 1.357 5.684 1.357 2.077 0 4.159-.46 5.749-1.377l5.734-3.311-11.397-6.58M145.445 179.667c-1.773 0-3.241-.85-4.243-2.245-.067-.092-.057-.275.023-.356.08-.081.207-.12.3-.055.781.548 1.706.812 2.751.811 1.322 0 2.754-.446 4.256-1.313 5.31-3.066 9.631-10.522 9.631-16.615 0-1.927-.442-3.562-1.279-4.726a.235.235 0 0 1 .024-.301.232.232 0 0 1 .3-.027c1.67 1.172 2.59 3.38 2.59 6.219 0 6.242-4.425 13.987-9.865 17.127-1.573.908-3.083 1.481-4.488 1.481zM142.476 178c.814.651 1.82 1.002 2.969 1.002 1.322 0 2.753-.452 4.255-1.32 5.31-3.065 9.631-10.523 9.631-16.617 0-1.98-.463-3.63-1.325-4.793.411 1.035.624 2.26.624 3.62 0 6.242-4.425 13.875-9.865 17.015-1.573.909-3.084 1.376-4.489 1.376a5.49 5.49 0 0 1-1.8-.283z' fill='#607D8B'/><path d='M148.648 176.704c5.384-3.108 9.748-10.636 9.748-16.813 0-2.052-.483-3.693-1.322-4.861-1.785-1.252-4.375-1.194-7.258.471-5.383 3.108-9.748 10.636-9.748 16.813 0 2.051.484 3.692 1.323 4.86 1.785 1.253 4.374 1.195 7.257-.47' fill='#FAFAFA'/><path d='M144.276 178.276c-1.143 0-2.158-.307-3.019-.911a.217.217 0 0 1-.055-.054c-.895-1.244-1.367-2.972-1.367-4.997 0-6.241 4.425-13.875 9.865-17.016 1.573-.908 3.084-1.369 4.489-1.369 1.143 0 2.158.307 3.019.91a.24.24 0 0 1 .055.055c.894 1.244 1.367 2.971 1.367 4.997 0 6.241-4.425 13.875-9.865 17.016-1.573.908-3.084 1.369-4.489 1.369zm-2.718-1.172c.773.533 1.687.901 2.718.901 1.322 0 2.754-.538 4.256-1.405 5.31-3.066 9.631-10.567 9.631-16.661 0-1.908-.434-3.554-1.256-4.716-.774-.532-1.688-.814-2.718-.814-1.322 0-2.754.433-4.256 1.3-5.31 3.066-9.631 10.564-9.631 16.657 0 1.91.434 3.576 1.256 4.738z' fill='#607D8B'/><path d='M150.72 172.361l-.363-.295a24.105 24.105 0 0 0 2.148-3.128 24.05 24.05 0 0 0 1.977-4.375l.443.149a24.54 24.54 0 0 1-2.015 4.46 24.61 24.61 0 0 1-2.19 3.189M115.917 191.514l-.363-.294a24.174 24.174 0 0 0 2.148-3.128 24.038 24.038 0 0 0 1.976-4.375l.443.148a24.48 24.48 0 0 1-2.015 4.461 24.662 24.662 0 0 1-2.189 3.188M114 237.476V182.584 237.476' fill='#607D8B'/><g><path d='M81.822 37.474c.017-.135-.075-.28-.267-.392-.327-.188-.826-.21-1.109-.045l-6.012 3.471c-.131.076-.194.178-.191.285.002.132.002.461.002.578v.043l-.007.128-6.591 3.779c-.001 0-2.077 1.046-2.787 5.192 0 0-.912 6.961-.898 19.745.015 12.57.606 17.07 1.167 21.351.22 1.684 3.001 2.125 3.001 2.125.331.04.698-.027 1.08-.248l75.273-43.551c1.808-1.069 2.667-3.719 3.056-6.284 1.213-7.99 1.675-32.978-.275-39.878-.196-.693-.51-1.083-.868-1.282l-2.086-.79c-.727.028-1.416.467-1.534.535L82.032 37.072l-.21.402' fill='#FFF'/><path d='M144.311 1.701l2.085.79c.358.199.672.589.868 1.282 1.949 6.9 1.487 31.887.275 39.878-.39 2.565-1.249 5.215-3.056 6.284L69.21 93.486a1.78 1.78 0 0 1-.896.258l-.183-.011c0 .001-2.782-.44-3.003-2.124-.56-4.282-1.151-8.781-1.165-21.351-.015-12.784.897-19.745.897-19.745.71-4.146 2.787-5.192 2.787-5.192l6.591-3.779.007-.128v-.043c0-.117 0-.446-.002-.578-.003-.107.059-.21.191-.285l6.012-3.472a.98.98 0 0 1 .481-.11c.218 0 .449.053.627.156.193.112.285.258.268.392l.211-.402 60.744-34.836c.117-.068.806-.507 1.534-.535m0-.997l-.039.001c-.618.023-1.283.244-1.974.656l-.021.012-60.519 34.706a2.358 2.358 0 0 0-.831-.15c-.365 0-.704.084-.98.244l-6.012 3.471c-.442.255-.699.69-.689 1.166l.001.15-6.08 3.487c-.373.199-2.542 1.531-3.29 5.898l-.006.039c-.009.07-.92 7.173-.906 19.875.014 12.62.603 17.116 1.172 21.465l.002.015c.308 2.355 3.475 2.923 3.836 2.98l.034.004c.101.013.204.019.305.019a2.77 2.77 0 0 0 1.396-.392l75.273-43.552c1.811-1.071 2.999-3.423 3.542-6.997 1.186-7.814 1.734-33.096-.301-40.299-.253-.893-.704-1.527-1.343-1.882l-.132-.062-2.085-.789a.973.973 0 0 0-.353-.065' fill='#455A64'/><path d='M128.267 11.565l1.495.434-56.339 32.326' fill='#FFF'/><path d='M74.202 90.545a.5.5 0 0 1-.25-.931l18.437-10.645a.499.499 0 1 1 .499.864L74.451 90.478l-.249.067M75.764 42.654l-.108-.062.046-.171 5.135-2.964.17.045-.045.171-5.135 2.964-.063.017M70.52 90.375V46.421l.063-.036L137.84 7.554v43.954l-.062.036L70.52 90.375zm.25-43.811v43.38l66.821-38.579V7.985L70.77 46.564z' fill='#607D8B'/><path d='M86.986 83.182c-.23.149-.612.384-.849.523l-11.505 6.701c-.237.139-.206.252.068.252h.565c.275 0 .693-.113.93-.252L87.7 83.705c.237-.139.428-.253.425-.256a11.29 11.29 0 0 1-.006-.503c0-.274-.188-.377-.418-.227l-.715.463' fill='#607D8B'/><path d='M75.266 90.782H74.7c-.2 0-.316-.056-.346-.166-.03-.11.043-.217.215-.317l11.505-6.702c.236-.138.615-.371.844-.519l.715-.464a.488.488 0 0 1 .266-.089c.172 0 .345.13.345.421 0 .214.001.363.003.437l.006.004-.004.069c-.003.075-.003.075-.486.356l-11.505 6.702a2.282 2.282 0 0 1-.992.268zm-.6-.25l.034.001h.566c.252 0 .649-.108.866-.234l11.505-6.702c.168-.098.294-.173.361-.214-.004-.084-.004-.218-.004-.437l-.095-.171-.131.049-.714.463c-.232.15-.616.386-.854.525l-11.505 6.702-.029.018z' fill='#607D8B'/><path d='M75.266 89.871H74.7c-.2 0-.316-.056-.346-.166-.03-.11.043-.217.215-.317l11.505-6.702c.258-.151.694-.268.993-.268h.565c.2 0 .316.056.346.166.03.11-.043.217-.215.317l-11.505 6.702a2.282 2.282 0 0 1-.992.268zm-.6-.25l.034.001h.566c.252 0 .649-.107.866-.234l11.505-6.702.03-.018-.035-.001h-.565c-.252 0-.649.108-.867.234l-11.505 6.702-.029.018zM74.37 90.801v-1.247 1.247' fill='#607D8B'/><path d='M68.13 93.901c-.751-.093-1.314-.737-1.439-1.376-.831-4.238-1.151-8.782-1.165-21.352-.015-12.784.897-19.745.897-19.745.711-4.146 2.787-5.192 2.787-5.192l74.859-43.219c.223-.129 2.487-1.584 3.195.923 1.95 6.9 1.488 31.887.275 39.878-.389 2.565-1.248 5.215-3.056 6.283L69.21 93.653c-.382.221-.749.288-1.08.248 0 0-2.781-.441-3.001-2.125-.561-4.281-1.152-8.781-1.167-21.351-.014-12.784.898-19.745.898-19.745.71-4.146 2.787-5.191 2.787-5.191l6.598-3.81.871-.119 6.599-3.83.046-.461L68.13 93.901' fill='#FAFAFA'/><path d='M68.317 94.161l-.215-.013h-.001l-.244-.047c-.719-.156-2.772-.736-2.976-2.292-.568-4.34-1.154-8.813-1.168-21.384-.014-12.654.891-19.707.9-19.777.725-4.231 2.832-5.338 2.922-5.382l6.628-3.827.87-.119 6.446-3.742.034-.334a.248.248 0 0 1 .273-.223.248.248 0 0 1 .223.272l-.059.589-6.752 3.919-.87.118-6.556 3.785c-.031.016-1.99 1.068-2.666 5.018-.007.06-.908 7.086-.894 19.702.014 12.539.597 16.996 1.161 21.305.091.691.689 1.154 1.309 1.452a1.95 1.95 0 0 1-.236-.609c-.781-3.984-1.155-8.202-1.17-21.399-.014-12.653.891-19.707.9-19.777.725-4.231 2.832-5.337 2.922-5.382-.004.001 74.444-42.98 74.846-43.212l.028-.017c.904-.538 1.72-.688 2.36-.433.555.221.949.733 1.172 1.52 2.014 7.128 1.46 32.219.281 39.983-.507 3.341-1.575 5.515-3.175 6.462L69.335 93.869a2.023 2.023 0 0 1-1.018.292zm-.147-.507c.293.036.604-.037.915-.217l75.273-43.551c1.823-1.078 2.602-3.915 2.934-6.106 1.174-7.731 1.731-32.695-.268-39.772-.178-.631-.473-1.032-.876-1.192-.484-.193-1.166-.052-1.921.397l-.034.021-74.858 43.218c-.031.017-1.989 1.069-2.666 5.019-.007.059-.908 7.085-.894 19.702.015 13.155.386 17.351 1.161 21.303.09.461.476.983 1.037 1.139.114.025.185.037.196.039h.001z' fill='#455A64'/><path d='M69.317 68.982c.489-.281.885-.056.885.505 0 .56-.396 1.243-.885 1.525-.488.282-.884.057-.884-.504 0-.56.396-1.243.884-1.526' fill='#FFF'/><path d='M68.92 71.133c-.289 0-.487-.228-.487-.625 0-.56.396-1.243.884-1.526a.812.812 0 0 1 .397-.121c.289 0 .488.229.488.626 0 .56-.396 1.243-.885 1.525a.812.812 0 0 1-.397.121m.794-2.459a.976.976 0 0 0-.49.147c-.548.317-.978 1.058-.978 1.687 0 .486.271.812.674.812a.985.985 0 0 0 .491-.146c.548-.317.978-1.057.978-1.687 0-.486-.272-.813-.675-.813' fill='#8097A2'/><path d='M68.92 70.947c-.271 0-.299-.307-.299-.439 0-.491.361-1.116.79-1.363a.632.632 0 0 1 .303-.096c.272 0 .301.306.301.438 0 .491-.363 1.116-.791 1.364a.629.629 0 0 1-.304.096m.794-2.086a.812.812 0 0 0-.397.121c-.488.283-.884.966-.884 1.526 0 .397.198.625.487.625a.812.812 0 0 0 .397-.121c.489-.282.885-.965.885-1.525 0-.397-.199-.626-.488-.626' fill='#8097A2'/><path d='M69.444 85.35c.264-.152.477-.031.477.272 0 .303-.213.67-.477.822-.263.153-.477.031-.477-.271 0-.302.214-.671.477-.823' fill='#FFF'/><path d='M69.23 86.51c-.156 0-.263-.123-.263-.337 0-.302.214-.671.477-.823a.431.431 0 0 1 .214-.066c.156 0 .263.124.263.338 0 .303-.213.67-.477.822a.431.431 0 0 1-.214.066m.428-1.412c-.1 0-.203.029-.307.09-.32.185-.57.618-.57.985 0 .309.185.524.449.524a.63.63 0 0 0 .308-.09c.32-.185.57-.618.57-.985 0-.309-.185-.524-.45-.524' fill='#8097A2'/><path d='M69.23 86.322l-.076-.149c0-.235.179-.544.384-.661l.12-.041.076.151c0 .234-.179.542-.383.66l-.121.04m.428-1.038a.431.431 0 0 0-.214.066c-.263.152-.477.521-.477.823 0 .214.107.337.263.337a.431.431 0 0 0 .214-.066c.264-.152.477-.519.477-.822 0-.214-.107-.338-.263-.338' fill='#8097A2'/><path d='M139.278 7.769v43.667L72.208 90.16V46.493l67.07-38.724' fill='#455A64'/><path d='M72.083 90.375V46.421l.063-.036 67.257-38.831v43.954l-.062.036-67.258 38.831zm.25-43.811v43.38l66.821-38.579V7.985L72.333 46.564z' fill='#607D8B'/></g><path d='M125.737 88.647l-7.639 3.334V84l-11.459 4.713v8.269L99 100.315l13.369 3.646 13.368-15.314' fill='#455A64'/></g></svg>";
function RotateInstructions() {
  this.loadIcon_();
  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.top = 0;
  s.right = 0;
  s.bottom = 0;
  s.left = 0;
  s.backgroundColor = 'gray';
  s.fontFamily = 'sans-serif';
  s.zIndex = 1000000;
  var img = document.createElement('img');
  img.src = this.icon;
  var s = img.style;
  s.marginLeft = '25%';
  s.marginTop = '25%';
  s.width = '50%';
  overlay.appendChild(img);
  var text = document.createElement('div');
  var s = text.style;
  s.textAlign = 'center';
  s.fontSize = '16px';
  s.lineHeight = '24px';
  s.margin = '24px 25%';
  s.width = '50%';
  text.innerHTML = 'Place your phone into your Cardboard viewer.';
  overlay.appendChild(text);
  var snackbar = document.createElement('div');
  var s = snackbar.style;
  s.backgroundColor = '#CFD8DC';
  s.position = 'fixed';
  s.bottom = 0;
  s.width = '100%';
  s.height = '48px';
  s.padding = '14px 24px';
  s.boxSizing = 'border-box';
  s.color = '#656A6B';
  overlay.appendChild(snackbar);
  var snackbarText = document.createElement('div');
  snackbarText.style.float = 'left';
  snackbarText.innerHTML = 'No Cardboard viewer?';
  var snackbarButton = document.createElement('a');
  snackbarButton.href = 'https://www.google.com/get/cardboard/get-cardboard/';
  snackbarButton.innerHTML = 'get one';
  snackbarButton.target = '_blank';
  var s = snackbarButton.style;
  s.float = 'right';
  s.fontWeight = 600;
  s.textTransform = 'uppercase';
  s.borderLeft = '1px solid gray';
  s.paddingLeft = '24px';
  s.textDecoration = 'none';
  s.color = '#656A6B';
  snackbar.appendChild(snackbarText);
  snackbar.appendChild(snackbarButton);
  this.overlay = overlay;
  this.text = text;
  this.hide();
}
RotateInstructions.prototype.show = function (parent) {
  if (!parent && !this.overlay.parentElement) {
    document.body.appendChild(this.overlay);
  } else if (parent) {
    if (this.overlay.parentElement && this.overlay.parentElement != parent) this.overlay.parentElement.removeChild(this.overlay);
    parent.appendChild(this.overlay);
  }
  this.overlay.style.display = 'block';
  var img = this.overlay.querySelector('img');
  var s = img.style;
  if (isLandscapeMode()) {
    s.width = '20%';
    s.marginLeft = '40%';
    s.marginTop = '3%';
  } else {
    s.width = '50%';
    s.marginLeft = '25%';
    s.marginTop = '25%';
  }
};
RotateInstructions.prototype.hide = function () {
  this.overlay.style.display = 'none';
};
RotateInstructions.prototype.showTemporarily = function (ms, parent) {
  this.show(parent);
  this.timer = setTimeout(this.hide.bind(this), ms);
};
RotateInstructions.prototype.disableShowTemporarily = function () {
  clearTimeout(this.timer);
};
RotateInstructions.prototype.update = function () {
  this.disableShowTemporarily();
  if (!isLandscapeMode() && isMobile()) {
    this.show();
  } else {
    this.hide();
  }
};
RotateInstructions.prototype.loadIcon_ = function () {
  this.icon = dataUri('image/svg+xml', rotateInstructionsAsset);
};
var DEFAULT_VIEWER = 'CardboardV1';
var VIEWER_KEY = 'WEBVR_CARDBOARD_VIEWER';
var CLASS_NAME = 'webvr-polyfill-viewer-selector';
function ViewerSelector(defaultViewer) {
  try {
    this.selectedKey = localStorage.getItem(VIEWER_KEY);
  } catch (error) {
    console.error('Failed to load viewer profile: %s', error);
  }
  if (!this.selectedKey) {
    this.selectedKey = defaultViewer || DEFAULT_VIEWER;
  }
  this.dialog = this.createDialog_(DeviceInfo.Viewers);
  this.root = null;
  this.onChangeCallbacks_ = [];
}
ViewerSelector.prototype.show = function (root) {
  this.root = root;
  root.appendChild(this.dialog);
  var selected = this.dialog.querySelector('#' + this.selectedKey);
  selected.checked = true;
  this.dialog.style.display = 'block';
};
ViewerSelector.prototype.hide = function () {
  if (this.root && this.root.contains(this.dialog)) {
    this.root.removeChild(this.dialog);
  }
  this.dialog.style.display = 'none';
};
ViewerSelector.prototype.getCurrentViewer = function () {
  return DeviceInfo.Viewers[this.selectedKey];
};
ViewerSelector.prototype.getSelectedKey_ = function () {
  var input = this.dialog.querySelector('input[name=field]:checked');
  if (input) {
    return input.id;
  }
  return null;
};
ViewerSelector.prototype.onChange = function (cb) {
  this.onChangeCallbacks_.push(cb);
};
ViewerSelector.prototype.fireOnChange_ = function (viewer) {
  for (var i = 0; i < this.onChangeCallbacks_.length; i++) {
    this.onChangeCallbacks_[i](viewer);
  }
};
ViewerSelector.prototype.onSave_ = function () {
  this.selectedKey = this.getSelectedKey_();
  if (!this.selectedKey || !DeviceInfo.Viewers[this.selectedKey]) {
    console.error('ViewerSelector.onSave_: this should never happen!');
    return;
  }
  this.fireOnChange_(DeviceInfo.Viewers[this.selectedKey]);
  try {
    localStorage.setItem(VIEWER_KEY, this.selectedKey);
  } catch (error) {
    console.error('Failed to save viewer profile: %s', error);
  }
  this.hide();
};
ViewerSelector.prototype.createDialog_ = function (options) {
  var container = document.createElement('div');
  container.classList.add(CLASS_NAME);
  container.style.display = 'none';
  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.left = 0;
  s.top = 0;
  s.width = '100%';
  s.height = '100%';
  s.background = 'rgba(0, 0, 0, 0.3)';
  overlay.addEventListener('click', this.hide.bind(this));
  var width = 280;
  var dialog = document.createElement('div');
  var s = dialog.style;
  s.boxSizing = 'border-box';
  s.position = 'fixed';
  s.top = '24px';
  s.left = '50%';
  s.marginLeft = -width / 2 + 'px';
  s.width = width + 'px';
  s.padding = '24px';
  s.overflow = 'hidden';
  s.background = '#fafafa';
  s.fontFamily = "'Roboto', sans-serif";
  s.boxShadow = '0px 5px 20px #666';
  dialog.appendChild(this.createH1_('Select your viewer'));
  for (var id in options) {
    dialog.appendChild(this.createChoice_(id, options[id].label));
  }
  dialog.appendChild(this.createButton_('Save', this.onSave_.bind(this)));
  container.appendChild(overlay);
  container.appendChild(dialog);
  return container;
};
ViewerSelector.prototype.createH1_ = function (name) {
  var h1 = document.createElement('h1');
  var s = h1.style;
  s.color = 'black';
  s.fontSize = '20px';
  s.fontWeight = 'bold';
  s.marginTop = 0;
  s.marginBottom = '24px';
  h1.innerHTML = name;
  return h1;
};
ViewerSelector.prototype.createChoice_ = function (id, name) {
  var div = document.createElement('div');
  div.style.marginTop = '8px';
  div.style.color = 'black';
  var input = document.createElement('input');
  input.style.fontSize = '30px';
  input.setAttribute('id', id);
  input.setAttribute('type', 'radio');
  input.setAttribute('value', id);
  input.setAttribute('name', 'field');
  var label = document.createElement('label');
  label.style.marginLeft = '4px';
  label.setAttribute('for', id);
  label.innerHTML = name;
  div.appendChild(input);
  div.appendChild(label);
  return div;
};
ViewerSelector.prototype.createButton_ = function (label, onclick) {
  var button = document.createElement('button');
  button.innerHTML = label;
  var s = button.style;
  s.float = 'right';
  s.textTransform = 'uppercase';
  s.color = '#1094f7';
  s.fontSize = '14px';
  s.letterSpacing = 0;
  s.border = 0;
  s.background = 'none';
  s.marginTop = '16px';
  button.addEventListener('click', onclick);
  return button;
};
var commonjsGlobal$$1 = typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : {};
function unwrapExports$$1 (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}
function createCommonjsModule$$1(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}
var NoSleep = createCommonjsModule$$1(function (module, exports) {
(function webpackUniversalModuleDefinition(root, factory) {
	module.exports = factory();
})(commonjsGlobal$$1, function() {
return          (function(modules) {
         	var installedModules = {};
         	function __webpack_require__(moduleId) {
         		if(installedModules[moduleId]) {
         			return installedModules[moduleId].exports;
         		}
         		var module = installedModules[moduleId] = {
         			i: moduleId,
         			l: false,
         			exports: {}
         		};
         		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
         		module.l = true;
         		return module.exports;
         	}
         	__webpack_require__.m = modules;
         	__webpack_require__.c = installedModules;
         	__webpack_require__.d = function(exports, name, getter) {
         		if(!__webpack_require__.o(exports, name)) {
         			Object.defineProperty(exports, name, {
         				configurable: false,
         				enumerable: true,
         				get: getter
         			});
         		}
         	};
         	__webpack_require__.n = function(module) {
         		var getter = module && module.__esModule ?
         			function getDefault() { return module['default']; } :
         			function getModuleExports() { return module; };
         		__webpack_require__.d(getter, 'a', getter);
         		return getter;
         	};
         	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
         	__webpack_require__.p = "";
         	return __webpack_require__(__webpack_require__.s = 0);
         })
         ([
      (function(module, exports, __webpack_require__) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var mediaFile = __webpack_require__(1);
var oldIOS = typeof navigator !== 'undefined' && parseFloat(('' + (/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ''])[1]).replace('undefined', '3_2').replace('_', '.').replace('_', '')) < 10 && !window.MSStream;
var NoSleep = function () {
  function NoSleep() {
    _classCallCheck(this, NoSleep);
    if (oldIOS) {
      this.noSleepTimer = null;
    } else {
      this.noSleepVideo = document.createElement('video');
      this.noSleepVideo.setAttribute('playsinline', '');
      this.noSleepVideo.setAttribute('src', mediaFile);
      this.noSleepVideo.addEventListener('timeupdate', function (e) {
        if (this.noSleepVideo.currentTime > 0.5) {
          this.noSleepVideo.currentTime = Math.random();
        }
      }.bind(this));
    }
  }
  _createClass(NoSleep, [{
    key: 'enable',
    value: function enable() {
      if (oldIOS) {
        this.disable();
        this.noSleepTimer = window.setInterval(function () {
          window.location.href = '/';
          window.setTimeout(window.stop, 0);
        }, 15000);
      } else {
        this.noSleepVideo.play();
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (oldIOS) {
        if (this.noSleepTimer) {
          window.clearInterval(this.noSleepTimer);
          this.noSleepTimer = null;
        }
      } else {
        this.noSleepVideo.pause();
      }
    }
  }]);
  return NoSleep;
}();
module.exports = NoSleep;
      }),
      (function(module, exports, __webpack_require__) {
module.exports = 'data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKBtZGF0AAAC8wYF///v3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9NiBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MSBrZXlpbnQ9MzAwIGtleWludF9taW49MzAgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0xMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IHZidl9tYXhyYXRlPTIwMDAwIHZidl9idWZzaXplPTI1MDAwIGNyZl9tYXg9MC4wIG5hbF9ocmQ9bm9uZSBmaWxsZXI9MCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAOWWIhAA3//p+C7v8tDDSTjf97w55i3SbRPO4ZY+hkjD5hbkAkL3zpJ6h/LR1CAABzgB1kqqzUorlhQAAAAxBmiQYhn/+qZYADLgAAAAJQZ5CQhX/AAj5IQADQGgcIQADQGgcAAAACQGeYUQn/wALKCEAA0BoHAAAAAkBnmNEJ/8ACykhAANAaBwhAANAaBwAAAANQZpoNExDP/6plgAMuSEAA0BoHAAAAAtBnoZFESwr/wAI+SEAA0BoHCEAA0BoHAAAAAkBnqVEJ/8ACykhAANAaBwAAAAJAZ6nRCf/AAsoIQADQGgcIQADQGgcAAAADUGarDRMQz/+qZYADLghAANAaBwAAAALQZ7KRRUsK/8ACPkhAANAaBwAAAAJAZ7pRCf/AAsoIQADQGgcIQADQGgcAAAACQGe60Qn/wALKCEAA0BoHAAAAA1BmvA0TEM//qmWAAy5IQADQGgcIQADQGgcAAAAC0GfDkUVLCv/AAj5IQADQGgcAAAACQGfLUQn/wALKSEAA0BoHCEAA0BoHAAAAAkBny9EJ/8ACyghAANAaBwAAAANQZs0NExDP/6plgAMuCEAA0BoHAAAAAtBn1JFFSwr/wAI+SEAA0BoHCEAA0BoHAAAAAkBn3FEJ/8ACyghAANAaBwAAAAJAZ9zRCf/AAsoIQADQGgcIQADQGgcAAAADUGbeDRMQz/+qZYADLkhAANAaBwAAAALQZ+WRRUsK/8ACPghAANAaBwhAANAaBwAAAAJAZ+1RCf/AAspIQADQGgcAAAACQGft0Qn/wALKSEAA0BoHCEAA0BoHAAAAA1Bm7w0TEM//qmWAAy4IQADQGgcAAAAC0Gf2kUVLCv/AAj5IQADQGgcAAAACQGf+UQn/wALKCEAA0BoHCEAA0BoHAAAAAkBn/tEJ/8ACykhAANAaBwAAAANQZvgNExDP/6plgAMuSEAA0BoHCEAA0BoHAAAAAtBnh5FFSwr/wAI+CEAA0BoHAAAAAkBnj1EJ/8ACyghAANAaBwhAANAaBwAAAAJAZ4/RCf/AAspIQADQGgcAAAADUGaJDRMQz/+qZYADLghAANAaBwAAAALQZ5CRRUsK/8ACPkhAANAaBwhAANAaBwAAAAJAZ5hRCf/AAsoIQADQGgcAAAACQGeY0Qn/wALKSEAA0BoHCEAA0BoHAAAAA1Bmmg0TEM//qmWAAy5IQADQGgcAAAAC0GehkUVLCv/AAj5IQADQGgcIQADQGgcAAAACQGepUQn/wALKSEAA0BoHAAAAAkBnqdEJ/8ACyghAANAaBwAAAANQZqsNExDP/6plgAMuCEAA0BoHCEAA0BoHAAAAAtBnspFFSwr/wAI+SEAA0BoHAAAAAkBnulEJ/8ACyghAANAaBwhAANAaBwAAAAJAZ7rRCf/AAsoIQADQGgcAAAADUGa8DRMQz/+qZYADLkhAANAaBwhAANAaBwAAAALQZ8ORRUsK/8ACPkhAANAaBwAAAAJAZ8tRCf/AAspIQADQGgcIQADQGgcAAAACQGfL0Qn/wALKCEAA0BoHAAAAA1BmzQ0TEM//qmWAAy4IQADQGgcAAAAC0GfUkUVLCv/AAj5IQADQGgcIQADQGgcAAAACQGfcUQn/wALKCEAA0BoHAAAAAkBn3NEJ/8ACyghAANAaBwhAANAaBwAAAANQZt4NExC//6plgAMuSEAA0BoHAAAAAtBn5ZFFSwr/wAI+CEAA0BoHCEAA0BoHAAAAAkBn7VEJ/8ACykhAANAaBwAAAAJAZ+3RCf/AAspIQADQGgcAAAADUGbuzRMQn/+nhAAYsAhAANAaBwhAANAaBwAAAAJQZ/aQhP/AAspIQADQGgcAAAACQGf+UQn/wALKCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHAAACiFtb292AAAAbG12aGQAAAAA1YCCX9WAgl8AAAPoAAAH/AABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAGGlvZHMAAAAAEICAgAcAT////v7/AAAF+XRyYWsAAABcdGtoZAAAAAPVgIJf1YCCXwAAAAEAAAAAAAAH0AAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAygAAAMoAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAB9AAABdwAAEAAAAABXFtZGlhAAAAIG1kaGQAAAAA1YCCX9WAgl8AAV+QAAK/IFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAUcbWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAE3HN0YmwAAACYc3RzZAAAAAAAAAABAAAAiGF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAygDKAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAyYXZjQwFNQCj/4QAbZ01AKOyho3ySTUBAQFAAAAMAEAAr8gDxgxlgAQAEaO+G8gAAABhzdHRzAAAAAAAAAAEAAAA8AAALuAAAABRzdHNzAAAAAAAAAAEAAAABAAAB8GN0dHMAAAAAAAAAPAAAAAEAABdwAAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAAC7gAAAAAQAAF3AAAAABAAAAAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAEEc3RzegAAAAAAAAAAAAAAPAAAAzQAAAAQAAAADQAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAANAAAADQAAAQBzdGNvAAAAAAAAADwAAAAwAAADZAAAA3QAAAONAAADoAAAA7kAAAPQAAAD6wAAA/4AAAQXAAAELgAABEMAAARcAAAEbwAABIwAAAShAAAEugAABM0AAATkAAAE/wAABRIAAAUrAAAFQgAABV0AAAVwAAAFiQAABaAAAAW1AAAFzgAABeEAAAX+AAAGEwAABiwAAAY/AAAGVgAABnEAAAaEAAAGnQAABrQAAAbPAAAG4gAABvUAAAcSAAAHJwAAB0AAAAdTAAAHcAAAB4UAAAeeAAAHsQAAB8gAAAfjAAAH9gAACA8AAAgmAAAIQQAACFQAAAhnAAAIhAAACJcAAAMsdHJhawAAAFx0a2hkAAAAA9WAgl/VgIJfAAAAAgAAAAAAAAf8AAAAAAAAAAAAAAABAQAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAACsm1kaWEAAAAgbWRoZAAAAADVgIJf1YCCXwAArEQAAWAAVcQAAAAAACdoZGxyAAAAAAAAAABzb3VuAAAAAAAAAAAAAAAAU3RlcmVvAAAAAmNtaW5mAAAAEHNtaGQAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAidzdGJsAAAAZ3N0c2QAAAAAAAAAAQAAAFdtcDRhAAAAAAAAAAEAAAAAAAAAAAACABAAAAAArEQAAAAAADNlc2RzAAAAAAOAgIAiAAIABICAgBRAFQAAAAADDUAAAAAABYCAgAISEAaAgIABAgAAABhzdHRzAAAAAAAAAAEAAABYAAAEAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAAGAAAAWAAAAXBzdGNvAAAAAAAAAFgAAAOBAAADhwAAA5oAAAOtAAADswAAA8oAAAPfAAAD5QAAA/gAAAQLAAAEEQAABCgAAAQ9AAAEUAAABFYAAARpAAAEgAAABIYAAASbAAAErgAABLQAAATHAAAE3gAABPMAAAT5AAAFDAAABR8AAAUlAAAFPAAABVEAAAVXAAAFagAABX0AAAWDAAAFmgAABa8AAAXCAAAFyAAABdsAAAXyAAAF+AAABg0AAAYgAAAGJgAABjkAAAZQAAAGZQAABmsAAAZ+AAAGkQAABpcAAAauAAAGwwAABskAAAbcAAAG7wAABwYAAAcMAAAHIQAABzQAAAc6AAAHTQAAB2QAAAdqAAAHfwAAB5IAAAeYAAAHqwAAB8IAAAfXAAAH3QAAB/AAAAgDAAAICQAACCAAAAg1AAAIOwAACE4AAAhhAAAIeAAACH4AAAiRAAAIpAAACKoAAAiwAAAItgAACLwAAAjCAAAAFnVkdGEAAAAObmFtZVN0ZXJlbwAAAHB1ZHRhAAAAaG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAO2lsc3QAAAAzqXRvbwAAACtkYXRhAAAAAQAAAABIYW5kQnJha2UgMC4xMC4yIDIwMTUwNjExMDA=';
      })
         ]);
});
});
var NoSleep$1 = unwrapExports$$1(NoSleep);
var nextDisplayId = 1000;
var defaultLeftBounds = [0, 0, 0.5, 1];
var defaultRightBounds = [0.5, 0, 0.5, 1];
var raf = window.requestAnimationFrame;
var caf = window.cancelAnimationFrame;
function VRFrameData() {
  this.leftProjectionMatrix = new Float32Array(16);
  this.leftViewMatrix = new Float32Array(16);
  this.rightProjectionMatrix = new Float32Array(16);
  this.rightViewMatrix = new Float32Array(16);
  this.pose = null;
}
function VRDisplayCapabilities(config) {
  Object.defineProperties(this, {
    hasPosition: {
      writable: false, enumerable: true, value: config.hasPosition
    },
    hasExternalDisplay: {
      writable: false, enumerable: true, value: config.hasExternalDisplay
    },
    canPresent: {
      writable: false, enumerable: true, value: config.canPresent
    },
    maxLayers: {
      writable: false, enumerable: true, value: config.maxLayers
    },
    hasOrientation: {
      enumerable: true, get: function get() {
        deprecateWarning('VRDisplayCapabilities.prototype.hasOrientation', 'VRDisplay.prototype.getFrameData');
        return config.hasOrientation;
      }
    }
  });
}
function VRDisplay(config) {
  config = config || {};
  var USE_WAKELOCK = 'wakelock' in config ? config.wakelock : true;
  this.isPolyfilled = true;
  this.displayId = nextDisplayId++;
  this.displayName = '';
  this.depthNear = 0.01;
  this.depthFar = 10000.0;
  this.isPresenting = false;
  Object.defineProperty(this, 'isConnected', {
    get: function get() {
      deprecateWarning('VRDisplay.prototype.isConnected', 'VRDisplayCapabilities.prototype.hasExternalDisplay');
      return false;
    }
  });
  this.capabilities = new VRDisplayCapabilities({
    hasPosition: false,
    hasOrientation: false,
    hasExternalDisplay: false,
    canPresent: false,
    maxLayers: 1
  });
  this.stageParameters = null;
  this.waitingForPresent_ = false;
  this.layer_ = null;
  this.originalParent_ = null;
  this.fullscreenElement_ = null;
  this.fullscreenWrapper_ = null;
  this.fullscreenElementCachedStyle_ = null;
  this.fullscreenEventTarget_ = null;
  this.fullscreenChangeHandler_ = null;
  this.fullscreenErrorHandler_ = null;
  if (USE_WAKELOCK && isMobile()) {
    this.wakelock_ = new NoSleep$1();
  }
}
VRDisplay.prototype.getFrameData = function (frameData) {
  return frameDataFromPose(frameData, this._getPose(), this);
};
VRDisplay.prototype.getPose = function () {
  deprecateWarning('VRDisplay.prototype.getPose', 'VRDisplay.prototype.getFrameData');
  return this._getPose();
};
VRDisplay.prototype.resetPose = function () {
  deprecateWarning('VRDisplay.prototype.resetPose');
  return this._resetPose();
};
VRDisplay.prototype.getImmediatePose = function () {
  deprecateWarning('VRDisplay.prototype.getImmediatePose', 'VRDisplay.prototype.getFrameData');
  return this._getPose();
};
VRDisplay.prototype.requestAnimationFrame = function (callback) {
  return raf(callback);
};
VRDisplay.prototype.cancelAnimationFrame = function (id) {
  return caf(id);
};
VRDisplay.prototype.wrapForFullscreen = function (element) {
  if (isIOS()) {
    return element;
  }
  if (!this.fullscreenWrapper_) {
    this.fullscreenWrapper_ = document.createElement('div');
    var cssProperties = ['height: ' + Math.min(screen.height, screen.width) + 'px !important', 'top: 0 !important', 'left: 0 !important', 'right: 0 !important', 'border: 0', 'margin: 0', 'padding: 0', 'z-index: 999999 !important', 'position: fixed'];
    this.fullscreenWrapper_.setAttribute('style', cssProperties.join('; ') + ';');
    this.fullscreenWrapper_.classList.add('webvr-polyfill-fullscreen-wrapper');
  }
  if (this.fullscreenElement_ == element) {
    return this.fullscreenWrapper_;
  }
  if (this.fullscreenElement_) {
    if (this.originalParent_) {
      this.originalParent_.appendChild(this.fullscreenElement_);
    } else {
      this.fullscreenElement_.parentElement.removeChild(this.fullscreenElement_);
    }
  }
  this.fullscreenElement_ = element;
  this.originalParent_ = element.parentElement;
  if (!this.originalParent_) {
    document.body.appendChild(element);
  }
  if (!this.fullscreenWrapper_.parentElement) {
    var parent = this.fullscreenElement_.parentElement;
    parent.insertBefore(this.fullscreenWrapper_, this.fullscreenElement_);
    parent.removeChild(this.fullscreenElement_);
  }
  this.fullscreenWrapper_.insertBefore(this.fullscreenElement_, this.fullscreenWrapper_.firstChild);
  this.fullscreenElementCachedStyle_ = this.fullscreenElement_.getAttribute('style');
  var self = this;
  function applyFullscreenElementStyle() {
    if (!self.fullscreenElement_) {
      return;
    }
    var cssProperties = ['position: absolute', 'top: 0', 'left: 0', 'width: ' + Math.max(screen.width, screen.height) + 'px', 'height: ' + Math.min(screen.height, screen.width) + 'px', 'border: 0', 'margin: 0', 'padding: 0'];
    self.fullscreenElement_.setAttribute('style', cssProperties.join('; ') + ';');
  }
  applyFullscreenElementStyle();
  return this.fullscreenWrapper_;
};
VRDisplay.prototype.removeFullscreenWrapper = function () {
  if (!this.fullscreenElement_) {
    return;
  }
  var element = this.fullscreenElement_;
  if (this.fullscreenElementCachedStyle_) {
    element.setAttribute('style', this.fullscreenElementCachedStyle_);
  } else {
    element.removeAttribute('style');
  }
  this.fullscreenElement_ = null;
  this.fullscreenElementCachedStyle_ = null;
  var parent = this.fullscreenWrapper_.parentElement;
  this.fullscreenWrapper_.removeChild(element);
  if (this.originalParent_ === parent) {
    parent.insertBefore(element, this.fullscreenWrapper_);
  }
  else if (this.originalParent_) {
      this.originalParent_.appendChild(element);
    }
  parent.removeChild(this.fullscreenWrapper_);
  return element;
};
VRDisplay.prototype.requestPresent = function (layers) {
  var wasPresenting = this.isPresenting;
  var self = this;
  if (!(layers instanceof Array)) {
    deprecateWarning('VRDisplay.prototype.requestPresent with non-array argument', 'an array of VRLayers as the first argument');
    layers = [layers];
  }
  return new Promise(function (resolve, reject) {
    if (!self.capabilities.canPresent) {
      reject(new Error('VRDisplay is not capable of presenting.'));
      return;
    }
    if (layers.length == 0 || layers.length > self.capabilities.maxLayers) {
      reject(new Error('Invalid number of layers.'));
      return;
    }
    var incomingLayer = layers[0];
    if (!incomingLayer.source) {
      resolve();
      return;
    }
    var leftBounds = incomingLayer.leftBounds || defaultLeftBounds;
    var rightBounds = incomingLayer.rightBounds || defaultRightBounds;
    if (wasPresenting) {
      var layer = self.layer_;
      if (layer.source !== incomingLayer.source) {
        layer.source = incomingLayer.source;
      }
      for (var i = 0; i < 4; i++) {
        layer.leftBounds[i] = leftBounds[i];
        layer.rightBounds[i] = rightBounds[i];
      }
      self.wrapForFullscreen(self.layer_.source);
      self.updatePresent_();
      resolve();
      return;
    }
    self.layer_ = {
      predistorted: incomingLayer.predistorted,
      source: incomingLayer.source,
      leftBounds: leftBounds.slice(0),
      rightBounds: rightBounds.slice(0)
    };
    self.waitingForPresent_ = false;
    if (self.layer_ && self.layer_.source) {
      var fullscreenElement = self.wrapForFullscreen(self.layer_.source);
      var onFullscreenChange = function onFullscreenChange() {
        var actualFullscreenElement = getFullscreenElement();
        self.isPresenting = fullscreenElement === actualFullscreenElement;
        if (self.isPresenting) {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape-primary').catch(function (error) {
              console.error('screen.orientation.lock() failed due to', error.message);
            });
          }
          self.waitingForPresent_ = false;
          self.beginPresent_();
          resolve();
        } else {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          self.removeFullscreenWrapper();
          self.disableWakeLock();
          self.endPresent_();
          self.removeFullscreenListeners_();
        }
        self.fireVRDisplayPresentChange_();
      };
      var onFullscreenError = function onFullscreenError() {
        if (!self.waitingForPresent_) {
          return;
        }
        self.removeFullscreenWrapper();
        self.removeFullscreenListeners_();
        self.disableWakeLock();
        self.waitingForPresent_ = false;
        self.isPresenting = false;
        reject(new Error('Unable to present.'));
      };
      self.addFullscreenListeners_(fullscreenElement, onFullscreenChange, onFullscreenError);
      if (requestFullscreen(fullscreenElement)) {
        self.enableWakeLock();
        self.waitingForPresent_ = true;
      } else if (isIOS() || isWebViewAndroid()) {
        self.enableWakeLock();
        self.isPresenting = true;
        self.beginPresent_();
        self.fireVRDisplayPresentChange_();
        resolve();
      }
    }
    if (!self.waitingForPresent_ && !isIOS()) {
      exitFullscreen();
      reject(new Error('Unable to present.'));
    }
  });
};
VRDisplay.prototype.exitPresent = function () {
  var wasPresenting = this.isPresenting;
  var self = this;
  this.isPresenting = false;
  this.layer_ = null;
  this.disableWakeLock();
  return new Promise(function (resolve, reject) {
    if (wasPresenting) {
      if (!exitFullscreen() && isIOS()) {
        self.endPresent_();
        self.fireVRDisplayPresentChange_();
      }
      if (isWebViewAndroid()) {
        self.removeFullscreenWrapper();
        self.removeFullscreenListeners_();
        self.endPresent_();
        self.fireVRDisplayPresentChange_();
      }
      resolve();
    } else {
      reject(new Error('Was not presenting to VRDisplay.'));
    }
  });
};
VRDisplay.prototype.getLayers = function () {
  if (this.layer_) {
    return [this.layer_];
  }
  return [];
};
VRDisplay.prototype.fireVRDisplayPresentChange_ = function () {
  var event = new CustomEvent('vrdisplaypresentchange', { detail: { display: this } });
  window.dispatchEvent(event);
};
VRDisplay.prototype.fireVRDisplayConnect_ = function () {
  var event = new CustomEvent('vrdisplayconnect', { detail: { display: this } });
  window.dispatchEvent(event);
};
VRDisplay.prototype.addFullscreenListeners_ = function (element, changeHandler, errorHandler) {
  this.removeFullscreenListeners_();
  this.fullscreenEventTarget_ = element;
  this.fullscreenChangeHandler_ = changeHandler;
  this.fullscreenErrorHandler_ = errorHandler;
  if (changeHandler) {
    if (document.fullscreenEnabled) {
      element.addEventListener('fullscreenchange', changeHandler, false);
    } else if (document.webkitFullscreenEnabled) {
      element.addEventListener('webkitfullscreenchange', changeHandler, false);
    } else if (document.mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenchange', changeHandler, false);
    } else if (document.msFullscreenEnabled) {
      element.addEventListener('msfullscreenchange', changeHandler, false);
    }
  }
  if (errorHandler) {
    if (document.fullscreenEnabled) {
      element.addEventListener('fullscreenerror', errorHandler, false);
    } else if (document.webkitFullscreenEnabled) {
      element.addEventListener('webkitfullscreenerror', errorHandler, false);
    } else if (document.mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenerror', errorHandler, false);
    } else if (document.msFullscreenEnabled) {
      element.addEventListener('msfullscreenerror', errorHandler, false);
    }
  }
};
VRDisplay.prototype.removeFullscreenListeners_ = function () {
  if (!this.fullscreenEventTarget_) return;
  var element = this.fullscreenEventTarget_;
  if (this.fullscreenChangeHandler_) {
    var changeHandler = this.fullscreenChangeHandler_;
    element.removeEventListener('fullscreenchange', changeHandler, false);
    element.removeEventListener('webkitfullscreenchange', changeHandler, false);
    document.removeEventListener('mozfullscreenchange', changeHandler, false);
    element.removeEventListener('msfullscreenchange', changeHandler, false);
  }
  if (this.fullscreenErrorHandler_) {
    var errorHandler = this.fullscreenErrorHandler_;
    element.removeEventListener('fullscreenerror', errorHandler, false);
    element.removeEventListener('webkitfullscreenerror', errorHandler, false);
    document.removeEventListener('mozfullscreenerror', errorHandler, false);
    element.removeEventListener('msfullscreenerror', errorHandler, false);
  }
  this.fullscreenEventTarget_ = null;
  this.fullscreenChangeHandler_ = null;
  this.fullscreenErrorHandler_ = null;
};
VRDisplay.prototype.enableWakeLock = function () {
  if (this.wakelock_) {
    this.wakelock_.enable();
  }
};
VRDisplay.prototype.disableWakeLock = function () {
  if (this.wakelock_) {
    this.wakelock_.disable();
  }
};
VRDisplay.prototype.beginPresent_ = function () {
};
VRDisplay.prototype.endPresent_ = function () {
};
VRDisplay.prototype.submitFrame = function (pose) {
};
VRDisplay.prototype.getEyeParameters = function (whichEye) {
  return null;
};
var config = {
  ADDITIONAL_VIEWERS: [],
  DEFAULT_VIEWER: '',
  MOBILE_WAKE_LOCK: true,
  DEBUG: false,
  DPDB_URL: 'https://dpdb.webvr.rocks/dpdb.json',
  K_FILTER: 0.98,
  PREDICTION_TIME_S: 0.040,
  CARDBOARD_UI_DISABLED: false,
  ROTATE_INSTRUCTIONS_DISABLED: false,
  YAW_ONLY: false,
  BUFFER_SCALE: 0.5,
  DIRTY_SUBMIT_FRAME_BINDINGS: false
};
var Eye = {
  LEFT: 'left',
  RIGHT: 'right'
};
function CardboardVRDisplay(config$$1) {
  var defaults = extend({}, config);
  config$$1 = extend(defaults, config$$1 || {});
  VRDisplay.call(this, {
    wakelock: config$$1.MOBILE_WAKE_LOCK
  });
  this.config = config$$1;
  this.displayName = 'Cardboard VRDisplay';
  this.capabilities = new VRDisplayCapabilities({
    hasPosition: false,
    hasOrientation: true,
    hasExternalDisplay: false,
    canPresent: true,
    maxLayers: 1
  });
  this.stageParameters = null;
  this.bufferScale_ = this.config.BUFFER_SCALE;
  this.poseSensor_ = new PoseSensor(this.config);
  this.distorter_ = null;
  this.cardboardUI_ = null;
  this.dpdb_ = new Dpdb(this.config.DPDB_URL, this.onDeviceParamsUpdated_.bind(this));
  this.deviceInfo_ = new DeviceInfo(this.dpdb_.getDeviceParams(), config$$1.ADDITIONAL_VIEWERS);
  this.viewerSelector_ = new ViewerSelector(config$$1.DEFAULT_VIEWER);
  this.viewerSelector_.onChange(this.onViewerChanged_.bind(this));
  this.deviceInfo_.setViewer(this.viewerSelector_.getCurrentViewer());
  if (!this.config.ROTATE_INSTRUCTIONS_DISABLED) {
    this.rotateInstructions_ = new RotateInstructions();
  }
  if (isIOS()) {
    window.addEventListener('resize', this.onResize_.bind(this));
  }
}
CardboardVRDisplay.prototype = Object.create(VRDisplay.prototype);
CardboardVRDisplay.prototype._getPose = function () {
  return {
    position: null,
    orientation: this.poseSensor_.getOrientation(),
    linearVelocity: null,
    linearAcceleration: null,
    angularVelocity: null,
    angularAcceleration: null
  };
};
CardboardVRDisplay.prototype._resetPose = function () {
  if (this.poseSensor_.resetPose) {
    this.poseSensor_.resetPose();
  }
};
CardboardVRDisplay.prototype._getFieldOfView = function (whichEye) {
  var fieldOfView;
  if (whichEye == Eye.LEFT) {
    fieldOfView = this.deviceInfo_.getFieldOfViewLeftEye();
  } else if (whichEye == Eye.RIGHT) {
    fieldOfView = this.deviceInfo_.getFieldOfViewRightEye();
  } else {
    console.error('Invalid eye provided: %s', whichEye);
    return null;
  }
  return fieldOfView;
};
CardboardVRDisplay.prototype._getEyeOffset = function (whichEye) {
  var offset;
  if (whichEye == Eye.LEFT) {
    offset = [-this.deviceInfo_.viewer.interLensDistance * 0.5, 0.0, 0.0];
  } else if (whichEye == Eye.RIGHT) {
    offset = [this.deviceInfo_.viewer.interLensDistance * 0.5, 0.0, 0.0];
  } else {
    console.error('Invalid eye provided: %s', whichEye);
    return null;
  }
  return offset;
};
CardboardVRDisplay.prototype.getEyeParameters = function (whichEye) {
  var offset = this._getEyeOffset(whichEye);
  var fieldOfView = this._getFieldOfView(whichEye);
  var eyeParams = {
    offset: offset,
    renderWidth: this.deviceInfo_.device.width * 0.5 * this.bufferScale_,
    renderHeight: this.deviceInfo_.device.height * this.bufferScale_
  };
  Object.defineProperty(eyeParams, 'fieldOfView', {
    enumerable: true,
    get: function get() {
      deprecateWarning('VRFieldOfView', 'VRFrameData\'s projection matrices');
      return fieldOfView;
    }
  });
  return eyeParams;
};
CardboardVRDisplay.prototype.onDeviceParamsUpdated_ = function (newParams) {
  if (this.config.DEBUG) {
    console.log('DPDB reported that device params were updated.');
  }
  this.deviceInfo_.updateDeviceParams(newParams);
  if (this.distorter_) {
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }
};
CardboardVRDisplay.prototype.updateBounds_ = function () {
  if (this.layer_ && this.distorter_ && (this.layer_.leftBounds || this.layer_.rightBounds)) {
    this.distorter_.setTextureBounds(this.layer_.leftBounds, this.layer_.rightBounds);
  }
};
CardboardVRDisplay.prototype.beginPresent_ = function () {
  var gl = this.layer_.source.getContext('webgl');
  if (!gl) gl = this.layer_.source.getContext('experimental-webgl');
  if (!gl) gl = this.layer_.source.getContext('webgl2');
  if (!gl) return;
  if (this.layer_.predistorted) {
    if (!this.config.CARDBOARD_UI_DISABLED) {
      gl.canvas.width = getScreenWidth() * this.bufferScale_;
      gl.canvas.height = getScreenHeight() * this.bufferScale_;
      this.cardboardUI_ = new CardboardUI(gl);
    }
  } else {
    if (!this.config.CARDBOARD_UI_DISABLED) {
      this.cardboardUI_ = new CardboardUI(gl);
    }
    this.distorter_ = new CardboardDistorter(gl, this.cardboardUI_, this.config.BUFFER_SCALE, this.config.DIRTY_SUBMIT_FRAME_BINDINGS);
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }
  if (this.cardboardUI_) {
    this.cardboardUI_.listen(function (e) {
      this.viewerSelector_.show(this.layer_.source.parentElement);
      e.stopPropagation();
      e.preventDefault();
    }.bind(this), function (e) {
      this.exitPresent();
      e.stopPropagation();
      e.preventDefault();
    }.bind(this));
  }
  if (this.rotateInstructions_) {
    if (isLandscapeMode() && isMobile()) {
      this.rotateInstructions_.showTemporarily(3000, this.layer_.source.parentElement);
    } else {
      this.rotateInstructions_.update();
    }
  }
  this.orientationHandler = this.onOrientationChange_.bind(this);
  window.addEventListener('orientationchange', this.orientationHandler);
  this.vrdisplaypresentchangeHandler = this.updateBounds_.bind(this);
  window.addEventListener('vrdisplaypresentchange', this.vrdisplaypresentchangeHandler);
  this.fireVRDisplayDeviceParamsChange_();
};
CardboardVRDisplay.prototype.endPresent_ = function () {
  if (this.distorter_) {
    this.distorter_.destroy();
    this.distorter_ = null;
  }
  if (this.cardboardUI_) {
    this.cardboardUI_.destroy();
    this.cardboardUI_ = null;
  }
  if (this.rotateInstructions_) {
    this.rotateInstructions_.hide();
  }
  this.viewerSelector_.hide();
  window.removeEventListener('orientationchange', this.orientationHandler);
  window.removeEventListener('vrdisplaypresentchange', this.vrdisplaypresentchangeHandler);
};
CardboardVRDisplay.prototype.updatePresent_ = function () {
  this.endPresent_();
  this.beginPresent_();
};
CardboardVRDisplay.prototype.submitFrame = function (pose) {
  if (this.distorter_) {
    this.updateBounds_();
    this.distorter_.submitFrame();
  } else if (this.cardboardUI_ && this.layer_) {
    var gl = this.layer_.source.getContext('webgl');
    if (!gl) gl = this.layer_.source.getContext('experimental-webgl');
    if (!gl) gl = this.layer_.source.getContext('webgl2');
    var canvas = gl.canvas;
    if (canvas.width != this.lastWidth || canvas.height != this.lastHeight) {
      this.cardboardUI_.onResize();
    }
    this.lastWidth = canvas.width;
    this.lastHeight = canvas.height;
    this.cardboardUI_.render();
  }
};
CardboardVRDisplay.prototype.onOrientationChange_ = function (e) {
  this.viewerSelector_.hide();
  if (this.rotateInstructions_) {
    this.rotateInstructions_.update();
  }
  this.onResize_();
};
CardboardVRDisplay.prototype.onResize_ = function (e) {
  if (this.layer_) {
    var gl = this.layer_.source.getContext('webgl');
    if (!gl) gl = this.layer_.source.getContext('experimental-webgl');
    if (!gl) gl = this.layer_.source.getContext('webgl2');
    var cssProperties = ['position: absolute', 'top: 0', 'left: 0',
    'width: 100vw', 'height: 100vh', 'border: 0', 'margin: 0',
    'padding: 0px', 'box-sizing: content-box'];
    gl.canvas.setAttribute('style', cssProperties.join('; ') + ';');
    safariCssSizeWorkaround(gl.canvas);
  }
};
CardboardVRDisplay.prototype.onViewerChanged_ = function (viewer) {
  this.deviceInfo_.setViewer(viewer);
  if (this.distorter_) {
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }
  this.fireVRDisplayDeviceParamsChange_();
};
CardboardVRDisplay.prototype.fireVRDisplayDeviceParamsChange_ = function () {
  var event = new CustomEvent('vrdisplaydeviceparamschange', {
    detail: {
      vrdisplay: this,
      deviceInfo: this.deviceInfo_
    }
  });
  window.dispatchEvent(event);
};
CardboardVRDisplay.VRFrameData = VRFrameData;
CardboardVRDisplay.VRDisplay = VRDisplay;
return CardboardVRDisplay;
})));
});
var CardboardVRDisplay = unwrapExports(cardboardVrDisplay);

var version = "0.10.12";

var DefaultConfig = {
  ADDITIONAL_VIEWERS: [],
  DEFAULT_VIEWER: '',
  PROVIDE_MOBILE_VRDISPLAY: true,
  MOBILE_WAKE_LOCK: true,
  DEBUG: false,
  DPDB_URL: 'https://dpdb.webvr.rocks/dpdb.json',
  K_FILTER: 0.98,
  PREDICTION_TIME_S: 0.040,
  CARDBOARD_UI_DISABLED: false,
  ROTATE_INSTRUCTIONS_DISABLED: false,
  YAW_ONLY: false,
  BUFFER_SCALE: 0.5,
  DIRTY_SUBMIT_FRAME_BINDINGS: false
};

function WebVRPolyfill(config) {
  this.config = extend(extend({}, DefaultConfig), config);
  this.polyfillDisplays = [];
  this.enabled = false;
  this.hasNative = 'getVRDisplays' in navigator;
  this.native = {};
  this.native.getVRDisplays = navigator.getVRDisplays;
  this.native.VRFrameData = window.VRFrameData;
  this.native.VRDisplay = window.VRDisplay;
  if (!this.hasNative || this.config.PROVIDE_MOBILE_VRDISPLAY && isMobile()) {
    this.enable();
    this.getVRDisplays().then(function (displays) {
      if (displays && displays[0] && displays[0].fireVRDisplayConnect_) {
        displays[0].fireVRDisplayConnect_();
      }
    });
  }
}
WebVRPolyfill.prototype.getPolyfillDisplays = function () {
  if (this._polyfillDisplaysPopulated) {
    return this.polyfillDisplays;
  }
  if (isMobile()) {
    var vrDisplay = new CardboardVRDisplay({
      ADDITIONAL_VIEWERS: this.config.ADDITIONAL_VIEWERS,
      DEFAULT_VIEWER: this.config.DEFAULT_VIEWER,
      MOBILE_WAKE_LOCK: this.config.MOBILE_WAKE_LOCK,
      DEBUG: this.config.DEBUG,
      DPDB_URL: this.config.DPDB_URL,
      CARDBOARD_UI_DISABLED: this.config.CARDBOARD_UI_DISABLED,
      K_FILTER: this.config.K_FILTER,
      PREDICTION_TIME_S: this.config.PREDICTION_TIME_S,
      ROTATE_INSTRUCTIONS_DISABLED: this.config.ROTATE_INSTRUCTIONS_DISABLED,
      YAW_ONLY: this.config.YAW_ONLY,
      BUFFER_SCALE: this.config.BUFFER_SCALE,
      DIRTY_SUBMIT_FRAME_BINDINGS: this.config.DIRTY_SUBMIT_FRAME_BINDINGS
    });
    this.polyfillDisplays.push(vrDisplay);
  }
  this._polyfillDisplaysPopulated = true;
  return this.polyfillDisplays;
};
WebVRPolyfill.prototype.enable = function () {
  this.enabled = true;
  if (this.hasNative && this.native.VRFrameData) {
    var NativeVRFrameData = this.native.VRFrameData;
    var nativeFrameData = new this.native.VRFrameData();
    var nativeGetFrameData = this.native.VRDisplay.prototype.getFrameData;
    window.VRDisplay.prototype.getFrameData = function (frameData) {
      if (frameData instanceof NativeVRFrameData) {
        nativeGetFrameData.call(this, frameData);
        return;
      }
      nativeGetFrameData.call(this, nativeFrameData);
      frameData.pose = nativeFrameData.pose;
      copyArray(nativeFrameData.leftProjectionMatrix, frameData.leftProjectionMatrix);
      copyArray(nativeFrameData.rightProjectionMatrix, frameData.rightProjectionMatrix);
      copyArray(nativeFrameData.leftViewMatrix, frameData.leftViewMatrix);
      copyArray(nativeFrameData.rightViewMatrix, frameData.rightViewMatrix);
    };
  }
  navigator.getVRDisplays = this.getVRDisplays.bind(this);
  window.VRDisplay = CardboardVRDisplay.VRDisplay;
  window.VRFrameData = CardboardVRDisplay.VRFrameData;
};
WebVRPolyfill.prototype.getVRDisplays = function () {
  var _this = this;
  var config = this.config;
  if (!this.hasNative) {
    return Promise.resolve(this.getPolyfillDisplays());
  }
  return this.native.getVRDisplays.call(navigator).then(function (nativeDisplays) {
    return nativeDisplays.length > 0 ? nativeDisplays : _this.getPolyfillDisplays();
  });
};
WebVRPolyfill.version = version;
WebVRPolyfill.VRFrameData = CardboardVRDisplay.VRFrameData;
WebVRPolyfill.VRDisplay = CardboardVRDisplay.VRDisplay;


var webvrPolyfill = Object.freeze({
	default: WebVRPolyfill
});

var require$$0 = ( webvrPolyfill && WebVRPolyfill ) || webvrPolyfill;

if (typeof commonjsGlobal !== 'undefined' && commonjsGlobal.window) {
  if (!commonjsGlobal.document) {
    commonjsGlobal.document = commonjsGlobal.window.document;
  }
  if (!commonjsGlobal.navigator) {
    commonjsGlobal.navigator = commonjsGlobal.window.navigator;
  }
}
var src = require$$0;

return src;

})));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var EventEmitter = _dereq_('eventemitter3');
var shaka = _dereq_('shaka-player');

var Types = _dereq_('../video-type');
var Util = _dereq_('../util');

var DEFAULT_BITS_PER_SECOND = 1000000;

/**
 * Supports regular video URLs (eg. mp4), as well as adaptive manifests like
 * DASH (.mpd) and soon HLS (.m3u8).
 *
 * Events:
 *   load(video): When the video is loaded.
 *   error(message): If an error occurs.
 *
 * To play/pause/seek/etc, please use the underlying video element.
 */
function AdaptivePlayer(params) {
  this.video = document.createElement('video');
  // Loop by default.
  if (params.loop === true) {
    this.video.setAttribute('loop', true);
  }

  if (params.volume !== undefined) {
    // XXX: .setAttribute('volume', params.volume) doesn't work for some reason.
    this.video.volume = params.volume;
  }

  // Not muted by default.
  if (params.muted === true) {
    this.video.muted = params.muted;
  }

  // For FF, make sure we enable preload.
  this.video.setAttribute('preload', 'auto');
  // Enable inline video playback in iOS 10+.
  this.video.setAttribute('playsinline', true);
  this.video.setAttribute('crossorigin', 'anonymous');
}
AdaptivePlayer.prototype = new EventEmitter();

AdaptivePlayer.prototype.load = function(url) {
  var self = this;
  // TODO(smus): Investigate whether or not differentiation is best done by
  // mimeType after all. Cursory research suggests that adaptive streaming
  // manifest mime types aren't properly supported.
  //
  // For now, make determination based on extension.
  var extension = Util.getExtension(url);
  switch (extension) {
    case 'm3u8': // HLS
      this.type = Types.HLS;
      if (Util.isSafari()) {
        this.loadVideo_(url).then(function() {
          self.emit('load', self.video, self.type);
        }).catch(this.onError_.bind(this));
      } else {
        self.onError_('HLS is only supported on Safari.');
      }
      break;
    case 'mpd': // MPEG-DASH
      this.type = Types.DASH;
      this.loadShakaVideo_(url).then(function() {
        console.log('The video has now been loaded!');
        self.emit('load', self.video, self.type);
      }).catch(this.onError_.bind(this));
      break;
    default: // A regular video, not an adaptive manifest.
      this.type = Types.VIDEO;
      this.loadVideo_(url).then(function() {
        self.emit('load', self.video, self.type);
      }).catch(this.onError_.bind(this));
      break;
  }
};

AdaptivePlayer.prototype.destroy = function() {
  this.video.pause();
  this.video.src = '';
  this.video = null;
};

/*** PRIVATE API ***/

AdaptivePlayer.prototype.onError_ = function(e) {
  console.error(e);
  this.emit('error', e);
};

AdaptivePlayer.prototype.loadVideo_ = function(url) {
  var self = this, video = self.video;
  return new Promise(function(resolve, reject) {
    video.src = url;
    video.addEventListener('canplaythrough', resolve);
    video.addEventListener('loadedmetadata', function() {
      self.emit('timeupdate', {
        currentTime: video.currentTime,
        duration: video.duration
      });
    });
    video.addEventListener('error', reject);
    video.load();
  });
};

AdaptivePlayer.prototype.initShaka_ = function() {
  this.player = new shaka.Player(this.video);

  this.player.configure({
    abr: { defaultBandwidthEstimate: DEFAULT_BITS_PER_SECOND }
  });

  // Listen for error events.
  this.player.addEventListener('error', this.onError_);
};

AdaptivePlayer.prototype.loadShakaVideo_ = function(url) {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    console.error('Shaka is not supported on this browser.');
    return;
  }

  this.initShaka_();
  return this.player.load(url);
};

module.exports = AdaptivePlayer;

},{"../util":21,"../video-type":22,"eventemitter3":3,"shaka-player":5}],10:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Eyes = {
  LEFT: 1,
  RIGHT: 2
};

module.exports = Eyes;

},{}],11:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var EventEmitter = _dereq_('eventemitter3');
var TWEEN = _dereq_('@tweenjs/tween.js');

var Util = _dereq_('../util');

// Constants for the focus/blur animation.
var NORMAL_SCALE = new THREE.Vector3(1, 1, 1);
var FOCUS_SCALE = new THREE.Vector3(1.2, 1.2, 1.2);
var FOCUS_DURATION = 200;

// Constants for the active/inactive animation.
var INACTIVE_COLOR = new THREE.Color(1, 1, 1);
var ACTIVE_COLOR = new THREE.Color(0.8, 0, 0);
var ACTIVE_DURATION = 100;

// Constants for opacity.
var MAX_INNER_OPACITY = 0.8;
var MAX_OUTER_OPACITY = 0.5;
var FADE_START_ANGLE_DEG = 35;
var FADE_END_ANGLE_DEG = 60;
/**
 * Responsible for rectangular hot spots that the user can interact with.
 *
 * Specific duties:
 *   Adding and removing hotspots.
 *   Rendering the hotspots (debug mode only).
 *   Notifying when hotspots are interacted with.
 *
 * Emits the following events:
 *   click (id): a hotspot is clicked.
 *   focus (id): a hotspot is focused.
 *   blur (id): a hotspot is no longer hovered over.
 */
function HotspotRenderer(worldRenderer) {
  this.worldRenderer = worldRenderer;
  this.scene = worldRenderer.scene;

  // Note: this event must be added to document.body and not to window for it to
  // work inside iOS iframes.
  var body = document.body;
  // Bind events for hotspot interaction.
  if (!Util.isMobile()) {
    // Only enable mouse events on desktop.
    body.addEventListener('mousedown', this.onMouseDown_.bind(this), false);
    body.addEventListener('mousemove', this.onMouseMove_.bind(this), false);
    body.addEventListener('mouseup', this.onMouseUp_.bind(this), false);
  }
  body.addEventListener('touchstart', this.onTouchStart_.bind(this), false);
  body.addEventListener('touchend', this.onTouchEnd_.bind(this), false);

  // Add a placeholder for hotspots.
  this.hotspotRoot = new THREE.Object3D();
  // Align the center with the center of the camera too.
  this.hotspotRoot.rotation.y = Math.PI / 2;
  this.scene.add(this.hotspotRoot);

  // All hotspot IDs.
  this.hotspots = {};

  // Currently selected hotspots.
  this.selectedHotspots = {};

  // Hotspots that the last touchstart / mousedown event happened for.
  this.downHotspots = {};

  // For raycasting. Initialize mouse to be off screen initially.
  this.pointer = new THREE.Vector2(1, 1);
  this.raycaster = new THREE.Raycaster();
}
HotspotRenderer.prototype = new EventEmitter();

/**
 * @param pitch {Number} The latitude of center, specified in degrees, between
 * -90 and 90, with 0 at the horizon.
 * @param yaw {Number} The longitude of center, specified in degrees, between
 * -180 and 180, with 0 at the image center.
 * @param radius {Number} The radius of the hotspot, specified in meters.
 * @param distance {Number} The distance of the hotspot from camera, specified
 * in meters.
 * @param hotspotId {String} The ID of the hotspot.
 */
HotspotRenderer.prototype.add = function(pitch, yaw, radius, distance, id) {
  // If a hotspot already exists with this ID, stop.
  if (this.hotspots[id]) {
    // TODO: Proper error reporting.
    console.error('Attempt to add hotspot with existing id %s.', id);
    return;
  }
  var hotspot = this.createHotspot_(radius, distance);
  hotspot.name = id;

  // Position the hotspot based on the pitch and yaw specified.
  var quat = new THREE.Quaternion();
  quat.setFromEuler(new THREE.Euler(THREE.Math.degToRad(pitch), THREE.Math.degToRad(yaw), 0, 'ZYX'));
  hotspot.position.applyQuaternion(quat);
  hotspot.lookAt(new THREE.Vector3());

  this.hotspotRoot.add(hotspot);
  this.hotspots[id] = hotspot;
}

/**
 * Removes a hotspot based on the ID.
 *
 * @param ID {String} Identifier of the hotspot to be removed.
 */
HotspotRenderer.prototype.remove = function(id) {
  // If there's no hotspot with this ID, fail.
  if (!this.hotspots[id]) {
    // TODO: Proper error reporting.
    console.error('Attempt to remove non-existing hotspot with id %s.', id);
    return;
  }
  // Remove the mesh from the scene.
  this.hotspotRoot.remove(this.hotspots[id]);

  // If this hotspot was selected, make sure it gets unselected.
  delete this.selectedHotspots[id];
  delete this.downHotspots[id];
  delete this.hotspots[id];
  this.emit('blur', id);
};

/**
 * Clears all hotspots from the pano. Often called when changing panos.
 */
HotspotRenderer.prototype.clearAll = function() {
  for (var id in this.hotspots) {
    this.remove(id);
  }
};

HotspotRenderer.prototype.getCount = function() {
  var count = 0;
  for (var id in this.hotspots) {
    count += 1;
  }
  return count;
};

HotspotRenderer.prototype.update = function(camera) {
  if (this.worldRenderer.isVRMode()) {
    this.pointer.set(0, 0);
  }
  // Update the picking ray with the camera and mouse position.
  this.raycaster.setFromCamera(this.pointer, camera);

  // Fade hotspots out if they are really far from center to avoid overly
  // distorted visuals.
  this.fadeOffCenterHotspots_(camera);

  var hotspots = this.hotspotRoot.children;

  // Go through all hotspots to see if they are currently selected.
  for (var i = 0; i < hotspots.length; i++) {
    var hotspot = hotspots[i];
    //hotspot.lookAt(camera.position);
    var id = hotspot.name;
    // Check if hotspot is intersected with the picking ray.
    var intersects = this.raycaster.intersectObjects(hotspot.children);
    var isIntersected = (intersects.length > 0);

    // If newly selected, emit a focus event.
    if (isIntersected && !this.selectedHotspots[id]) {
      this.emit('focus', id);
      this.focus_(id);
    }
    // If no longer selected, emit a blur event.
    if (!isIntersected && this.selectedHotspots[id]) {
      this.emit('blur', id);
      this.blur_(id);
    }
    // Update the set of selected hotspots.
    if (isIntersected) {
      this.selectedHotspots[id] = true;
    } else {
      delete this.selectedHotspots[id];
    }
  }
};

/**
 * Toggle whether or not hotspots are visible.
 */
HotspotRenderer.prototype.setVisibility = function(isVisible) {
  this.hotspotRoot.visible = isVisible;
};

HotspotRenderer.prototype.onTouchStart_ = function(e) {
  // In VR mode, don't touch the pointer position.
  if (!this.worldRenderer.isVRMode()) {
    this.updateTouch_(e);
  }

  // Force a camera update to see if any hotspots were selected.
  this.update(this.worldRenderer.camera);

  this.downHotspots = {};
  for (var id in this.selectedHotspots) {
    this.downHotspots[id] = true;
    this.down_(id);
  }
  return false;
};

HotspotRenderer.prototype.onTouchEnd_ = function(e) {
  // If no hotspots are pressed, emit an empty click event.
  if (Util.isEmptyObject(this.downHotspots)) {
    this.emit('click');
    return;
  }

  // Only emit a click if the finger was down on the same hotspot before.
  for (var id in this.downHotspots) {
    this.emit('click', id);
    this.up_(id);
    e.preventDefault();
  }
};

HotspotRenderer.prototype.updateTouch_ = function(e) {
  var size = this.getSize_();
  var touch = e.touches[0];
	this.pointer.x = (touch.clientX / size.width) * 2 - 1;
	this.pointer.y = - (touch.clientY / size.height) * 2 + 1;
};

HotspotRenderer.prototype.onMouseDown_ = function(e) {
  this.updateMouse_(e);

  this.downHotspots = {};
  for (var id in this.selectedHotspots) {
    this.downHotspots[id] = true;
    this.down_(id);
  }
};

HotspotRenderer.prototype.onMouseMove_ = function(e) {
  this.updateMouse_(e);
};

HotspotRenderer.prototype.onMouseUp_ = function(e) {
  this.updateMouse_(e);

  // If no hotspots are pressed, emit an empty click event.
  if (Util.isEmptyObject(this.downHotspots)) {
    this.emit('click');
    return;
  }

  // Only emit a click if the mouse was down on the same hotspot before.
  for (var id in this.selectedHotspots) {
    if (id in this.downHotspots) {
      this.emit('click', id);
      this.up_(id);
    }
  }
};

HotspotRenderer.prototype.updateMouse_ = function(e) {
  var size = this.getSize_();
	this.pointer.x = (e.clientX / size.width) * 2 - 1;
	this.pointer.y = - (e.clientY / size.height) * 2 + 1;
};

HotspotRenderer.prototype.getSize_ = function() {
  var canvas = this.worldRenderer.renderer.domElement;
  return this.worldRenderer.renderer.getSize();
};

HotspotRenderer.prototype.createHotspot_ = function(radius, distance) {
  var innerGeometry = new THREE.CircleGeometry(radius, 32);

  var innerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, side: THREE.DoubleSide, transparent: true,
    opacity: MAX_INNER_OPACITY, depthTest: false
  });

  var inner = new THREE.Mesh(innerGeometry, innerMaterial);
  inner.name = 'inner';

  var outerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, side: THREE.DoubleSide, transparent: true,
    opacity: MAX_OUTER_OPACITY, depthTest: false
  });
  var outerGeometry = new THREE.RingGeometry(radius * 0.85, radius, 32);
  var outer = new THREE.Mesh(outerGeometry, outerMaterial);
  outer.name = 'outer';

  // Position at the extreme end of the sphere.
  var hotspot = new THREE.Object3D();
  hotspot.position.z = -distance;
  hotspot.scale.copy(NORMAL_SCALE);

  hotspot.add(inner);
  hotspot.add(outer);

  return hotspot;
};

/**
 * Large aspect ratios tend to cause visually jarring distortions on the sides.
 * Here we fade hotspots out to avoid them.
 */
HotspotRenderer.prototype.fadeOffCenterHotspots_ = function(camera) {
  var lookAt = new THREE.Vector3(1, 0, 0);
  lookAt.applyQuaternion(camera.quaternion);
  // Take into account the camera parent too.
  lookAt.applyQuaternion(camera.parent.quaternion);

  // Go through each hotspot. Calculate how far off center it is.
  for (var id in this.hotspots) {
    var hotspot = this.hotspots[id];
    var angle = hotspot.position.angleTo(lookAt);
    var angleDeg = THREE.Math.radToDeg(angle);
    var isVisible = angleDeg < 45;
    var opacity;
    if (angleDeg < FADE_START_ANGLE_DEG) {
      opacity = 1;
    } else if (angleDeg > FADE_END_ANGLE_DEG) {
      opacity = 0;
    } else {
      // We are in the case START < angle < END. Linearly interpolate.
      var range = FADE_END_ANGLE_DEG - FADE_START_ANGLE_DEG;
      var value = FADE_END_ANGLE_DEG - angleDeg;
      opacity = value / range;
    }

    // Opacity a function of angle. If angle is large, opacity is zero. At some
    // point, ramp opacity down.
    this.setOpacity_(id, opacity);
  }
};

HotspotRenderer.prototype.focus_ = function(id) {
  var hotspot = this.hotspots[id];

  // Tween scale of hotspot.
  this.tween = new TWEEN.Tween(hotspot.scale).to(FOCUS_SCALE, FOCUS_DURATION)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  
  if (this.worldRenderer.isVRMode()) {
    this.timeForHospotClick = setTimeout(function () {
      this.emit('click', id);
    }, 1200 )
  }
};

HotspotRenderer.prototype.blur_ = function(id) {
  var hotspot = this.hotspots[id];

  this.tween = new TWEEN.Tween(hotspot.scale).to(NORMAL_SCALE, FOCUS_DURATION)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  
  if (this.timeForHospotClick) {
    clearTimeout( this.timeForHospotClick );
  }
};

HotspotRenderer.prototype.down_ = function(id) {
  // Become active.
  var hotspot = this.hotspots[id];
  var outer = hotspot.getObjectByName('inner');

  this.tween = new TWEEN.Tween(outer.material.color).to(ACTIVE_COLOR, ACTIVE_DURATION)
      .start();
};

HotspotRenderer.prototype.up_ = function(id) {
  // Become inactive.
  var hotspot = this.hotspots[id];
  var outer = hotspot.getObjectByName('inner');

  this.tween = new TWEEN.Tween(outer.material.color).to(INACTIVE_COLOR, ACTIVE_DURATION)
      .start();
};

HotspotRenderer.prototype.setOpacity_ = function(id, opacity) {
  var hotspot = this.hotspots[id];
  var outer = hotspot.getObjectByName('outer');
  var inner = hotspot.getObjectByName('inner');

  outer.material.opacity = opacity * MAX_OUTER_OPACITY;
  inner.material.opacity = opacity * MAX_INNER_OPACITY;
};

module.exports = HotspotRenderer;

},{"../util":21,"@tweenjs/tween.js":1,"eventemitter3":3}],12:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var EventEmitter = _dereq_('eventemitter3');
var Message = _dereq_('../message');
var Util = _dereq_('../util');


/**
 * Sits in an embedded iframe, receiving messages from a containing
 * iFrame. This facilitates an API which provides the following features:
 *
 *    Playing and pausing content.
 *    Adding hotspots.
 *    Sending messages back to the containing iframe when hotspot is clicked
 *    Sending analytics events to containing iframe.
 *
 * Note: this script used to also respond to synthetic devicemotion events, but
 * no longer does so. This is because as of iOS 9.2, Safari disallows listening
 * for devicemotion events within cross-device iframes. To work around this, the
 * webvr-polyfill responds to the postMessage event containing devicemotion
 * information (sent by the iframe-message-sender in the VR View API).
 */
function IFrameMessageReceiver() {
  window.addEventListener('message', this.onMessage_.bind(this), false);
}
IFrameMessageReceiver.prototype = new EventEmitter();

IFrameMessageReceiver.prototype.onMessage_ = function(event) {
  if (Util.isDebug()) {
    console.log('onMessage_', event);
  }

  var message = event.data;
  var type = message.type.toLowerCase();
  var data = message.data;

  switch (type) {
    case Message.SET_CONTENT:
    case Message.SET_VOLUME:
    case Message.MUTED:
    case Message.ADD_HOTSPOT:
    case Message.PLAY:
    case Message.PAUSE:
    case Message.SET_CURRENT_TIME:
    case Message.GET_POSITION:
    case Message.SET_FULLSCREEN:
      this.emit(type, data);
      break;
    default:
      if (Util.isDebug()) {
        console.warn('Got unknown message of type %s from %s', message.type, message.origin);
      }
  }
};

module.exports = IFrameMessageReceiver;

},{"../message":20,"../util":21,"eventemitter3":3}],13:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Shows a 2D loading indicator while various pieces of EmbedVR load.
 */
function LoadingIndicator() {
  this.el = this.build_();
  document.body.appendChild(this.el);
  this.show();
}

LoadingIndicator.prototype.build_ = function() {
  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.top = 0;
  s.left = 0;
  s.width = '100%';
  s.height = '100%';
  s.background = '#eee';
  var img = document.createElement('img');
  img.src = 'images/loading.gif';
  var s = img.style;
  s.position = 'absolute';
  s.top = '50%';
  s.left = '50%';
  s.transform = 'translate(-50%, -50%)';

  overlay.appendChild(img);
  return overlay;
};

LoadingIndicator.prototype.hide = function() {
  this.el.style.display = 'none';
};

LoadingIndicator.prototype.show = function() {
  this.el.style.display = 'block';
};

module.exports = LoadingIndicator;

},{}],14:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Initialize the loading indicator as quickly as possible to give the user
// immediate feedback.
var LoadingIndicator = _dereq_('./loading-indicator');
var loadIndicator = new LoadingIndicator();

var ES6Promise = _dereq_('es6-promise');
// Polyfill ES6 promises for IE.
ES6Promise.polyfill();

var IFrameMessageReceiver = _dereq_('./iframe-message-receiver');
var Message = _dereq_('../message');
var SceneInfo = _dereq_('./scene-info');
var Stats = _dereq_('../../node_modules/stats-js/build/stats.min');
var Util = _dereq_('../util');
var WebVRPolyfill = _dereq_('webvr-polyfill');
var WorldRenderer = _dereq_('./world-renderer');

var receiver = new IFrameMessageReceiver();
receiver.on(Message.PLAY, onPlayRequest);
receiver.on(Message.PAUSE, onPauseRequest);
receiver.on(Message.ADD_HOTSPOT, onAddHotspot);
receiver.on(Message.SET_CONTENT, onSetContent);
receiver.on(Message.SET_VOLUME, onSetVolume);
receiver.on(Message.MUTED, onMuted);
receiver.on(Message.SET_CURRENT_TIME, onUpdateCurrentTime);
receiver.on(Message.GET_POSITION, onGetPosition);
receiver.on(Message.SET_FULLSCREEN, onSetFullscreen);

window.addEventListener('load', onLoad);

var stats = new Stats();
var scene = SceneInfo.loadFromGetParams();

var worldRenderer = new WorldRenderer(scene);
worldRenderer.on('error', onRenderError);
worldRenderer.on('load', onRenderLoad);
worldRenderer.on('modechange', onModeChange);
worldRenderer.on('ended', onEnded);
worldRenderer.on('play', onPlay);
worldRenderer.hotspotRenderer.on('click', onHotspotClick);

window.worldRenderer = worldRenderer;

var isReadySent = false;
var volume = 0;

function onLoad() {
  if (!Util.isWebGLEnabled()) {
    showError('WebGL not supported.');
    return;
  }

  // Load the scene.
  worldRenderer.setScene(scene);

  if (scene.isDebug) {
    // Show stats.
    showStats();
  }

  if (scene.isYawOnly) {
    WebVRConfig = window.WebVRConfig || {};
    WebVRConfig.YAW_ONLY = true;
  }

  requestAnimationFrame(loop);
}


function onVideoTap() {
  worldRenderer.videoProxy.play();
  hidePlayButton();

  // Prevent multiple play() calls on the video element.
  document.body.removeEventListener('touchend', onVideoTap);
}

function onRenderLoad(event) {
  if (event.videoElement) {

    var scene = SceneInfo.loadFromGetParams();

    // On mobile, tell the user they need to tap to start. Otherwise, autoplay.
    if (Util.isMobile()) {
      // Tell user to tap to start.
      showPlayButton();
      document.body.addEventListener('touchend', onVideoTap);
    } else {
      event.videoElement.play();
    }

    // Attach to pause and play events, to notify the API.
    event.videoElement.addEventListener('pause', onPause);
    event.videoElement.addEventListener('play', onPlay);
    event.videoElement.addEventListener('timeupdate', onGetCurrentTime);
    event.videoElement.addEventListener('ended', onEnded);
  }
  // Hide loading indicator.
  loadIndicator.hide();

  // Autopan only on desktop, for photos only, and only if autopan is enabled.
  if (!Util.isMobile() && !worldRenderer.sceneInfo.video && !worldRenderer.sceneInfo.isAutopanOff) {
    worldRenderer.autopan();
  }

  // Notify the API that we are ready, but only do this once.
  if (!isReadySent) {
    if (event.videoElement) {
      Util.sendParentMessage({
        type: 'ready',
        data: {
          duration: event.videoElement.duration
        }
      });
    } else {
      Util.sendParentMessage({
        type: 'ready'
      });
    }

    isReadySent = true;
  }
}

function onPlayRequest() {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to pause, but no video found.');
    return;
  }
  worldRenderer.videoProxy.play();
}

function onPauseRequest() {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to pause, but no video found.');
    return;
  }
  worldRenderer.videoProxy.pause();
}

function onAddHotspot(e) {
  if (Util.isDebug()) {
    console.log('onAddHotspot', e);
  }
  // TODO: Implement some validation?

  var pitch = parseFloat(e.pitch);
  var yaw = parseFloat(e.yaw);
  var radius = parseFloat(e.radius);
  var distance = parseFloat(e.distance);
  var id = e.id;
  worldRenderer.hotspotRenderer.add(pitch, yaw, radius, distance, id);
}

function onSetContent(e) {
  if (Util.isDebug()) {
    console.log('onSetContent', e);
  }
  // Remove all of the hotspots.
  worldRenderer.hotspotRenderer.clearAll();
  // Fade to black.
  worldRenderer.sphereRenderer.setOpacity(0, 500).then(function() {
    // Then load the new scene.
    var scene = SceneInfo.loadFromAPIParams(e.contentInfo);
    worldRenderer.destroy();

    // Update the URL to reflect the new scene. This is important particularily
    // on iOS where we use a fake fullscreen mode.
    var url = scene.getCurrentUrl();
    //console.log('Updating url to be %s', url);
    window.history.pushState(null, 'VR View', url);

    // And set the new scene.
    return worldRenderer.setScene(scene);
  }).then(function() {
    // Then fade the scene back in.
    worldRenderer.sphereRenderer.setOpacity(1, 500);
  });
}

function onSetVolume(e) {
  // Only work for video. If there's no video, send back an error.
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to set volume, but no video found.');
    return;
  }

  worldRenderer.videoProxy.setVolume(e.volumeLevel);
  volume = e.volumeLevel;
  Util.sendParentMessage({
    type: 'volumechange',
    data: e.volumeLevel
  });
}

function onMuted(e) {
  // Only work for video. If there's no video, send back an error.
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to mute, but no video found.');
    return;
  }

  worldRenderer.videoProxy.mute(e.muteState);

  Util.sendParentMessage({
    type: 'muted',
    data: e.muteState
  });
}

function onUpdateCurrentTime(time) {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to pause, but no video found.');
    return;
  }

  worldRenderer.videoProxy.setCurrentTime(time);
  onGetCurrentTime();
}

function onGetCurrentTime() {
  var time = worldRenderer.videoProxy.getCurrentTime();
  Util.sendParentMessage({
    type: 'timeupdate',
    data: time
  });
}

function onSetFullscreen() {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to set fullscreen, but no video found.');
    return;
  }
  worldRenderer.manager.onFSClick_();
}

function onApiError(message) {
  console.error(message);
  Util.sendParentMessage({
    type: 'error',
    data: {message: message}
  });
}

function onModeChange(mode) {
  Util.sendParentMessage({
    type: 'modechange',
    data: {mode: mode}
  });
}

function onHotspotClick(id) {
  Util.sendParentMessage({
    type: 'click',
    data: {id: id}
  });
}

function onPlay() {
  Util.sendParentMessage({
    type: 'paused',
    data: false
  });
}

function onPause() {
  Util.sendParentMessage({
    type: 'paused',
    data: true
  });
}

function onEnded() {
    Util.sendParentMessage({
      type: 'ended',
      data: true
    });
}

function onSceneError(message) {
  showError('Loader: ' + message);
}

function onRenderError(message) {
  showError('Render: ' + message);
}

function showError(message) {
  // Hide loading indicator.
  loadIndicator.hide();

  // Sanitize `message` as it could contain user supplied
  // values. Re-add the space character as to not modify the
  // error messages used throughout the codebase.
  message = encodeURI(message).replace(/%20/g, ' ');

  var error = document.querySelector('#error');
  error.classList.add('visible');
  error.querySelector('.message').innerHTML = message;

  error.querySelector('.title').innerHTML = 'Error';
}

function hideError() {
  var error = document.querySelector('#error');
  error.classList.remove('visible');
}

function showPlayButton() {
  var playButton = document.querySelector('#play-overlay');
  playButton.classList.add('visible');
}

function hidePlayButton() {
  var playButton = document.querySelector('#play-overlay');
  playButton.classList.remove('visible');
}

function showStats() {
  stats.setMode(0); // 0: fps, 1: ms

  // Align bottom-left.
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.bottom = '0px';
  document.body.appendChild(stats.domElement);
}

function loop(time) {
  // Use the VRDisplay RAF if it is present.
  if (worldRenderer.vrDisplay) {
    worldRenderer.vrDisplay.requestAnimationFrame(loop);
  } else {
    requestAnimationFrame(loop);
  }

  stats.begin();
  // Update the video if needed.
  if (worldRenderer.videoProxy) {
    worldRenderer.videoProxy.update(time);
  }
  worldRenderer.render(time);
  worldRenderer.submitFrame();
  stats.end();
}
function onGetPosition() {
    Util.sendParentMessage({
        type: 'getposition',
        data: {
            Yaw: worldRenderer.camera.rotation.y * 180 / Math.PI,
            Pitch: worldRenderer.camera.rotation.x * 180 / Math.PI
        }
    });
}

},{"../../node_modules/stats-js/build/stats.min":6,"../message":20,"../util":21,"./iframe-message-receiver":12,"./loading-indicator":13,"./scene-info":16,"./world-renderer":19,"es6-promise":2,"webvr-polyfill":8}],15:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function ReticleRenderer(camera) {
  this.camera = camera;

  this.reticle = this.createReticle_();
  // In front of the hotspot itself, which is at r=0.99.
  this.reticle.position.z = -0.97;
  camera.add(this.reticle);

  this.setVisibility(false);
}

ReticleRenderer.prototype.setVisibility = function(isVisible) {
  // TODO: Tween the transition.
  this.reticle.visible = isVisible;
};

ReticleRenderer.prototype.createReticle_ = function() {
  // Make a torus.
  var geometry = new THREE.TorusGeometry(0.02, 0.005, 10, 20);
  var material = new THREE.MeshBasicMaterial({color: 0x000000});
  var torus = new THREE.Mesh(geometry, material);

  return torus;
};

module.exports = ReticleRenderer;

},{}],16:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('../util');

var CAMEL_TO_UNDERSCORE = {
  video: 'video',
  image: 'image',
  preview: 'preview',
  loop: 'loop',
  volume: 'volume',
  muted: 'muted',
  isStereo: 'is_stereo',
  defaultYaw: 'default_yaw',
  isYawOnly: 'is_yaw_only',
  isDebug: 'is_debug',
  isVROff: 'is_vr_off',
  isAutopanOff: 'is_autopan_off',
  hideFullscreenButton: 'hide_fullscreen_button'
};

/**
 * Contains all information about a given scene.
 */
function SceneInfo(opt_params) {
  var params = opt_params || {};
  params.player = {
    loop: opt_params.loop,
    volume: opt_params.volume,
    muted: opt_params.muted
  };

  this.image = params.image !== undefined ? encodeURI(params.image) : undefined;
  this.preview = params.preview !== undefined ? encodeURI(params.preview) : undefined;
  this.video = params.video !== undefined ? encodeURI(params.video) : undefined;
  this.defaultYaw = THREE.Math.degToRad(params.defaultYaw || 0);

  this.isStereo = Util.parseBoolean(params.isStereo);
  this.isYawOnly = Util.parseBoolean(params.isYawOnly);
  this.isDebug = Util.parseBoolean(params.isDebug);
  this.isVROff = Util.parseBoolean(params.isVROff);
  this.isAutopanOff = Util.parseBoolean(params.isAutopanOff);
  this.loop = Util.parseBoolean(params.player.loop);
  this.volume = parseFloat(
      params.player.volume ? params.player.volume : '1');
  this.muted = Util.parseBoolean(params.player.muted);
  this.hideFullscreenButton = Util.parseBoolean(params.hideFullscreenButton);
}

SceneInfo.loadFromGetParams = function() {
  var params = {};
  for (var camelCase in CAMEL_TO_UNDERSCORE) {
    var underscore = CAMEL_TO_UNDERSCORE[camelCase];
    params[camelCase] = Util.getQueryParameter(underscore)
                        || ((window.WebVRConfig && window.WebVRConfig.PLAYER) ? window.WebVRConfig.PLAYER[underscore] : "");
  }
  var scene = new SceneInfo(params);
  if (!scene.isValid()) {
    console.warn('Invalid scene: %s', scene.errorMessage);
  }
  return scene;
};

SceneInfo.loadFromAPIParams = function(underscoreParams) {
  var params = {};
  for (var camelCase in CAMEL_TO_UNDERSCORE) {
    var underscore = CAMEL_TO_UNDERSCORE[camelCase];
    if (underscoreParams[underscore]) {
      params[camelCase] = underscoreParams[underscore];
    }
  }
  var scene = new SceneInfo(params);
  if (!scene.isValid()) {
    console.warn('Invalid scene: %s', scene.errorMessage);
  }
  return scene;
};

SceneInfo.prototype.isValid = function() {
  // Either it's an image or a video.
  if (!this.image && !this.video) {
    this.errorMessage = 'Either image or video URL must be specified.';
    return false;
  }
  if (this.image && !this.isValidImage_(this.image)) {
    this.errorMessage = 'Invalid image URL: ' + this.image;
    return false;
  }
  this.errorMessage = null;
  return true;
};

/**
 * Generates a URL to reflect this scene.
 */
SceneInfo.prototype.getCurrentUrl = function() {
  var url = location.protocol + '//' + location.host + location.pathname + '?';
  for (var camelCase in CAMEL_TO_UNDERSCORE) {
    var underscore = CAMEL_TO_UNDERSCORE[camelCase];
    var value = this[camelCase];
    if (value !== undefined) {
      url += underscore + '=' + value + '&';
    }
  }
  // Chop off the trailing ampersand.
  return url.substring(0, url.length - 1);
};

SceneInfo.prototype.isValidImage_ = function(imageUrl) {
  return true;
};

module.exports = SceneInfo;

},{"../util":21}],17:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Eyes = _dereq_('./eyes');
var TWEEN = _dereq_('@tweenjs/tween.js');
var Util = _dereq_('../util');
var VideoType = _dereq_('../video-type');

function SphereRenderer(scene) {
  this.scene = scene;

  // Create a transparent mask.
  this.createOpacityMask_();
}

/**
 * Sets the photosphere based on the image in the source. Supports stereo and
 * mono photospheres.
 *
 * @return {Promise}
 */
SphereRenderer.prototype.setPhotosphere = function(src, opt_params) {
  return new Promise(function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;

    var params = opt_params || {};

    this.isStereo = !!params.isStereo;
    this.src = src;

    // Load texture.
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(src, this.onTextureLoaded_.bind(this), undefined,
                this.onTextureError_.bind(this));
  }.bind(this));
};

/**
 * @return {Promise} Yeah.
 */
SphereRenderer.prototype.set360Video = function (videoElement, videoType, opt_params) {
  return new Promise(function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;

    var params = opt_params || {};

    this.isStereo = !!params.isStereo;

    // Load the video texture.
    var videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    if (Util.isSafari() && videoType === VideoType.HLS) {
      // fix black screen issue on safari
      videoTexture.format = THREE.RGBAFormat;
      videoTexture.flipY = false;
    } else {
      videoTexture.format = THREE.RGBFormat;
    }

    videoTexture.needsUpdate = true;

    this.onTextureLoaded_(videoTexture);
  }.bind(this));
};

/**
 * Set the opacity of the panorama.
 *
 * @param {Number} opacity How opaque we want the panorama to be. 0 means black,
 * 1 means full color.
 * @param {Number} duration Number of milliseconds the transition should take.
 *
 * @return {Promise} When the opacity change is complete.
 */
SphereRenderer.prototype.setOpacity = function(opacity, duration) {
  var scene = this.scene;
  // If we want the opacity
  var overlayOpacity = 1 - opacity;
  return new Promise(function(resolve, reject) {
    var mask = scene.getObjectByName('opacityMask');
    var tween = new TWEEN.Tween({opacity: mask.material.opacity})
        .to({opacity: overlayOpacity}, duration)
        .easing(TWEEN.Easing.Quadratic.InOut);
    tween.onUpdate(function(e) {
      mask.material.opacity = this.opacity;
    });
    tween.onComplete(resolve).start();
  });
};

SphereRenderer.prototype.onTextureLoaded_ = function(texture) {
  var sphereLeft;
  var sphereRight;
  if (this.isStereo) {
    sphereLeft = this.createPhotosphere_(texture, {offsetY: 0.5, scaleY: 0.5});
    sphereRight = this.createPhotosphere_(texture, {offsetY: 0, scaleY: 0.5});
  } else {
    sphereLeft = this.createPhotosphere_(texture);
    sphereRight = this.createPhotosphere_(texture);
  }

  // Display in left and right eye respectively.
  sphereLeft.layers.set(Eyes.LEFT);
  sphereLeft.eye = Eyes.LEFT;
  sphereLeft.name = 'eyeLeft';
  sphereRight.layers.set(Eyes.RIGHT);
  sphereRight.eye = Eyes.RIGHT;
  sphereRight.name = 'eyeRight';


    this.scene.getObjectByName('photo').children = [sphereLeft, sphereRight];

  this.resolve();
};

SphereRenderer.prototype.onTextureError_ = function(error) {
  this.reject('Unable to load texture from "' + this.src + '"');
};


SphereRenderer.prototype.createPhotosphere_ = function(texture, opt_params) {
  var p = opt_params || {};
  p.scaleX = p.scaleX || 1;
  p.scaleY = p.scaleY || 1;
  p.offsetX = p.offsetX || 0;
  p.offsetY = p.offsetY || 0;
  p.phiStart = p.phiStart || 0;
  p.phiLength = p.phiLength || Math.PI * 2;
  p.thetaStart = p.thetaStart || 0;
  p.thetaLength = p.thetaLength || Math.PI;

  var geometry = new THREE.SphereGeometry(1, 48, 48,
      p.phiStart, p.phiLength, p.thetaStart, p.thetaLength);
  geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
  var uvs = geometry.faceVertexUvs[0];
  for (var i = 0; i < uvs.length; i ++) {
    for (var j = 0; j < 3; j ++) {
      uvs[i][j].x *= p.scaleX;
      uvs[i][j].x += p.offsetX;
      uvs[i][j].y *= p.scaleY;
      uvs[i][j].y += p.offsetY;
    }
  }

  var material;
  if (texture.format === THREE.RGBAFormat && texture.flipY === false) {
    material = new THREE.ShaderMaterial({
      uniforms: {
        texture: { value: texture }
      },
      vertexShader: [
        "varying vec2 vUV;",
        "void main() {",
        "	vUV = vec2( uv.x, 1.0 - uv.y );",
        "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D texture;",
        "varying vec2 vUV;",
        "void main() {",
        " gl_FragColor = texture2D( texture, vUV  )" + (Util.isIOS() ? ".bgra" : "") + ";",
        "}"
      ].join("\n")
    });
  } else {
    material = new THREE.MeshBasicMaterial({ map: texture });
  }
  var out = new THREE.Mesh(geometry, material);
  //out.visible = false;
  out.renderOrder = -1;
  return out;
};

SphereRenderer.prototype.createOpacityMask_ = function() {
  var geometry = new THREE.SphereGeometry(0.49, 48, 48);
  var material = new THREE.MeshBasicMaterial({
    color: 0x000000, side: THREE.DoubleSide, opacity: 0, transparent: true});
  var opacityMask = new THREE.Mesh(geometry, material);
  opacityMask.name = 'opacityMask';
  opacityMask.renderOrder = 1;

  this.scene.add(opacityMask);
  return opacityMask;
};

module.exports = SphereRenderer;

},{"../util":21,"../video-type":22,"./eyes":10,"@tweenjs/tween.js":1}],18:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('../util');

/**
 * A proxy class for working around the fact that as soon as a video is play()ed
 * on iOS, Safari auto-fullscreens the video.
 *
 * TODO(smus): The entire raison d'etre for this class is to work around this
 * issue. Once Safari implements some way to suppress this fullscreen player, we
 * can remove this code.
 */
function VideoProxy(videoElement) {
  this.videoElement = videoElement;
  // True if we're currently manually advancing the playhead (only on iOS).
  this.isFakePlayback = false;

  // When the video started playing.
  this.startTime = null;
}

VideoProxy.prototype.play = function() {
  if (Util.isIOS9OrLess()) {
    this.startTime = performance.now();
    this.isFakePlayback = true;

    // Make an audio element to playback just the audio part.
    this.audioElement = new Audio();
    this.audioElement.src = this.videoElement.src;
    this.audioElement.play();
  } else {
    this.videoElement.play().then(function(e) {
      console.log('Playing video.', e);
    });
  }
};

VideoProxy.prototype.pause = function() {
  if (Util.isIOS9OrLess() && this.isFakePlayback) {
    this.isFakePlayback = true;

    this.audioElement.pause();
  } else {
    this.videoElement.pause();
  }
};

VideoProxy.prototype.setVolume = function(volumeLevel) {
  if (this.videoElement) {
    // On iOS 10, the VideoElement.volume property is read-only. So we special
    // case muting and unmuting.
    if (Util.isIOS()) {
      this.videoElement.muted = (volumeLevel === 0);
    } else {
      this.videoElement.volume = volumeLevel;
    }
  }
  if (this.audioElement) {
    this.audioElement.volume = volumeLevel;
  }
};

/**
 * Set the attribute mute of the elements according with the muteState param.
 *
 * @param bool muteState
 */
VideoProxy.prototype.mute = function(muteState) {
  if (this.videoElement) {
    this.videoElement.muted = muteState;
  }
  if (this.audioElement) {
    this.audioElement.muted = muteState;
  }
};

VideoProxy.prototype.getCurrentTime = function() {
  return Util.isIOS9OrLess() ? this.audioElement.currentTime : this.videoElement.currentTime;
};

/**
 *
 * @param {Object} time
 */
VideoProxy.prototype.setCurrentTime = function(time) {
  if (this.videoElement) {
    this.videoElement.currentTime = time.currentTime;
  }
  if (this.audioElement) {
    this.audioElement.currentTime = time.currentTime;
  }
};

/**
 * Called on RAF to progress playback.
 */
VideoProxy.prototype.update = function() {
  // Fakes playback for iOS only.
  if (!this.isFakePlayback) {
    return;
  }
  var duration = this.videoElement.duration;
  var now = performance.now();
  var delta = now - this.startTime;
  var deltaS = delta / 1000;
  this.videoElement.currentTime = deltaS;

  // Loop through the video
  if (deltaS > duration) {
    this.startTime = now;
    this.videoElement.currentTime = 0;
    // Also restart the audio.
    this.audioElement.currentTime = 0;
  }
};

module.exports = VideoProxy;

},{"../util":21}],19:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var AdaptivePlayer = _dereq_('./adaptive-player');
var EventEmitter = _dereq_('eventemitter3');
var Eyes = _dereq_('./eyes');
var HotspotRenderer = _dereq_('./hotspot-renderer');
var ReticleRenderer = _dereq_('./reticle-renderer');
var SphereRenderer = _dereq_('./sphere-renderer');
var TWEEN = _dereq_('@tweenjs/tween.js');
var Util = _dereq_('../util');
var VideoProxy = _dereq_('./video-proxy');
var WebVRManager = _dereq_('webvr-boilerplate');

var AUTOPAN_DURATION = 3000;
var AUTOPAN_ANGLE = 0.4;

/**
 * The main WebGL rendering entry point. Manages the scene, camera, VR-related
 * rendering updates. Interacts with the WebVRManager.
 *
 * Coordinates the other renderers: SphereRenderer, HotspotRenderer,
 * ReticleRenderer.
 *
 * Also manages the AdaptivePlayer and VideoProxy.
 *
 * Emits the following events:
 *   load: when the scene is loaded.
 *   error: if there is an error loading the scene.
 *   modechange(Boolean isVR): if the mode (eg. VR, fullscreen, etc) changes.
 */
function WorldRenderer(params) {
  this.init_(params.hideFullscreenButton);

  this.sphereRenderer = new SphereRenderer(this.scene);
  this.hotspotRenderer = new HotspotRenderer(this);
  this.hotspotRenderer.on('focus', this.onHotspotFocus_.bind(this));
  this.hotspotRenderer.on('blur', this.onHotspotBlur_.bind(this));
  this.reticleRenderer = new ReticleRenderer(this.camera);

  // Get the VR Display as soon as we initialize.
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      this.vrDisplay = displays[0];
    }
  }.bind(this));

}
WorldRenderer.prototype = new EventEmitter();

WorldRenderer.prototype.render = function(time) {
  this.controls.update();
  TWEEN.update(time);
  this.effect.render(this.scene, this.camera);
  this.hotspotRenderer.update(this.camera);
};

/**
 * @return {Promise} When the scene is fully loaded.
 */
WorldRenderer.prototype.setScene = function(scene) {
  var self = this;
  var promise = new Promise(function(resolve, reject) {
    self.sceneResolve = resolve;
    self.sceneReject = reject;
  });

  if (!scene || !scene.isValid()) {
    this.didLoadFail_(scene.errorMessage);
    return;
  }

  var params = {
    isStereo: scene.isStereo,
    loop: scene.loop,
    volume: scene.volume,
    muted: scene.muted
  };

  this.setDefaultYaw_(scene.defaultYaw || 0);

  // Disable VR mode if explicitly disabled, or if we're loading a video on iOS
  // 9 or earlier.
  if (scene.isVROff || (scene.video && Util.isIOS9OrLess())) {
    this.manager.setVRCompatibleOverride(false);
  }

  // Set various callback overrides in iOS.
  if (Util.isIOS()) {
    this.manager.setFullscreenCallback(function() {
      Util.sendParentMessage({type: 'enter-fullscreen'});
    });
    this.manager.setExitFullscreenCallback(function() {
      Util.sendParentMessage({type: 'exit-fullscreen'});
    });
    this.manager.setVRCallback(function() {
      Util.sendParentMessage({type: 'enter-vr'});
    });
  }

  // If we're dealing with an image, and not a video.
  if (scene.image && !scene.video) {
    if (scene.preview) {
      // First load the preview.
      this.sphereRenderer.setPhotosphere(scene.preview, params).then(function() {
        // As soon as something is loaded, emit the load event to hide the
        // loading progress bar.
        self.didLoad_();
        // Then load the full resolution image.
        self.sphereRenderer.setPhotosphere(scene.image, params);
      }).catch(self.didLoadFail_.bind(self));
    } else {
      // No preview -- go straight to rendering the full image.
      this.sphereRenderer.setPhotosphere(scene.image, params).then(function() {
        self.didLoad_();
      }).catch(self.didLoadFail_.bind(self));
    }
  } else if (scene.video) {
    if (Util.isIE11()) {
      // On IE 11, if an 'image' param is provided, load it instead of showing
      // an error.
      //
      // TODO(smus): Once video textures are supported, remove this fallback.
      if (scene.image) {
        this.sphereRenderer.setPhotosphere(scene.image, params).then(function() {
          self.didLoad_();
        }).catch(self.didLoadFail_.bind(self));
      } else {
        this.didLoadFail_('Video is not supported on IE11.');
      }
    } else {
      this.player = new AdaptivePlayer(params);
      this.player.on('load', function(videoElement, videoType) {
        self.sphereRenderer.set360Video(videoElement, videoType, params).then(function() {
          self.didLoad_({videoElement: videoElement});
        }).catch(self.didLoadFail_.bind(self));
      });
      this.player.on('error', function(error) {
        self.didLoadFail_('Video load error: ' + error);
      });
      this.player.load(scene.video);

      this.videoProxy = new VideoProxy(this.player.video);
    }
  }

  this.sceneInfo = scene;
  if (Util.isDebug()) {
    console.log('Loaded scene', scene);
  }

  return promise;
};

WorldRenderer.prototype.isVRMode = function() {
  return !!this.vrDisplay && this.vrDisplay.isPresenting;
};

WorldRenderer.prototype.submitFrame = function() {
  if (this.isVRMode()) {
    this.vrDisplay.submitFrame();
  }
};

WorldRenderer.prototype.disposeEye_ = function(eye) {
  if (eye) {
    if (eye.material.map) {
      eye.material.map.dispose();
    }
    eye.material.dispose();
    eye.geometry.dispose();
  }
};

WorldRenderer.prototype.dispose = function() {
  var eyeLeft = this.scene.getObjectByName('eyeLeft');
  this.disposeEye_(eyeLeft);
  var eyeRight = this.scene.getObjectByName('eyeRight');
  this.disposeEye_(eyeRight);
};

WorldRenderer.prototype.destroy = function() {
  if (this.player) {
    this.player.removeAllListeners();
    this.player.destroy();
    this.player = null;
  }
  var photo = this.scene.getObjectByName('photo');
  var eyeLeft = this.scene.getObjectByName('eyeLeft');
  var eyeRight = this.scene.getObjectByName('eyeRight');

  if (eyeLeft) {
    this.disposeEye_(eyeLeft);
    photo.remove(eyeLeft);
    this.scene.remove(eyeLeft);
  }

  if (eyeRight) {
    this.disposeEye_(eyeRight);
    photo.remove(eyeRight);
    this.scene.remove(eyeRight);
  }
};

WorldRenderer.prototype.didLoad_ = function(opt_event) {
  var event = opt_event || {};
  this.emit('load', event);
  if (this.sceneResolve) {
    this.sceneResolve();
  }
};

WorldRenderer.prototype.didLoadFail_ = function(message) {
  this.emit('error', message);
  if (this.sceneReject) {
    this.sceneReject(message);
  }
};

/**
 * Sets the default yaw.
 * @param {Number} angleRad The yaw in radians.
 */
WorldRenderer.prototype.setDefaultYaw_ = function(angleRad) {
  // Rotate the camera parent to take into account the scene's rotation.
  // By default, it should be at the center of the image.
  var display = this.controls.getVRDisplay();
  // For desktop, we subtract the current display Y axis
  var theta = display.theta_ || 0;
  // For devices with orientation we make the current view center
  if (display.poseSensor_) {
    display.poseSensor_.resetPose();
  }
  this.camera.parent.rotation.y = (Math.PI / 2.0) + angleRad - theta;
};

/**
 * Do the initial camera tween to rotate the camera, giving an indication that
 * there is live content there (on desktop only).
 */
WorldRenderer.prototype.autopan = function(duration) {
  var targetY = this.camera.parent.rotation.y - AUTOPAN_ANGLE;
  var tween = new TWEEN.Tween(this.camera.parent.rotation)
      .to({y: targetY}, AUTOPAN_DURATION)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
};

WorldRenderer.prototype.init_ = function(hideFullscreenButton) {
  var container = document.querySelector('body');
  var aspect = window.innerWidth / window.innerHeight;
  var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
  camera.layers.enable(1);

  var cameraDummy = new THREE.Object3D();
  cameraDummy.add(camera);

  // Antialiasing disabled to improve performance.
  var renderer = new THREE.WebGLRenderer({antialias: false});
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  var controls = new THREE.VRControls(camera);
  var effect = new THREE.VREffect(renderer);

  // Disable eye separation.
  effect.scale = 0;
  effect.setSize(window.innerWidth, window.innerHeight);

  // Present submission of frames automatically. This is done manually in
  // submitFrame().
  effect.autoSubmitFrame = false;

  this.camera = camera;
  this.renderer = renderer;
  this.effect = effect;
  this.controls = controls;
  this.manager = new WebVRManager(renderer, effect, {predistorted: false, hideButton: hideFullscreenButton});

  this.scene = this.createScene_();
  this.scene.add(this.camera.parent);


  // Watch the resize event.
  window.addEventListener('resize', this.onResize_.bind(this));

  // Prevent context menu.
  window.addEventListener('contextmenu', this.onContextMenu_.bind(this));

  window.addEventListener('vrdisplaypresentchange',
                          this.onVRDisplayPresentChange_.bind(this));
};

WorldRenderer.prototype.onResize_ = function() {
  this.effect.setSize(window.innerWidth, window.innerHeight);
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
};

WorldRenderer.prototype.onVRDisplayPresentChange_ = function(e) {
  if (Util.isDebug()) {
    console.log('onVRDisplayPresentChange_');
  }
  var isVR = this.isVRMode();

  // If the mode changed to VR and there is at least one hotspot, show reticle.
  var isReticleVisible = isVR && this.hotspotRenderer.getCount() > 0;
  this.reticleRenderer.setVisibility(isReticleVisible);

  // Resize the renderer for good measure.
  this.onResize_();

  // Analytics.
  if (window.analytics) {
    analytics.logModeChanged(isVR);
  }

  // When exiting VR mode from iOS, make sure we emit back an exit-fullscreen event.
  if (!isVR && Util.isIOS()) {
    Util.sendParentMessage({type: 'exit-fullscreen'});
  }

  // Emit a mode change event back to any listeners.
  this.emit('modechange', isVR);
};

WorldRenderer.prototype.createScene_ = function(opt_params) {
  var scene = new THREE.Scene();

  // Add a group for the photosphere.
  var photoGroup = new THREE.Object3D();
  photoGroup.name = 'photo';
  scene.add(photoGroup);

  return scene;
};

WorldRenderer.prototype.onHotspotFocus_ = function(id) {
  // Set the default cursor to be a pointer.
  this.setCursor_('pointer');
};

WorldRenderer.prototype.onHotspotBlur_ = function(id) {
  // Reset the default cursor to be the default one.
  this.setCursor_('');
};

WorldRenderer.prototype.setCursor_ = function(cursor) {
  this.renderer.domElement.style.cursor = cursor;
};

WorldRenderer.prototype.onContextMenu_ = function(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

module.exports = WorldRenderer;

},{"../util":21,"./adaptive-player":9,"./eyes":10,"./hotspot-renderer":11,"./reticle-renderer":15,"./sphere-renderer":17,"./video-proxy":18,"@tweenjs/tween.js":1,"eventemitter3":3,"webvr-boilerplate":7}],20:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Messages from the API to the embed.
 */
var Message = {
  PLAY: 'play',
  PAUSE: 'pause',
  TIMEUPDATE: 'timeupdate',
  ADD_HOTSPOT: 'addhotspot',
  SET_CONTENT: 'setimage',
  SET_VOLUME: 'setvolume',
  MUTED: 'muted',
  SET_CURRENT_TIME: 'setcurrenttime',
  DEVICE_MOTION: 'devicemotion',
  GET_POSITION: 'getposition',
  SET_FULLSCREEN: 'setfullscreen',
};

module.exports = Message;

},{}],21:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = window.Util || {};

Util.isDataURI = function(src) {
  return src && src.indexOf('data:') == 0;
};

Util.generateUUID = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

Util.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Util.isIOS = function() {
  return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
};

Util.isSafari = function() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

Util.cloneObject = function(obj) {
  var out = {};
  for (key in obj) {
    out[key] = obj[key];
  }
  return out;
};

Util.hashCode = function(s) {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
};

Util.loadTrackSrc = function(context, src, callback, opt_progressCallback) {
  var request = new XMLHttpRequest();
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously.
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      callback(buffer);
    }, function(e) {
      console.error(e);
    });
  };
  if (opt_progressCallback) {
    request.onprogress = function(e) {
      var percent = e.loaded / e.total;
      opt_progressCallback(percent);
    };
  }
  request.send();
};

Util.isPow2 = function(n) {
  return (n & (n - 1)) == 0;
};

Util.capitalize = function(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

Util.isIFrame = function() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// From http://goo.gl/4WX3tg
Util.getQueryParameter = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


// From http://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support.
Util.isWebGLEnabled = function() {
  var canvas = document.createElement('canvas');
  try { gl = canvas.getContext("webgl"); }
  catch (x) { gl = null; }

  if (gl == null) {
    try { gl = canvas.getContext("experimental-webgl"); experimental = true; }
    catch (x) { gl = null; }
  }
  return !!gl;
};

Util.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// From http://stackoverflow.com/questions/10140604/fastest-hypotenuse-in-javascript
Util.hypot = Math.hypot || function(x, y) {
  return Math.sqrt(x*x + y*y);
};

// From http://stackoverflow.com/a/17447718/693934
Util.isIE11 = function() {
  return navigator.userAgent.match(/Trident/);
};

Util.getRectCenter = function(rect) {
  return new THREE.Vector2(rect.x + rect.width/2, rect.y + rect.height/2);
};

Util.getScreenWidth = function() {
  return Math.max(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.getScreenHeight = function() {
  return Math.min(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.isIOS9OrLess = function() {
  if (!Util.isIOS()) {
    return false;
  }
  var re = /(iPhone|iPad|iPod) OS ([\d_]+)/;
  var iOSVersion = navigator.userAgent.match(re);
  if (!iOSVersion) {
    return false;
  }
  // Get the last group.
  var versionString = iOSVersion[iOSVersion.length - 1];
  var majorVersion = parseFloat(versionString);
  return majorVersion <= 9;
};

Util.getExtension = function(url) {
  return url.split('.').pop().split('?')[0];
};

Util.createGetParams = function(params) {
  var out = '?';
  for (var k in params) {
    var paramString = k + '=' + params[k] + '&';
    out += paramString;
  }
  // Remove the trailing ampersand.
  out.substring(0, params.length - 2);
  return out;
};

Util.sendParentMessage = function(message) {
  if (window.parent) {
    parent.postMessage(message, '*');
  }
};

Util.parseBoolean = function(value) {
  if (value == 'false' || value == 0) {
    return false;
  } else if (value == 'true' || value == 1) {
    return true;
  } else {
    return !!value;
  }
};

/**
 * @param base {String} An absolute directory root.
 * @param relative {String} A relative path.
 *
 * @returns {String} An absolute path corresponding to the rootPath.
 *
 * From http://stackoverflow.com/a/14780463/693934.
 */
Util.relativeToAbsolutePath = function(base, relative) {
  var stack = base.split('/');
  var parts = relative.split('/');
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] == '.') {
      continue;
    }
    if (parts[i] == '..') {
      stack.pop();
    } else {
      stack.push(parts[i]);
    }
  }
  return stack.join('/');
};

/**
 * @return {Boolean} True iff the specified path is an absolute path.
 */
Util.isPathAbsolute = function(path) {
  return ! /^(?:\/|[a-z]+:\/\/)/.test(path);
}

Util.isEmptyObject = function(obj) {
  return Object.getOwnPropertyNames(obj).length == 0;
};

Util.isDebug = function() {
  return Util.parseBoolean(Util.getQueryParameter('debug'));
};

Util.getCurrentScript = function() {
  // Note: in IE11, document.currentScript doesn't work, so we fall back to this
  // hack, taken from https://goo.gl/TpExuH.
  if (!document.currentScript) {
    console.warn('This browser does not support document.currentScript. Trying fallback.');
  }
  return document.currentScript || document.scripts[document.scripts.length - 1];
}


module.exports = Util;

},{}],22:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Video Types
 */
var VideoTypes = {
  HLS: 1,
  DASH: 2,
  VIDEO: 3
};

module.exports = VideoTypes;
},{}]},{},[14]);
