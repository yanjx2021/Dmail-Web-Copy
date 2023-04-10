import { UserId } from "./authStore";

export class User {
    name = "测试用户"
    avater_path = "" 

    constructor(userId : number) {
        this.name = `用户${userId}`
    }
}


export class UserStore {

    getUser(userId : UserId) {
        return new User(userId)
    }
}

export const userStore : UserStore = new UserStore()