import { observer } from 'mobx-react-lite'

import { action } from 'mobx'
import { fileStore, UploadingFile } from '../../stores/fileStore'

import { ChatMessageFileInfo } from '../../stores/chatStore'
import { createDownload } from '../../utils/file'
import {  Progress  } from 'antd'

export const filterSize = (size: number) => {
    function pow1024(num: number) {
        return Math.pow(1024, num)
    }

    if (!size) return ''
    if (size < pow1024(1)) return size.toFixed(0) + ' B'
    if (size < pow1024(2)) return (size / pow1024(1)).toFixed(0) + ' KB'
    if (size < pow1024(3)) return (size / pow1024(2)).toFixed(0) + ' MB'
    if (size < pow1024(4)) return (size / pow1024(3)).toFixed(0) + ' GB'
    return (size / pow1024(4)).toFixed(2) + ' TB'
}

export const FileItem = observer(({ fileInfo }: { fileInfo: ChatMessageFileInfo }) => {
    // TODO-在这里添加删除消息的函数
    return (
        <div className="attachment">
            <div className="media mt-2">
                <div
                    className="avatar me-2"
                    onClick={action(() =>
                        fileStore.getFileUrl(fileInfo.hash, (url) =>
                            createDownload(url, fileInfo.name)
                        )
                    )}>
                    <div className="avatar rounded no-image orange">
                        <i className="zmdi zmdi-file"></i>
                    </div>
                </div>
                <div className="media-body overflow-hidden">
                    <h6 className="text-truncate mb-0">{fileInfo.name}</h6>
                    <span className="file-size">{filterSize(fileInfo.size)}</span>
                </div>
            </div>
        </div>
    )
})

export const LoadingFileItem = observer(({ bindUploading }: { bindUploading: UploadingFile }) => {
    // TODO-在这里添加删除消息的函数
    return (
        <div className="attachment">
            <div className="media mt-2">
                <div className="avatar me-2">
                    <div className="avatar rounded no-image orange">
                        <i className="zmdi zmdi-file"></i>
                    </div>
                </div>
                <div className="media-body">
                    <h6 className="text-truncate mb-0">文件正在上传中</h6>
                    <Progress percent={Math.floor(bindUploading.progress*10000)/100} />
                </div>
            </div>
        </div>
    )
})
