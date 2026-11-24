export class AsyncQueue {
  #queue = [];
  #resolvers = [];
  #closed = false;

  enqueue(item) {
    if (this.#closed) {
      throw new Error('Cannot enqueue into a closed queue');
    }

    if (this.#resolvers.length > 0) {
      const resolver = this.#resolvers.shift();
      resolver.resolve({ value: item, done: false });
    } else {
      this.#queue.push(item);
    }
  }

  async dequeue() {
    if (this.#queue.length > 0) {
      return { value: this.#queue.shift(), done: false };
    }

    if (this.#closed) {
      return { value: undefined, done: true };
    }

    const { promise, resolve } = Promise.withResolvers();
    this.#resolvers.push({ resolve });
    return promise;
  }

  close() {
    this.#closed = true;
    while (this.#resolvers.length > 0) {
      const resolver = this.#resolvers.shift();
      resolver.resolve({ value: undefined, done: true });
    }
  }
}
