// Every *Controller.ts file of server/controllers, built by modules/controllers.ts
declare module '#controllers' {
    const controllers: { name: string; controller: any }[]
    export default controllers
}
