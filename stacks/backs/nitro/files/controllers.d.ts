// What "#controllers" holds (nitro.config.ts builds it from every *Controller file of controllers/)
declare module '#controllers' {
    const controllers: { name: string, controller: import('./utils/RouteDiscovery').ControllerClass }[]
    export default controllers
}
