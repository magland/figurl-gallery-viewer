import { useEffect, useMemo, useState } from "react"
import ClonedRepo from "./ClonedRepo"
import YAML from 'js-yaml'

const R = new ClonedRepo({url: 'https://github.com/scratchrealm/figurl-gallery', dir: '/figurl-gallery'})

export type GalleryExample = {
    title: string
    category: string
    description: string
    image: string
    url: string
}

export type GalleryStatus = 'waiting' | 'loading' | 'loaded'

const useGallery = () => {
    const [initialized, setInitialized] = useState(false)
    const [status, setStatus] = useState<GalleryStatus>('waiting')
    const [examples, setExamples] = useState<GalleryExample[]>([])
    useEffect(() => {
        setStatus('loading')
        ;(async () => {
            // await R.clear()
            await R.initialize()
            const e: GalleryExample[] = []
            async function scanMarkdownFile(p: string) {
                const txt = await R.readTextFile(p)
                const fm = parseFrontMatter(txt.split('\n'))
                if (fm.title) {
                    e.push({
                        title: fm.title,
                        category: fm.category || '',
                        description: fm.description || '',
                        image: fm.image || '',
                        url: `https://doc.figurl.org/gh/scratchrealm/figurl-gallery/blob/main/${p.split('/').slice(2).join('/')}`
                    })
                }
            }
            async function scanDirectory(d: string) {
                const {subdirectories, files} = await R.readDirectory(d)
                for (let s of subdirectories) {
                    await scanDirectory(formPath(d, s))
                }
                for (let f of files) {
                    if (f.endsWith('.md')) {
                        await scanMarkdownFile(formPath(d, f))
                    }
                }
            }
            await scanDirectory('/')
            setExamples(e)
            setInitialized(true)
            setStatus('loaded')
        })()
    }, [])

    return {
        initialized,
        examples,
        status
    }
}

function formPath(p1: string, p2: string) {
    if (p1.endsWith('/')) return `${p1}${p2}`
    else return `${p1}/${p2}`
}

function parseFrontMatter(lines: string[]): {[key: string]: any} {
    const line0 = lines[0]
    if (line0.trim() !== '-' + '--') return {}
    const ind1 = lines.findIndex((v, i) => ((i > 0) && (v.trim() === '-' + '--')))
    if (ind1 < 0) return {}
    const yaml = lines.slice(1, ind1).join('\n')
    try {
        return YAML.load(yaml) || {}
    }
    catch(err) {
        return {}
    }
}

export default useGallery