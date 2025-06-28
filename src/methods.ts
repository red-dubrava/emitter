import { MEDIUM_PRIORITY } from './constants';
import { getMapByTarget, sortByPriority } from './helpers';
import type { IEmitter, IEmitterLite, Listener, Options } from './types';

export function addListener<TEvents extends object, TEventName extends keyof TEvents, TContext extends object | undefined>(
  this: IEmitterLite<TEvents>,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName], TContext>,
  options?: Options<TEvents[TEventName], TContext>,
): void {
  const listenerEventNameMap = getMapByTarget<TEvents, TEventName, TContext>(this);
  const listenerMap = listenerEventNameMap.get(eventName);
  if (listenerMap) {
    listenerMap.set(listener, options);
    const sortedListener = Array.from(listenerMap).sort(sortByPriority);
    listenerEventNameMap.set(eventName, new Map(sortedListener));
  } else {
    listenerEventNameMap.set(eventName, new Map([[listener, options]]));
  }
}

export function removeListener<TEvents extends object, TEventName extends keyof TEvents, TContext extends object | undefined>(
  this: IEmitterLite<TEvents>,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName], TContext>,
): void {
  const listenerEventNameMap = getMapByTarget<TEvents, TEventName, TContext>(this);
  const listenerMap = listenerEventNameMap.get(eventName);
  listenerMap?.delete(listener);
  if (!listenerMap?.size) listenerEventNameMap.delete(eventName);
}

export function emit<TEvents extends object, TEventName extends keyof TEvents>(
  this: IEmitterLite<TEvents>,
  eventName: TEventName,
  data: TEvents[TEventName],
): boolean {
  const listenerEventNameMap = getMapByTarget<TEvents, TEventName, object | undefined>(this);
  const listenerMap = listenerEventNameMap.get(eventName);
  if (!listenerMap) return false;
  let hasListener = false;
  for (const [listener, options] of listenerMap.entries()) {
    const { priority = MEDIUM_PRIORITY, context, guard, once } = options ?? {};
    if (!(guard?.(data) ?? true)) continue;
    hasListener = true;
    if (once) {
      listenerMap.delete(listener);
      if (!listenerMap.size) listenerEventNameMap.delete(eventName);
    }
    listener({ eventName, listener, priority, data, context });
  }
  return hasListener;
}

export function hasListener<TEvents extends object, TEventName extends keyof TEvents, TContext extends object | undefined>(
  this: IEmitterLite<TEvents>,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName], TContext>,
): boolean {
  const listenerEventNameMap = getMapByTarget<TEvents, TEventName, TContext>(this);
  const listenerMap = listenerEventNameMap.get(eventName);
  return listenerMap?.has(listener) ?? false;
}

export function removeAllListeners<TEvents extends object>(this: IEmitterLite<TEvents>, eventName?: keyof TEvents): void {
  const listenerEventNameMap = getMapByTarget(this);
  if (eventName) {
    listenerEventNameMap.delete(eventName);
  } else {
    listenerEventNameMap.clear();
  }
}

export function getListenersByName<TEvents extends object, TEventName extends keyof TEvents, TContext extends object | undefined>(
  this: IEmitterLite<TEvents>,
  eventName: TEventName,
): Iterable<Listener<TEventName, TEvents[TEventName], TContext>> {
  const listenerEventNameMap = getMapByTarget<TEvents, TEventName, TContext>(this);
  const listenerMap = listenerEventNameMap.get(eventName);
  return listenerMap?.keys() ?? [];
}

export function getEventNames<TEvents extends object, TEventName extends keyof TEvents>(this: IEmitterLite<TEvents>): Iterable<TEventName> {
  const listenerEventNameMap = getMapByTarget<TEvents, TEventName, object | undefined>(this);
  return listenerEventNameMap.keys();
}

export function on<
  TEvents extends object,
  TEmitter extends IEmitterLite<TEvents> & Pick<IEmitter<TEvents>, 'addListener'>,
  TEventName extends keyof TEvents,
  TContext extends object | undefined,
>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName], TContext>,
  options?: Options<TEvents[TEventName], TContext>,
): TEmitter {
  this.addListener(eventName, listener, { ...options, once: false });
  return this;
}

export function once<
  TEvents extends object,
  TEmitter extends IEmitterLite<TEvents> & Pick<IEmitter<TEvents>, 'addListener'>,
  TEventName extends keyof TEvents,
  TContext extends object | undefined,
>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName], TContext>,
  options?: Omit<Options<TEvents[TEventName], TContext>, 'once'>,
): TEmitter {
  this.addListener(eventName, listener, { ...options, once: true });
  return this;
}

export function off<
  TEvents extends object,
  TEmitter extends IEmitterLite<TEvents> & Pick<IEmitter<TEvents>, 'removeListener'>,
  TEventName extends keyof TEvents,
  TContext extends object | undefined,
>(this: TEmitter, eventName: TEventName, listener: Listener<TEventName, TEvents[TEventName], TContext>): TEmitter {
  this.removeListener(eventName, listener);
  return this;
}
