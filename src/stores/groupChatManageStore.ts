import { makeAutoObservable } from 'mobx'
import { MessageServer } from '../utils/networkWs'
import {
    Receive,
    ReceiveGetGroupAdminResponseData,
    ReceiveGetGroupOwnerResponseData,
    ReceiveGetGroupUsersResponseData,
    ReceiveGroupOwnerTransferResponseData,
    ReceiveRemoveGroupMemberResponseData,
    ReceiveSetGroupAdminResponseData,
    Send,
} from '../utils/message'
import { chatStore } from './chatStore'

export class GroupChatManageStore {
    errors: string = ''

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.GetGroupOwnerResponse, this.getGroupOwnerResponseHandler)
        MessageServer.on(Receive.GetGroupUsersResponse, this.GetGroupUsersResponseHandler)
        MessageServer.on(Receive.GetGroupAdminResponse, this.GetGroupAdminResponseHandler)
        MessageServer.on(Receive.SetGroupAdminResponse, this.SetGroupAdminResponseHandler)
        MessageServer.on(Receive.RemoveGroupMemberResponse, this.RemoveGroupMemberResponseHandler)
        MessageServer.on(Receive.GroupOwnerTransferResponse, this.GroupOwnerTransferResponseHandler)
    }

    sendSetGroupAdmin(userId: number, chatId: number) {
        MessageServer.Instance().send<Send.SetGroupAdmin>(Send.SetGroupAdmin, {
            userId,
            chatId,
        })
    }

    sendGroupOwnerTransfer(userId: number, chatId: number) {
        MessageServer.Instance().send<Send.GroupOwnerTransfer>(Send.GroupOwnerTransfer, {
            userId,
            chatId
        })
    }

    sendRemoveGroupMember(userId: number, chatId: number) {
        MessageServer.Instance().send<Send.RemoveGroupMember>(Send.RemoveGroupMember, {
            userId,
            chatId
        })
    }

    GroupOwnerTransferResponseHandler(response: ReceiveGroupOwnerTransferResponseData) {
        switch (response.state) {
            case "Success":
                chatStore.getChat(response.chatId!).ownerId = response.userId!
                break
            case 'UserNotInChat':
                this.errors = '用户不在群聊中'
                break
            case 'DatabaseError':
                this.errors = '数据库异常'
                break
            case 'NotOwner':
                this.errors = '你不是群主，无权移交群主'
                break
            case 'ServerError':
                this.errors = '服务器异常'
                break
            default:
                this.errors = '未知错误'
                break
        }
    }

    RemoveGroupMemberResponseHandler(response: ReceiveRemoveGroupMemberResponseData) {
        switch (response.state) {
            case 'Success':
                chatStore.getChat(response.chatId!).removeGroupChatMember(response.userId!)
                break
            case 'NoPermission':
                this.errors = '权限不足'
                break
            case 'DatabaseError':
                this.errors = '数据库异常'
                break
            case 'SameUser':
                this.errors = '不能踢出自己'
                break
            case 'UserNotInChat':
                this.errors = '用户不在群聊中'
                break
            case 'ServerError':
                this.errors = '服务器异常'
                break
            default:
                this.errors = '未知错误'
                break
        }
    }

    SetGroupAdminResponseHandler(response: ReceiveSetGroupAdminResponseData) {
        switch (response.state) {
            case 'Success':
                console.log('haha')
                chatStore.getChat(response.chatId!).addGroupChatAdminId(response.userId!)
                break
            case 'AlreadyAdmin':
                this.errors = '该用户已经是管理员了'
                break
            case 'DatabaseError':
                this.errors = '数据库异常'
                break
            case 'NotOwner':
                this.errors = '权限不足: 你不是群主'
                break
            case 'ServerError':
                this.errors = '服务器异常'
                break
            case 'UserNotInChat':
                this.errors = '该用户不在群聊中'
                break
            default:
                this.errors = '未知错误'
        }
    }

    private GetGroupAdminResponseHandler(response: ReceiveGetGroupAdminResponseData) {
        switch (response.state) {
            case 'Success':
                chatStore.getChat(response.chatId!).setGroupChatAdminIds(response.userIds!)
                break
            case 'UserNotInChat':
                this.errors = '无权拉取管理员信息'
                break
            case 'ServerError':
                this.errors = '服务器异常'
                break
            default:
                console.log('群聊用户列表异常错误')
        }
    }

    private GetGroupUsersResponseHandler(response: ReceiveGetGroupUsersResponseData) {
        switch (response.state) {
            case 'Success':
                chatStore.getChat(response.chatId!).setGroupChatUserIds(response.userIds!)
                break
            case 'NotGroupChat':
                this.errors = '私聊用户列表不存在'
                break
            case 'ServerError':
                this.errors = '服务器异常'
                break
            default:
                console.log('群聊用户列表异常错误')
        }
    }

    private getGroupOwnerResponseHandler(response: ReceiveGetGroupOwnerResponseData) {
        switch (response.state) {
            case 'Success':
                chatStore.getChat(response.chatId!).setGroupChatOwnerId(response.userId!)
                break
            case 'UserNotInChat':
                this.errors = '无权拉取群主信息'
                break
            case 'DatabaseError':
                this.errors = '数据库异常'
                break
            case 'ServerError':
                this.errors = '服务器异常'
                break
            default:
                this.errors = '未知错误'
        }
    }
    sendGetGroupManage(chatId: number) {
        MessageServer.Instance().send<Send.GetGroupUsers>(Send.GetGroupUsers, chatId)
        MessageServer.Instance().send<Send.GetGroupOwner>(Send.GetGroupOwner, chatId)
        MessageServer.Instance().send<Send.GetGroupAdmin>(Send.GetGroupAdmin, chatId)
    }
}

export const groupChatManageStore = new GroupChatManageStore()
