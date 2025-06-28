/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EMITTER_MAP } from './constants';
import { addListener, emit, getEventNames, getListenersByName, hasListener, off, on, once, removeAllListeners, removeListener } from './methods';
import type { IEmitter } from './types';

export type Constructor<TInstance extends object = object> = abstract new (...args: any[]) => TInstance;

export type ClassDecorator<TInput extends Constructor, TOutput extends TInput> = (Target: TInput, context: ClassDecoratorContext<TInput>) => TOutput;

export const EmitterMixin = <TEvents extends object, TConstructor extends Constructor>(): ClassDecorator<
  TConstructor,
  TConstructor & Constructor<IEmitter<TEvents>>
> => {
  return (Target) => {
    interface Emitter extends IEmitter<TEvents> {}
    abstract class Emitter extends Target {
      constructor(...args: any) {
        super(...args);
        if (!EMITTER_MAP.has(this)) {
          EMITTER_MAP.set(this, new Map());
        }
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

    Object.defineProperty(Emitter, 'name', { value: `${Target.name}Emitter` });

    return Emitter;
  };
};
