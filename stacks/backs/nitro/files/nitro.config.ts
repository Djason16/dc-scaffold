import { existsSync, mkdirSync, readdirSync, watch } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineNitroConfig } from 'nitropack/config'

const controllersDir = fileURLToPath(new URL('./controllers', import.meta.url))
if (!existsSync(controllersDir)) mkdirSync(controllersDir)

// "#controllers" = every *Controller.ts file, so routes never have to be declared by hand
const controllersModule = () => {
    const files = readdirSync(controllersDir).filter((file) => /Controller\.ts$/.test(file) && file !== 'Controller.ts')
    const imports = files.map((file, i) => `import c${i} from '${controllersDir.replace(/\\/g, '/')}/${file}'`)
    const entries = files.map((file, i) => `{ name: '${file.replace(/\.ts$/, '')}', controller: c${i} }`)
    return `${imports.join('\n')}\nexport default [${entries.join(', ')}]`
}

export default defineNitroConfig({
    compatibilityDate: '2025-07-15',
    errorHandler: '~/error',
    virtual: {
        '#controllers': controllersModule,
    },
    modules: [
        // Dev only: rebuild when a controller file is added or removed
        (nitro) => {
            if (!nitro.options.dev) return
            let timer: NodeJS.Timeout | undefined
            watch(controllersDir, () => {
                clearTimeout(timer)
                timer = setTimeout(() => nitro.hooks.callHook('rollup:reload'), 200)
            })
        },
    ],
})
