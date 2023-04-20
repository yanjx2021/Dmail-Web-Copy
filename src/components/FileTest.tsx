import { observer } from "mobx-react-lite";
import { useState } from "react";
import { computeChecksumMd5 } from "../utils/file";
import { UploadingFile, fileStore } from "../stores/fileStore";



export const FileTest = 
    () => {
        const [file, setFile] = useState<File>()

        function handleChange(event: any) {
            setFile(event.target.files[0])
        }

        function handleUpload() {
            console.log(file)
            file && fileStore.requestUpload(file, (uploadingFile : UploadingFile) => {
                console.log(`下载链接:${uploadingFile.url!}` )
            })
        }

        return (
            <div className="App">
                <input type="file" onChange={handleChange} />
                <button type="submit" onClick={handleUpload}>Upload</button>
            </div>
        );
    }
