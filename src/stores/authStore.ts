import { action, makeAutoObservable } from "mobx";
import localforage from "localforage"
import { LoginResponseState, Receive, ReceiveLoginResponseData, Send } from "../utils/message";
import { MessageServer } from "../utils/networkWs";
import { passwordTester } from "../constants/passwordFormat";
import { SHA256 } from "crypto-js";

export enum AuthState {
    Started,
    Logging,
    Logged
}

export enum AuthMethod {
    Email,
    Password
}

export class AuthStore {
    state : AuthState = AuthState.Started;
    method : AuthMethod = AuthMethod.Password;
    errors : string = "";

    userId : number = 0;
    email : string = "";
    password : string = "";
    emailCode : string = "";

    constructor() {
        makeAutoObservable(this, {}, {autoBind : true})

        MessageServer.on(Receive.LoginResponse, this.loginResponseHandler)
    }

    private loginWithPassword() {
        if (!passwordTester.test(this.password)) {
            this.errors = "密码格式错误: 请输入长度为8-20, 包含数字和字母的密码";
            this.password = ""
            return
        }
        MessageServer.Instance().send<Send.Login>(Send.Login, {
            email: this.email,
            password: SHA256(this.password + "dmail" + this.email).toString(),
        })

        this.state = AuthState.Logging
    }

    private loginWithCode() {
        MessageServer.Instance().send<Send.Login>(Send.Login, {
            email: this.email,
            emailCode: parseInt(this.emailCode),
        })
        this.state = AuthState.Logging
    }

    login() {
        if (this.state === AuthState.Logged) {
            this.errors = "用户已登录"
            return
        }
        if (this.state === AuthState.Logging) {
            this.errors = "正在登录"
            return
        }
        if (this.method === AuthMethod.Email) {
            this.loginWithCode()
        } else {
            this.loginWithPassword()
        }
    }

    toggleLoginMethod() {
        this.method = (this.method === AuthMethod.Email ? AuthMethod.Password : AuthMethod.Email)
    }

    private loginResponseHandler(data : ReceiveLoginResponseData) {
        this.state = AuthState.Started
        this.errors = ""
        switch (data.state) {
            case LoginResponseState.PasswordError:
                this.password = ""
                this.errors = "密码错误，请确认密码"
                break;
            case LoginResponseState.UserNotFound:
                this.email = ""
                this.password = ""
                this.errors = "未找到用户，请确认邮箱"
                break;
            case LoginResponseState.UserLogged:
                this.email = ""
                this.password = ""
                this.errors = "该帐号已登录"
                break;
            case LoginResponseState.Unapproved:
                this.errors = "加密协议尚未握手，请稍等"
                break;
            case LoginResponseState.Success:
                this.state = AuthState.Logged
                this.userId = data.userId!
                console.log("登录成功")
        }
        console.log(this.errors)
    }

}

export const authStore = new AuthStore()