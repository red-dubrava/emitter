/* eslint-disable @typescript-eslint/no-extraneous-class */
import { EMITTER_MAP } from './constants';
import { addListener, emit, getEventNames, getListenersByName, hasListener, off, on, once, removeAllListeners, removeListener } from './methods';
import { IEmitter } from './types';

interface Emitter<TEvents extends object> extends IEmitter<TEvents> {}

class Emitter<TEvents extends object> implements IEmitter<TEvents> {
  constructor() {
    EMITTER_MAP.set(this, new Map());
  }

  static [Symbol.hasInstance](instance: unknown): boolean {
    if (!instance || typeof instance !== 'object') return false;
    return EMITTER_MAP.has(instance);
  }
}

const emitterPrototype = Emitter.prototype as IEmitter<object>;

emitterPrototype.emit = emit;
emitterPrototype.addListener = addListener;
emitterPrototype.removeListener = removeListener;
emitterPrototype.hasListener = hasListener;
emitterPrototype.removeAllListeners = removeAllListeners;
emitterPrototype.getListenersByName = getListenersByName;
emitterPrototype.getEventNames = getEventNames;
emitterPrototype.on = on;
emitterPrototype.once = once;
emitterPrototype.off = off;

export { Emitter };
