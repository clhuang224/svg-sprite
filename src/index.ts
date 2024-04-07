import { PluginOption } from 'vite'
import svgSpriter from 'svg-sprite'
import fs from 'node:fs'
import path from 'node:path'
import { globSync } from 'glob'

const VIRTUAL_ID = 'virtual:svg-sprite'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

export default (options: { sourceDir: string, fileName: string }): PluginOption => {
    return {
        name: 'svg-sprite',
        resolveId(id) {
            if (id === VIRTUAL_ID) {
                return RESOLVED_ID
            }
        },
        load(id) {
            if (id === RESOLVED_ID) {
                return `./assets/${options.fileName}`
            }
        },
        generateBundle() {
            const svgFiles = globSync(path.resolve(options.sourceDir, '**/*.svg'))
            if (!svgFiles.length) return
            const spriter = new svgSpriter({})
            for (const svgFile in svgFiles) {
                spriter.add(svgFile, null, fs.readFileSync(svgFile, { encoding: 'utf-8' }))
            }
            spriter.compile((error, result) => {
                if (error) {
                    console.error(error)
                    return
                }
                this.emitFile({
                    type: 'asset',
                    fileName: options.fileName,
                    source: result.contents
                })
            })
        }
    }
}
