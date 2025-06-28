import { EMITTER_MAP, HIGH_PRIORITY, LOW_PRIORITY } from './constants';
import type { IEmitterLite, Listener, Options, Priority } from './types';

export type PrioritySortingParams = [unknown, { priority?: Priority }?];

export type ListenerMap<TEventName extends PropertyKey, TData, TContext extends object | undefined> = Map<
  Listener<TEventName, TData, TContext>,
  Options<TData, TContext> | undefined
>;

export type ListenerEventNameMap<TEventName extends PropertyKey, TData, TContext extends object | undefined> = Map<
  TEventName,
  ListenerMap<TEventName, TData, TContext>
>;

export const getPriorityValue = (priority?: Priority) => {
  return priority === HIGH_PRIORITY ? -1 : priority === LOW_PRIORITY ? 1 : 0;
};

export const sortByPriority = ([, a]: PrioritySortingParams, [, b]: PrioritySortingParams): number => {
  return getPriorityValue(a?.priority) - getPriorityValue(b?.priority);
};

export const getMapByTarget = <TEvents extends object, TEventName extends keyof TEvents, TContext extends object | undefined>(
  target: IEmitterLite<TEvents>,
): ListenerEventNameMap<TEventName, TEvents[TEventName], TContext> => {
  let listenerEventNameMap = EMITTER_MAP.get(target) as ListenerEventNameMap<TEventName, TEvents[TEventName], TContext> | undefined;
  if (!listenerEventNameMap) {
    listenerEventNameMap = new Map();
    EMITTER_MAP.set(target, listenerEventNameMap);
  }
  return listenerEventNameMap;
};
