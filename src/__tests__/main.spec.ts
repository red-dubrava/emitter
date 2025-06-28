/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MEDIUM_PRIORITY } from '../constants';
import { Emitter } from '../emitter';
import { EmitterMixin } from '../mixin';
import { IEmitter } from '../types';

interface TestEmitterEvents {
  eventOne: number;
  eventTwo: string;
}

interface T1 extends IEmitter<TestEmitterEvents> {}
@EmitterMixin()
class T1 {}

interface T2 extends IEmitter<TestEmitterEvents> {}
@EmitterMixin()
class T2 {}

class T3 extends Emitter<TestEmitterEvents> {}

class T4 extends Emitter<TestEmitterEvents> {}

interface Context {
  t1: IEmitter<TestEmitterEvents>;
  t2: IEmitter<TestEmitterEvents>;
  t3: IEmitter<TestEmitterEvents>;
  t4: IEmitter<TestEmitterEvents>;
  t5: IEmitter<TestEmitterEvents>;
  t6: IEmitter<TestEmitterEvents>;
}

describe('emitter main tests', () => {
  beforeEach<Context>((ctx) => {
    ctx.t1 = new T1();
    ctx.t2 = new T2();
    ctx.t3 = new T3();
    ctx.t4 = new T4();
    ctx.t5 = new T1();
    ctx.t6 = new T4();
  });

  it<Context>('должен быть экземпляром Emitter', ({ t1, t3 }) => {
    expect(t1).toBeInstanceOf(Emitter);
    expect(t3).toBeInstanceOf(Emitter);
  });

  it<Context>('должен иметь единые методы на прототипе', ({ t1, t2, t3, t4, t5, t6 }) => {
    expect(t1.emit).toEqual(t2.emit);
    expect(t1.emit).toEqual(t3.emit);
    expect(t1.emit).toEqual(t4.emit);
    expect(t1.emit).toEqual(t5.emit);
    expect(t1.emit).toEqual(t6.emit);
  });

  it<Context>('должен иметь свою карту с обработчиками', ({ t1, t2, t3, t4, t5, t6 }) => {
    const listener = () => undefined;

    t1.addListener('eventOne', listener);

    expect(t1.hasListener('eventOne', listener)).toBe(true);
    expect(t2.hasListener('eventOne', listener)).toBe(false);
    expect(t3.hasListener('eventOne', listener)).toBe(false);
    expect(t4.hasListener('eventOne', listener)).toBe(false);
    expect(t5.hasListener('eventOne', listener)).toBe(false);
    expect(t6.hasListener('eventOne', listener)).toBe(false);

    t2.addListener('eventOne', listener);

    expect(t2.hasListener('eventOne', listener)).toBe(true);

    t1.removeListener('eventOne', listener);

    expect(t1.hasListener('eventOne', listener)).toBe(false);
    expect(t2.hasListener('eventOne', listener)).toBe(true);
  });

  it<Context>('должен иметь информацию о вызове', async ({ t1, t3 }) => {
    await new Promise<void>((resolve) => {
      t1.on('eventOne', function (eventObject) {
        const value = eventObject.data;
        expect(value).toBeTypeOf('number');
        expect(eventObject.priority).toEqual(MEDIUM_PRIORITY);
        expect(eventObject.eventName).toEqual('eventOne');
        resolve();
      });

      t1.emit('eventOne', 1);
    });

    await new Promise<void>((resolve) => {
      t3.on('eventOne', function (eventObject) {
        const value = eventObject.data;
        expect(value).toBeTypeOf('number');
        expect(eventObject.priority).toEqual(MEDIUM_PRIORITY);
        expect(eventObject.eventName).toEqual('eventOne');
        resolve();
      });

      t3.emit('eventOne', 1);
    });
  });

  it<Context>('должен передавать данные', async ({ t1, t3 }) => {
    const value = 1;

    interface EventData {
      data: number;
    }

    await new Promise<void>((resolve) => {
      function listener({ data }: EventData) {
        expect(data).toEqual(value);
        resolve();
      }

      t1.on('eventOne', listener);

      t1.emit('eventOne', value);
    });

    await new Promise<void>((resolve) => {
      function listener({ data }: EventData) {
        expect(data).toEqual(value);
        resolve();
      }

      t3.on('eventOne', listener);

      t3.emit('eventOne', value);
    });
  });

  it<Context>('должен передавать контекст вызова', async ({ t1, t3 }) => {
    const context = { value: 2 };

    interface EventContext {
      context: typeof context;
    }

    await new Promise<void>((resolve) => {
      function listener(eventObject: EventContext) {
        const { value } = eventObject.context;
        expect(value).toEqual(context.value);
        resolve();
      }

      t1.on('eventOne', listener, { context });

      t1.emit('eventOne', context.value);
    });

    await new Promise<void>((resolve) => {
      function listener(eventObject: EventContext) {
        const { value } = eventObject.context;
        expect(value).toEqual(context.value);
        resolve();
      }

      t3.on('eventOne', listener, { context });

      t3.emit('eventOne', context.value);
    });
  });

  it<Context>('должен быть вызван on метод', ({ t1, t3 }) => {
    const spy1 = vi.spyOn(t1, 'on');
    const spy2 = vi.spyOn(t3, 'on');
    t1.on('eventOne', () => undefined);
    t3.on('eventOne', () => undefined);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it<Context>('должен вызвать событие', ({ t1, t3 }) => {
    let resultValue = 0;

    const listener = ({ data }: { data: number }) => {
      resultValue += data;
    };

    t1.on('eventOne', listener);
    t3.on('eventOne', listener);

    t1.emit('eventOne', 1);
    expect(resultValue).toEqual(1);
    t3.emit('eventOne', 1);
    expect(resultValue).toEqual(2);
  });

  it<Context>('должен добавлять и удалять слушатель', ({ t1, t3 }) => {
    const listener = () => undefined;
    t1.on('eventOne', listener);
    expect(t1.hasListener('eventOne', listener)).toBe(true);
    expect(t3.hasListener('eventOne', listener)).toBe(false);
    t1.off('eventOne', listener);
    expect(t1.hasListener('eventOne', listener)).toBe(false);
  });

  it<Context>('должен быть удален после вызова с once опцией', ({ t1 }) => {
    const listener = () => undefined;
    t1.addListener('eventOne', listener, { once: true });
    expect(t1.hasListener('eventOne', listener)).toBe(true);
    t1.emit('eventOne', 0);
    expect(t1.hasListener('eventOne', listener)).toBe(false);
  });

  it<Context>('должен вызвать событие каждый раз, пока существует слушатель', ({ t1 }) => {
    let resultValue = 0;

    const testValue = 10;

    const listener = () => {
      resultValue += 1;
    };

    t1.on('eventOne', listener);

    Array.from({ length: testValue }).map(() => {
      t1.emit('eventOne', 0);
    });

    expect(resultValue).toEqual(testValue);

    t1.off('eventOne', listener);
    t1.emit('eventOne', 0);

    expect(resultValue).toEqual(testValue);
  });

  it<Context>('должен вызвать каждый слушатель на событие', ({ t1 }) => {
    let testOne = '';
    let testTwo = '';
    const resultValue = 'test';
    t1.on('eventOne', () => {
      testOne = resultValue;
    });
    t1.on('eventOne', () => {
      testTwo = resultValue;
    });
    t1.emit('eventOne', 0);
    expect(testOne).toEqual(resultValue);
    expect(testTwo).toEqual(resultValue);
  });

  it<Context>('должен вызвать правильный слушатель', ({ t1 }) => {
    let testOne = '';
    let testTwo = '';
    const resultValue = 'test';
    t1.on('eventOne', () => {
      testOne = resultValue;
    });
    t1.on('eventTwo', () => {
      testTwo = resultValue;
    });
    t1.emit('eventOne', 0);
    expect(testOne).toEqual(resultValue);
    expect(testTwo).toEqual('');
  });

  it<Context>('должен передавать правильные данные', ({ t1 }) => {
    let testOne: unknown = null;
    let testTwo: unknown = null;
    t1.on('eventOne', ({ data }) => {
      testOne = data;
    });
    t1.on('eventTwo', ({ data }) => {
      testTwo = data;
    });
    t1.emit('eventOne', 1);
    t1.emit('eventTwo', '');
    expect(testOne).toBeTypeOf('number');
    expect(testTwo).toBeTypeOf('string');
  });

  it<Context>('должен вызвать обработчики в порядке добавления', ({ t1 }) => {
    let value = 2;
    t1.on('eventOne', ({ data }) => (value += data));
    t1.on('eventOne', ({ data }) => (value *= data));
    t1.emit('eventOne', 2);
    expect(value).toBe(8);
  });

  it<Context>('должен вызвать обработчики по приоритету', ({ t1 }) => {
    let value = 2;
    const clear = () => {
      t1.removeAllListeners();
      value = 2;
    };

    t1.on('eventOne', ({ data }) => (value += data), { priority: 'low' });
    t1.on('eventOne', ({ data }) => (value *= data));
    t1.emit('eventOne', 2);
    expect(value).toBe(6);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'low' });
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'medium' });
    t1.emit('eventOne', 2);
    expect(value).toBe(6);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'low' });
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'high' });
    t1.emit('eventOne', 2);
    expect(value).toBe(6);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'medium' });
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'high' });
    t1.emit('eventOne', 2);
    expect(value).toBe(6);

    clear();
    t1.on('eventOne', ({ data }) => (value += data));
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'high' });
    t1.emit('eventOne', 2);
    expect(value).toBe(6);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'medium' });
    t1.on('eventOne', ({ data }) => (value *= data));
    t1.emit('eventOne', 2);
    expect(value).toBe(8);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'high' });
    t1.on('eventOne', ({ data }) => (value *= data));
    t1.emit('eventOne', 2);
    expect(value).toBe(8);

    clear();
    t1.on('eventOne', ({ data }) => (value += data));
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'low' });
    t1.emit('eventOne', 2);
    expect(value).toBe(8);

    clear();
    t1.on('eventOne', ({ data }) => (value += data));
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'medium' });
    t1.emit('eventOne', 2);
    expect(value).toBe(8);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'medium' });
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'low' });
    t1.emit('eventOne', 2);
    expect(value).toBe(8);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'high' });
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'low' });
    t1.emit('eventOne', 2);
    expect(value).toBe(8);

    clear();
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'high' });
    t1.on('eventOne', ({ data }) => (value *= data), { priority: 'medium' });
    t1.emit('eventOne', 2);
    expect(value).toBe(8);
  });

  it<Context>('должен перезаписывать обработчик, если указан другой приоритет', ({ t1 }) => {
    let value = 2;

    const clear = () => {
      t1.removeAllListeners();
      value = 2;
    };

    const multiply = ({ data }: { data: number }) => (value *= data);

    t1.on('eventOne', multiply, { priority: 'low' });
    t1.on('eventOne', multiply, { priority: 'medium' });
    t1.emit('eventOne', 2);
    expect(value).toBe(4);

    clear();
    t1.on('eventOne', multiply, { priority: 'high' });
    t1.on('eventOne', multiply, { priority: 'low' });
    t1.on('eventOne', ({ data }) => (value += data), { priority: 'medium' });
    t1.emit('eventOne', 2);
    expect(value).toBe(8);
  });

  it('должен позволять вызывать методы из конструктора', () => {
    interface T1 extends IEmitter<TestEmitterEvents> {}

    const spy1 = vi.fn();

    @EmitterMixin()
    class T1 {
      constructor() {
        this.on('eventOne', spy1);
      }
    }

    interface T2 extends IEmitter<TestEmitterEvents> {}

    const spy2 = vi.fn();

    @EmitterMixin()
    class T2 {
      constructor() {
        this.on('eventOne', spy2);
        this.emit('eventOne', 0);
      }
    }

    new T1().emit('eventOne', 0);
    new T2();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });
});
