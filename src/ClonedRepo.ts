import fs from "./fs"
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'

class ClonedRepo {
    #initialized = false
    #initializing = false
    constructor(private a: {url: string, dir: string}) {

    }
    async clear() {
        await removeDirectoryRecursive(this.a.dir)
    }
    async initialize() {
        if (this.#initialized) return
        if (this.#initializing) {
            while (this.#initializing) {
                await sleepMsec(100)
            }
            return
        }
        this.#initializing = true
        const {dir, url} = this.a
        let exists = await checkDirectoryExists(dir)
        if (exists) {
            if (!checkValidRepo(dir)) {
                await removeDirectoryRecursive(this.a.dir)
                exists = false
            }
        }
        if (!exists) {
            console.info(`Cloning ${url} to ${dir}`)
            await git.clone({ fs, http, dir, url, corsProxy: 'https://cors.isomorphic-git.org' })
        }
        exists = await checkDirectoryExists(dir)
        if (!exists) {
            console.warn('Unexpected: directory does not exist after clone.')
            return
        }
        console.info(`Pulling ${dir}`)
        await git.pull({fs, http, dir, author: {name: 'undefined'}})
        this.#initializing = false
        this.#initialized = true
    }
    async readDirectory(d: string) {
        const subdirectories: string[] = []
        const files: string[] = []
        const a = await fs.promises.readdir(d)
        for (let f of a) {
            const p = formPath(d, f)
            const s = await fs.promises.stat(p)
            if (s.isDirectory()) {
                subdirectories.push(f)
            }
            else if (s.isFile()) {
                files.push(f)
            }
        }
        return {subdirectories, files}
    }
    async readTextFile(p: string): Promise<string> {
        const a = await fs.promises.readFile(p, 'utf8')
        return a as string
    }
}

const checkValidRepo = async (dir: string): Promise<boolean> => {
    if (!(await checkDirectoryExists(`${dir}/.git`))) return false
    if (!(await checkFileExists(`${dir}/.git/index`))) return false
    if (!(await checkFileExists(`${dir}/.git/refs/heads/main`))) return false
    return true
}

const checkFileExists = async (f: string): Promise<boolean> => {
	try {
		const s = await fs.promises.stat(f)
		return s.isFile()
	}
	catch(err) {
		return false
	}
}

const checkDirectoryExists = async (dir: string): Promise<boolean> => {
	try {
		const s = await fs.promises.stat(dir)
		return s.isDirectory()
	}
	catch(err) {
		return false
	}
}

function formPath(p1: string, p2: string) {
    if (p1.endsWith('/')) return `${p1}${p2}`
    else return `${p1}/${p2}`
}

async function sleepMsec(msec: number) {
    return new Promise(resolve => {
        setTimeout(resolve, msec)
    })
}

const removeDirectoryRecursive = async (dir: string) => {
	console.info(`Removing directory: ${dir}`)
	if (!dir.endsWith('/')) dir = dir + '/'
	const files = await fs.promises.readdir(dir)
	for (let f of files) {
		const path = `${dir}${f}`
		const ss = await fs.promises.stat(path)
		if (ss.isDirectory()) {
			await removeDirectoryRecursive(path)
		}
		else {
			console.info(`Removing ${path}`)
			await fs.promises.unlink(path)
		}
	}
	if ((dir !== '') && (dir !== '/')) {
		await fs.promises.rmdir(dir)
	}
}

export default ClonedRepo