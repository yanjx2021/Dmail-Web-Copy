import { makeAutoObservable } from 'mobx'
import { LocalDatabase } from './localData'

export class CachedBinary {
    url: string
    size: number

    constructor() {
        makeAutoObservable(this)
        this.url = ''
        this.size = 0
    }
}

export class BinaryStore {
    private binaryUrls: Map<string, CachedBinary> = new Map()

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    getBinaryUrl(hash: string) {
        const cached = this.binaryUrls.get(hash)

        if (cached) {
            return cached
        }

        const newCached = new CachedBinary()
        this.binaryUrls.set(hash, newCached)
        LocalDatabase.loadBlob(hash)

        return newCached
    }

    setBinaryUrl(hash: string, url: string, size: number) {
        // 一定会先调用Get，创建CachedImage对象后再调用Set
        const cached = this.binaryUrls.get(hash)!
        cached.url = url
        cached.size = size
    }
}

export const binaryStore: BinaryStore = new BinaryStore()
