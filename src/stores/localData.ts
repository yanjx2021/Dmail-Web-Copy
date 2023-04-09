import localforage from "localforage"

export class LocalDatabase {
    private static instance : LocalForage = localforage.createInstance(
        { name : "dMail", storeName : "public"})

    static createUserInstance(userId : number) {
        this.instance = localforage.createInstance(
            { name : "dMail", storeName : userId.toString()}
        )
    }
    static Instance() {
        return this.instance
    }

    

    
}
