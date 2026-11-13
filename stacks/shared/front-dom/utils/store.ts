/*
 * Minimal store for the fronts without a framework (HTML / CSS / JS, Astro): the Pinia equivalent.
 *   const store = createStore(state, actions)   actions use "this" like in Pinia
 *   store.subscribe((state) => render(state))   called after every change
 */
// The state, its actions (bound to the store) and subscribe()
export type Store<State, Actions> = State & Actions & { subscribe: (listener: (store: Store<State, Actions>) => void) => () => boolean }

export const createStore = <State extends object, Actions extends Record<string, (...args: any[]) => any>>(state: State, actions = {} as Actions) => {
    const listeners = new Set<(store: Store<State, Actions>) => void>()
    let queued = false

    // Several changes in one action = one notification
    const notify = () => {
        if (queued) return
        queued = true
        queueMicrotask(() => {
            queued = false
            listeners.forEach((listener) => listener(store))
        })
    }

    const store = new Proxy({ ...state } as Store<State, Actions>, {
        set(target, key, value) {
            (target as Record<string | symbol, unknown>)[key] = value
            notify()
            return true
        },
    })

    for (const [name, action] of Object.entries(actions)) (store as Record<string, unknown>)[name] = action.bind(store)
    store.subscribe = (listener) => {
        listeners.add(listener)
        listener(store)
        return () => listeners.delete(listener)
    }
    return store
}
