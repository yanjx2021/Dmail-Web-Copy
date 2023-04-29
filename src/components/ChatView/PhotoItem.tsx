import { observer } from 'mobx-react-lite'

import { action } from 'mobx'
import { fileStore, UploadingFile } from '../../stores/fileStore'

import { CachedBinary } from '../../stores/binaryStore'
import { Progress, Image } from 'antd'

export const PhotoItem = observer(({ cachedUrl }: { cachedUrl: CachedBinary }) => {
    // TODO-在这里添加删除消息的函数
    return (
        <div className="attachment right-file">
            <Image className="rounded mt-1" src={cachedUrl.url} alt="" />
        </div>
    )
})

export const LoadingPhotoItem = observer(({ bindUploading }: { bindUploading: UploadingFile }) => {
    // TODO-在这里添加删除消息的函数
    return (
        <div className="attachment right-file">
            <Progress
                type="circle"
                size="small"
                percent={Math.floor(bindUploading.progress * 100)}
            />
        </div>
    )
})
