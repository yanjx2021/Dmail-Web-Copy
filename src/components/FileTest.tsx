import { observer } from "mobx-react-lite";
import { useState } from "react";
import { computeChecksumMd5 } from "../utils/file";
import { fileStore } from "../stores/fileStore";



export const FileTest = observer(
    () => {
        const [file, setFile] = useState<File>()

        function handleChange(event: any) {
            setFile(event.target.files[0])
        }

        function handleUpload() {
            console.log(file)
            file && fileStore.requestUpload(file).catch((err) => console.log(err))
        }

        return (
            <div className="App">
                <input type="file" onChange={handleChange} />
                <button type="submit" onClick={handleUpload}>Upload</button>
            </div>
        );
    }
)