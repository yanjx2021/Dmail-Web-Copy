import axios from 'axios'
import * as SparkMD5 from 'spark-md5'

export const getFileExtension = (file: File) => {
    const suffix = file.name.split('.').pop()
    return suffix ? '.' + suffix : ''
}

export const uploadFileByAxios = (
    file: File,
    url: string,
    setProgress: (progress: number) => void
) => {
    return axios.put(url, file, {
        headers: {
            'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => setProgress(progressEvent.loaded),
    })
}

export const computeChecksumMd5 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunkSize = 8097152
        const spark = new SparkMD5.ArrayBuffer()
        const fileReader = new FileReader()

        let cursor = 0

        fileReader.onerror = function (): void {
            reject('MD5 computation failed - error reading the file')
        }

        function processChunk(chunk_start: number): void {
            const chunk_end = Math.min(file.size, chunk_start + chunkSize)
            fileReader.readAsArrayBuffer(file.slice(chunk_start, chunk_end))
        }

        fileReader.onload = function (e: any): void {
            spark.append(e.target.result)
            cursor += chunkSize

            if (cursor < file.size) {
                processChunk(cursor)
            } else {
                resolve(spark.end())
            }
        }

        processChunk(0)
    })
}

export const createDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    link.click()
}

export const isImage = (file: File) => {
    if (!/\.(jpg|jpeg|png|GIF|JPG|PNG|gif)$/.test(file.name)) {
        return false
    } else {
        return true
    }
}
