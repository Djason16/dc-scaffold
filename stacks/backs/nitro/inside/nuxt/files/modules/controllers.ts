import { existsSync, mkdirSync, readdirSync, watch } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule } from 'nuxt/kit'

// "#controllers" = every *Controller.ts file of server/controllers, so routes never have to be declared by hand
export default defineNuxtModule({
    meta: { name: 'controllers' },
    setup(_options, nuxt) {
        const controllersDir = join(nuxt.options.serverDir, 'controllers')
        if (!existsSync(controllersDir)) mkdirSync(controllersDir, { recursive: true })

        const controllersModule = () => {
            const files = readdirSync(controllersDir).filter((file) => /Controller\.ts$/.test(file) && file !== 'Controller.ts')
            const imports = files.map((file, i) => `import c${i} from '${controllersDir.replace(/\\/g, '/')}/${file}'`)
            const entries = files.map((file, i) => `{ name: '${file.replace(/\.ts$/, '')}', controller: c${i} }`)
            return `${imports.join('\n')}\nexport default [${entries.join(', ')}]`
        }

        nuxt.hook('nitro:config', (config) => {
            config.virtual = { ...config.virtual, '#controllers': controllersModule }
        })

        // Dev only: rebuild the API when a controller file is added or removed
        nuxt.hook('nitro:init', (nitro) => {
            if (!nuxt.options.dev) return
            let timer: NodeJS.Timeout | undefined
            const watcher = watch(controllersDir, () => {
                clearTimeout(timer)
                timer = setTimeout(() => nitro.hooks.callHook('rollup:reload'), 200)
            })
            nuxt.hook('close', () => watcher.close())
        })
    },
})
