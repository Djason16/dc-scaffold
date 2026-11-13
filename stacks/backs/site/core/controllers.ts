// Every *Controller.ts (or .js) file of controllers/, found by the build tool: routes never have to be declared by hand.
// A new controller file is picked up by itself, also while "npm run dev" runs.
const modules = import.meta.glob<{ default: any }>('./controllers/*Controller.{js,ts}', { eager: true })

export const controllers = Object.entries(modules).map(([path, module]) => ({
    name: (path.split('/').pop() ?? '').replace(/\.[jt]s$/, ''),
    controller: module.default,
}))
