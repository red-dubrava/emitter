# Emitter

## Setup

```bash
npm install @red-dubrava/emitter
```

## Features at a glance

A type-safe, flexible, and extensible Event Emitter for TypeScript projects. Supports both classic inheritance and modern decorator binding. Fully typed, with priorities, context, disposable listeners, and guards.

## Class instance

```ts
import { Emitter } from '@red-dubrava/emitter';

interface MyEvents {
  click: { x?: number; y?: number };
}

const emitter = new Emitter<MyEvents>();

emitter.on('click', ({ x, y }) => {
  console.log(`x: ${x}; y: ${y}`);
});

emitter.emit('click', { x: 1, y: 2 });
```

## Inheritance

```ts
import { Emitter } from '@red-dubrava/emitter';

interface MyEvents {
  click: { x?: number; y?: number };
}

class InheritanceEmitter extends Emitter<MyEvents> {}

const emitter = new InheritanceEmitter();

emitter.on('click', ({ x, y }) => {
  console.log(`x: ${x}; y: ${y}`);
});

emitter.emit('click', { x: 1, y: 2 });
```

## Decoration

```ts
import { EmitterMixin, IEmitter } from '@red-dubrava/emitter';

interface MyEvents {
  click: { x?: number; y?: number };
}

interface DecoratedEmitter extends IEmitter<MyEvents> {}

@EmitterMixin()
class DecoratedEmitter implements IEmitter<MyEvents> {}

const emitter = new DecoratedEmitter();

emitter.on('click', ({ x, y }) => {
  console.log(`click position ${x}:${y}`);
});

emitter.emit('click', { x: 1, y: 2 });

emitter instanceof Emitter; // true
```

## EventData

Data passed to the event

```ts
emitter.on('click', (eventData) => {
  console.log(eventData); // 42, from emit
});

emitter.emit(42);
```

## EventObject

The emitter adds an event object to the handler to receive additional data at the time of the call.

```ts
emitter.on('click', (_eventData, eventObject) => {
  console.log(eventObject);
});
```

- eventName - the name of the event on which the handler was called

```ts
emitter.on('click', ({ eventName }) => {
  console.log(eventName); // 'click'
});
```

- listener - the processing function that is currently being called (for example, you can unsubscribe from an event)

```ts
const fn = (_, { listener }: { listener: () => void }) => {
  console.log(listener === fn); // true
};
emitter.on('click', fn);
```

- priority - handler call priority ("low" | "medium" | "high")

```ts
const priorityLog = (_, { priority }) => {
  console.log(priority);
};

emitter.on('click', priorityLog); // default 'medium'

emitter.on('click', priorityLog, { priority: 'low' }); // 'low'
```

- context - additional call context

```ts
const self = { value: 100 };

const fn = (_, { context }: { context: { value: number } }) => {
  console.log(context === self); // true
};

emitter.on('click', fn, { context: self });
```

## Options

When adding listeners, you can pass a third optional argument with options

```ts
emitter.on('click', fn, options);
```

- priority - listeners with priority 'high' will be called first, then 'medium' and last 'low'. By default, the priority is 'medium'

```ts
emitter.on('click', fn, { priority: 'high' });
```

- context - the calling context (it will not be assigned as the listener's this)

```ts
emitter.on('click', fn, { context: emitter });
```

- guard - a guard function that will be called before the listener and will prevent the listener from being called if it returns false

```ts
const guard = ({ x }: { x: number }) => x > 0;

emitter.on('click', fn, { guard });

emitter.emit('click', { x: 0 }); // fn will not be called (x <= 0)

emitter.emit('click', { x: 2 }); // call fn
```

- once - flag indicating whether the listener should be removed after the first call (this flag is missing in on and once methods as they are predefined for addListener with once option)

```ts
emitter.addListener('click', fn, { once: true });
```

## Methods

- emit - raises (emits) an event with the specified name and passed arguments, notifying all subscribers.
- addListener - adds a handler (listener) for the specified event.
- removeListener - removes a previously added handler for a specific event.
- hasListener - checks whether a handler is registered for the specified event.
- removeAllListeners - removes all handlers for the specified event (or for all events if no name is specified).
- getListenersByName - returns a list of handlers registered for a specific event.
- getEventNames - returns a list of all event names for which handlers are registered.
- on - alias for addListener with option once: false
- once - alias for addListener with option once: true
- off - alias for removeListener

## Examples

1. Events without data

```ts
interface EmitterEvents {
  counter: number;
  click: undefined;
}

const emitter = new Emitter<EmitterEvents>();

emitter.on('counter', (eventData) => {
  console.log(eventData); // 42
});

emitter.on('click', (eventData) => {
  console.log(eventData); // undefined
});

emitter.emit('counter', 42); // ok

emitter.emit('counter'); // error, missing data

emitter.emit('click'); // ok
```

2. Data tuple and data object

```ts
interface EmitterEvents {
  click: { x: number; y: number };
  counter: [current: number, prev: number];
}

const emitter = new Emitter<EmitterEvents>();

emitter.on('click', ({ x, y }) => {
  console.log(x, y); // 1, 2
});

emitter.on('counter', ([current, prev]) => {
  console.log(current, prev); // 2, 1
});

emitter.emit('click', { x: 1, y: 2 });

emitter.emit('counter', [2, 1]);
```
