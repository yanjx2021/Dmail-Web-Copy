import { makeAutoObservable } from "mobx";


export class GroupChatManageStore {


    constructor() {
        makeAutoObservable(this, {}, {autoBind: true})
    }
    


}

export const groupChatManageStore = new GroupChatManageStore()