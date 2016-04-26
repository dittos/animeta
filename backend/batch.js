export default class Batch {
  constructor(batchLoadFn) {
    if (typeof batchLoadFn !== 'function') {
      throw new TypeError(
        'DataLoader must be constructed with a function which accepts ' +
        `Array<key> and returns Promise<Array<value>>, but got: ${batchLoadFn}.`
      );
    }
    this._batchLoadFn = batchLoadFn;
    this._queue = [];
  }

  call(key) {
    var promise = new Promise((resolve, reject) => {
      // Enqueue this Promise to be dispatched.
      this._queue.push({ key, resolve, reject });

      // Determine if a dispatch of this queue should be scheduled.
      // A single dispatch should be scheduled per queue at the time when the
      // queue changes from "empty" to "full".
      if (this._queue.length === 1) {
        // If batching, schedule a task to dispatch the queue.
        enqueuePostPromiseJob(() => dispatchQueue(this));
      }
    });
    return promise;
  }
}

// Private: Enqueue a Job to be executed after all "PromiseJobs" Jobs.
//
// ES6 JavaScript uses the concepts Job and JobQueue to schedule work to occur
// after the current execution context has completed:
// http://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues
//
// Node.js uses the `process.nextTick` mechanism to implement the concept of a
// Job, maintaining a global FIFO JobQueue for all Jobs, which is flushed after
// the current call stack ends.
//
// When calling `then` on a Promise, it enqueues a Job on a specific
// "PromiseJobs" JobQueue which is flushed in Node as a single Job on the
// global JobQueue.
//
// DataLoader batches all loads which occur in a single frame of execution, but
// should include in the batch all loads which occur during the flushing of the
// "PromiseJobs" JobQueue after that same execution frame.
//
// In order to avoid the DataLoader dispatch Job occuring before "PromiseJobs",
// A Promise Job is created with the sole purpose of enqueuing a global Job,
// ensuring that it always occurs after "PromiseJobs" ends.
function enqueuePostPromiseJob(fn) {
  if (!resolvedPromise) {
    resolvedPromise = Promise.resolve();
  }
  resolvedPromise.then(() => process.nextTick(fn));
}

// Private: cached resolved Promise instance
var resolvedPromise;

// Private: given the current state of a Loader instance, perform a batch load
// from its current queue.
function dispatchQueue(loader) {
  // Take the current loader queue, replacing it with an empty queue.
  var queue = loader._queue;
  loader._queue = [];

  // Collect all keys to be loaded in this dispatch
  var keys = queue.map(({ key }) => key);

  // Call the provided batchLoadFn for this loader with the loader queue's keys.
  var batchLoadFn = loader._batchLoadFn;
  var batchPromise = batchLoadFn(keys);

  // Assert the expected response from batchLoadFn
  if (!batchPromise || typeof batchPromise.then !== 'function') {
    return failedDispatch(loader, queue, new TypeError(
      'DataLoader must be constructed with a function which accepts ' +
      'Array<key> and returns Promise<Array<value>>, but the function did ' +
      `not return a Promise: ${batchPromise}.`
    ));
  }

  // Await the resolution of the call to batchLoadFn.
  batchPromise.then(values => {

    // Assert the expected resolution from batchLoadFn.
    if (!Array.isArray(values)) {
      throw new Error(
        'DataLoader must be constructed with a function which accepts ' +
        'Array<key> and returns Promise<Array<value>>, but the function did ' +
        `not return a Promise of an Array: ${values}.`
      );
    }
    if (values.length !== keys.length) {
      throw new Error(
        'DataLoader must be constructed with a function which accepts ' +
        'Array<key> and returns Promise<Array<value>>, but the function did ' +
        'not return a Promise of an Array of the same length as the Array ' +
        'of keys.' +
        `\n\nKeys:\n${keys}` +
        `\n\nValues:\n${values}`
      );
    }

    // Step through the values, resolving or rejecting each Promise in the
    // loaded queue.
    queue.forEach(({ key, resolve, reject }, index) => {
      var value = values[index];
      if (value instanceof Error) {
        reject(value);
      } else {
        resolve(value);
      }
    });
  }).catch(error => failedDispatch(loader, queue, error));
}

// Private: do not cache individual loads if the entire batch dispatch fails,
// but still reject each request so they do not hang.
function failedDispatch(loader, queue, error) {
  queue.forEach(({ key, reject }) => {
    loader.clear(key);
    reject(error);
  });
}
