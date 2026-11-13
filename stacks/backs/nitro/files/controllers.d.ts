// What "#controllers" holds (nitro.config.ts builds it from every *Controller file of controllers/)
declare module '#controllers' {
    const controllers: { name: string, controller: any }[]
    export default controllers
}
