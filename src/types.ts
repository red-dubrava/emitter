import type { HIGH_PRIORITY, LOW_PRIORITY, MEDIUM_PRIORITY } from './constants';

export type Priority = typeof LOW_PRIORITY | typeof MEDIUM_PRIORITY | typeof HIGH_PRIORITY;

export type Listener<TEventName extends PropertyKey, TData, TContext extends object | undefined = undefined> = (
  eventData: TData,
  eventObject: EventObject<TEventName, TData, TContext>,
) => void;

export type Guard<TData> = (eventData: TData) => boolean;

export interface EventObject<TEventName extends PropertyKey, TData, TContext extends object | undefined = undefined> {
  readonly eventName: TEventName;
  readonly listener: Listener<TEventName, TData>;
  readonly priority: Priority;
  readonly context: NoInfer<TContext>;
}

export interface Options<TData, TContext extends object | undefined = undefined> {
  readonly once?: boolean;
  readonly priority?: Priority;
  readonly guard?: Guard<TData>;
  readonly context?: TContext extends undefined ? never : TContext;
}

export interface IEmitterLite<TEvents extends object> {
  on<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Omit<Options<TEvents[TEventName], TContext>, 'once'>,
  ): this;
  once<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Omit<Options<TEvents[TEventName], TContext>, 'once'>,
  ): this;
  off<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): this;
}

export interface IEmitter<TEvents extends object> extends IEmitterLite<TEvents> {
  emit<TEventName extends keyof TEvents>(
    ...args: TEvents[TEventName] extends undefined ? [eventName: TEventName] : [eventName: TEventName, eventData: TEvents[TEventName]]
  ): boolean;
  addListener<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Options<TEvents[TEventName], TContext>,
  ): void;
  removeListener<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): void;
  hasListener<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    name: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): boolean;
  removeAllListeners(eventName?: keyof TEvents): void;
  getListenersByName<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
  ): Iterable<Listener<TEventName, TEvents[TEventName], TContext>>;
  getEventNames<TEventName extends keyof TEvents>(): Iterable<TEventName>;
}
