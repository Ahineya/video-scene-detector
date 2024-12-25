type MP4ArrayBuffer = ArrayBuffer & {fileStart: number};

export function readFileAsMp4Buffer(file: File): Promise<MP4ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {
            (reader.result as unknown as MP4ArrayBuffer).fileStart = 0;
            resolve(reader.result as unknown as MP4ArrayBuffer);
        }

        reader.onerror = function () {
            reject(reader.error);
        }

        reader.readAsArrayBuffer(file);
    });
}
