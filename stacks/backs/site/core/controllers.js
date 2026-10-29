// Every *Controller.js file of controllers/, found by the build tool: routes never have to be declared by hand.
// A new controller file is picked up by itself, also while "npm run dev" runs.
/** @type {Record<string, { default: any }>} */
const modules = import.meta.glob('./controllers/*Controller.js', { eager: true })

export const controllers = Object.entries(modules).map(([path, module]) => ({
    name: (path.split('/').pop() ?? '').replace(/\.js$/, ''),
    controller: module.default,
}))
