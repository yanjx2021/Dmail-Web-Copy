import { UserId } from "./authStore";

export class User {
    name = "测试用户"
    avater_path = "" 
}


export class UserStore {

    getUser(userId : UserId) {
        return new User()
    }
}

export const userStore : UserStore = new UserStore()