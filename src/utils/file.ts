import axios from 'axios';
import * as SparkMD5 from 'spark-md5';

export const getFileExtension = (file : File) => {
    const suffix = file.name.split('.').pop()
    return suffix ? '.' + suffix : "" 
}

export const uploadFileByAxios = (file: File, url: string) => {
  return axios
    .put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    })
}

export const computeChecksumMd5 = (file: File) : Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2097152; // Read in chunks of 2MB
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    let cursor = 0;

    fileReader.onerror = function(): void {
      reject('MD5 computation failed - error reading the file');
    };

    function processChunk(chunk_start: number): void {
      const chunk_end = Math.min(file.size, chunk_start + chunkSize);
      fileReader.readAsArrayBuffer(file.slice(chunk_start, chunk_end));
    }

    fileReader.onload = function(e: any): void {
      spark.append(e.target.result); 
      cursor += chunkSize; 

      if (cursor < file.size) {
        processChunk(cursor);
      } else {
        resolve(spark.end());
      }
    };

    processChunk(0);
  });
}
