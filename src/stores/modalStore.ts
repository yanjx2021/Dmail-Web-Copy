import { makeAutoObservable } from "mobx";



export class ModalStore {
    isOpen: boolean = false
    isLoading: boolean = false
    modalType: '' | 'AddFriend' | 'CreateGroup' | 'ChangePassword' |'RemoveSecure' | 'SetSecure' = ''

    handleCancel() {
        this.isOpen = false
    }

    reset() {
        this.isOpen = false
        this.isLoading = false
        this.modalType = ''
    }

    constructor() {
        makeAutoObservable(this, {}, {autoBind: true})
    }
}

export const modalStore = new ModalStore()