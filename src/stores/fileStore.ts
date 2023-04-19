import { makeAutoObservable } from "mobx";
import { MessageServer } from "../utils/networkWs";
import { Receive, ReceiveUpdateUserInfoResponseData, ReceiveUserUploadFileRequestResponse, Send, UserUploadFileRequestData } from "../utils/message";
import { computeChecksumMd5, getFileExtension, uploadFileByAxios } from "../utils/file";
import { url } from "inspector";

export type UploadId = number;

export class FileStore {
    private uploadFiles : Map<string, File> = new Map() 

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })

        MessageServer.on(Receive.UploadFileRequestResponse, this.uploadFileRequestResponseHandler)
    }

    async requestUpload(file : File) {
        
        console.log("开始计算MD5")
        const fileMd5 = await computeChecksumMd5(file)
        console.log("MD5计算结束")

        const data : UserUploadFileRequestData = {
            suffix : getFileExtension(file),
            userHash : fileMd5,
            size : file.size
        }
        
        this.uploadFiles.set(fileMd5, file)
        MessageServer.Instance().send(Send.UploadFileRequest, data)
    }

    private uploadFileRequestResponseHandler(response : ReceiveUserUploadFileRequestResponse) {
        console.log(response)

        // TODO : 错误处理

        if (response.state === 'Approve') {
            
            const file = this.uploadFiles.get(response.userHash)
            // TODO : 判空
            uploadFileByAxios(file!, response.url!).then(() => {
                MessageServer.Instance().send(Send.FileUploaded, response.uploadId!)
            })

        } else {
            
        }
    }
}

export const fileStore = new FileStore()