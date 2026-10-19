/*
 * Minimal store for the fronts without a framework (HTML / CSS / JS, Astro): the Pinia equivalent.
 *   const store = createStore(state, actions)   actions use "this" like in Pinia
 *   store.subscribe((state) => render(state))   called after every change
 */
export const createStore = (state, actions = {}) => {
    const listeners = new Set()
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

    const store = new Proxy({ ...state }, {
        set(target, key, value) {
            target[key] = value
            notify()
            return true
        },
    })

    for (const [name, action] of Object.entries(actions)) store[name] = action.bind(store)
    store.subscribe = (listener) => {
        listeners.add(listener)
        listener(store)
        return () => listeners.delete(listener)
    }
    return store
}
