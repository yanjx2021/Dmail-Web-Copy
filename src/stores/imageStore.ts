import { changeConfirmLocale } from "antd/es/modal/locale";
import { makeAutoObservable } from "mobx";
import { isMainThread } from "worker_threads";
import { LocalDatabase } from "./localData";


export class CachedImage {

    url : string

    constructor() {
        makeAutoObservable(this)
        this.url = ""
    }
}

export class ImageStore {
    private imageUrls : Map<string, CachedImage> = new Map()
    
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    getImageUrl(hash : string) {
        const cached = this.imageUrls.get(hash)
        
        if (cached) {
            return cached
        }

        const newCached = new CachedImage()
        this.imageUrls.set(hash, newCached)
        LocalDatabase.loadImageBlob(hash)

        return newCached
    }

    setImageUrl(hash : string, url : string) {
        // 一定会先调用Get，创建CachedImage对象后再调用Set
        this.imageUrls.get(hash)!.url = url
    }
}

export const imageStore : ImageStore = new ImageStore() 