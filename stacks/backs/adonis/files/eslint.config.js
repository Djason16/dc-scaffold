import { configApp } from '@adonisjs/eslint-config'

export default configApp({
  // Same file names in every back end of DC Scaffold (Express, NestJS...): kept as they are
  files: ['app/core/RouteDiscovery.ts', 'app/core/SecurityHelper.ts'],
  rules: { '@unicorn/filename-case': 'off' },
})