import { Module } from '@nestjs/common'
import { RoutesController } from './routes.controller.js'

/*
 * Root module of the API: the routes of routes.controller.ts.
 * Nest modules and controllers of your own go here too, before RoutesController
 * (it answers every address the other ones do not know).
 */
@Module({
    imports: [],
    controllers: [RoutesController],
    providers: [],
})
export class AppModule {}
