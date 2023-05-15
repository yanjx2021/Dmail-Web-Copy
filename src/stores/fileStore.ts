import { action, makeAutoObservable } from "mobx";
import { MessageServer } from "../utils/networkWs";
import { Receive, ReceiveGetFileUrlResponse, ReceiveUserFileUploadedResponse, ReceiveUserUploadFileRequestResponse, Send, UserUploadFileRequestData } from "../utils/message";
import { computeChecksumMd5, getFileExtension, uploadFileByAxios } from "../utils/file";

export type UploadId = number;

export enum UploadState {
    Hashing,
    WaitingApprove,
    Uploading,
    WaitingServerCheck,
    Uploaded,
    Success,
    Failed,
}

export class UploadingFile {
    state : UploadState = UploadState.Hashing
    progress : number = 0
    file : File 
    hash? : string
    url? : string
    uploadedCallback : (arg0: UploadingFile) => void

    constructor(file : File, uploadedCallback : (arg0: UploadingFile) => void) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.file = file
        this.uploadedCallback = uploadedCallback
    }

    setProgress(progress : number) {
        this.progress = progress / this.file.size
    }
}


export class FileStore {
    private uploadFiles : Map<string, UploadingFile> = new Map() 
    private uploadFilesById : Map<number, UploadingFile> = new Map()

    private getUrlCallback : Map<string, (url : string) => void> = new Map()

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })

        MessageServer.on(Receive.UploadFileRequestResponse, this.uploadFileRequestResponseHandler)
        MessageServer.on(Receive.FileUploadedResponse, this.fileUploadedResponseHandler)
        MessageServer.on(Receive.GetFileUrlResponse, this.GetFileUrlResponseHandler)
    }

    getFileUrl(hash : string, callback : (url : string) => void) {
        this.getUrlCallback.set(hash, callback)
        MessageServer.Instance().send(Send.GetFileUrl, hash)
    }

    requestUpload(file : File, uploadedCallback : (uploadingFile : UploadingFile) => void) {
        const uploadingFile = new UploadingFile(file, uploadedCallback)

        computeChecksumMd5(file).then(action((fileMd5) => {
            const data : UserUploadFileRequestData = {
                suffix : getFileExtension(file),
                userHash : fileMd5,
                size : file.size
            }
            uploadingFile.hash = fileMd5
            uploadingFile.state = UploadState.WaitingApprove
            
            this.uploadFiles.set(fileMd5, uploadingFile)
            MessageServer.Instance().send(Send.UploadFileRequest, data)
        })).catch(action((err) => {
            console.error("MD5 计算失败")
            uploadingFile.state = UploadState.Failed
        })) 

        return uploadingFile
    }

    private GetFileUrlResponseHandler(response : ReceiveGetFileUrlResponse) {
        if (response.state !== "Success") {
            console.error(`获取Url失败 ${response.state}`)
            return
        }

        const callback = this.getUrlCallback.get(response.hash)

        if (!callback) {
            return
        }

        callback(response.url!)

        this.getUrlCallback.delete(response.hash)
    }

    private uploadFileRequestResponseHandler(response : ReceiveUserUploadFileRequestResponse) {
        const uploadingFile = this.uploadFiles.get(response.userHash)

        if (!uploadingFile) {
            console.error("Uploading File 不存在")
            return
        }

        if (uploadingFile.state !== UploadState.WaitingApprove) {
            console.error("Uploading 状态异常")
            return
        }

        if (response.state === 'Approve') {
            // TODO : 判空
            uploadFileByAxios(uploadingFile.file, response.url!, uploadingFile.setProgress).then(action(() => {
                this.uploadFilesById.set(response.uploadId!, uploadingFile)
                uploadingFile.state = UploadState.WaitingServerCheck
                MessageServer.Instance().send(Send.FileUploaded, response.uploadId!)
            })).catch(action((err) => {
                console.error(`Upload 失败 ${err}`)
                uploadingFile.state = UploadState.Failed
            }))
        } else if (response.state === 'Existed') {
            // TODO 
            uploadingFile.state = UploadState.Success
            uploadingFile.url = response.url!
            uploadingFile.uploadedCallback(uploadingFile)
            
        } else {
            console.error(`请求被服务器拒绝 : ${response.state}`)
            uploadingFile.state = UploadState.Failed
        }
    }

    private fileUploadedResponseHandler(response : ReceiveUserFileUploadedResponse) {
        const uploadingFile = this.uploadFilesById.get(response.uploadId)

        if (!uploadingFile) {
            console.error("Uploading File 不存在")
            return
        }

        if (uploadingFile.state !== UploadState.WaitingServerCheck) {
            console.error("Uploading 状态异常")
            return
        }

        if (response.state === 'Success') {
            console.log(`${uploadingFile.file.name} 上传成功`)
            uploadingFile.state = UploadState.Success
            uploadingFile.url = response.url!
            uploadingFile.uploadedCallback(uploadingFile)
        } else {
            // TODO 
            console.error(`请求被服务器拒绝 : ${response.state}`)
            uploadingFile.state = UploadState.Failed
        }

    }
}

export const fileStore = new FileStore()