import {FrameData} from "../decoder/decoder.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cv from "@techstark/opencv-js";

export class ORB {
    static createOrb(frame: FrameData): number[][] {
        const imgData = new ImageData(frame.data, frame.width, frame.height);

        // Load image data into OpenCV
        const orig = cv.matFromImageData(imgData);

        const orb = new cv.ORB(512);
        const noArray = new cv.Mat();
        const refDescr = new cv.Mat();
        const refKeyPts = new cv.KeyPointVector();

        orb.detectAndCompute(orig, noArray, refKeyPts, refDescr);

        // Descriptor to JavaScript array
        const refDescrArray: number[][] = [];
        for (let i = 0; i < refDescr.size().height; i++) {
            refDescrArray.push(Array.from(refDescr.row(i).data32S as Int32Array));
        }

        // Free OpenCV memory
        orig.delete();
        orb.delete();
        noArray.delete();
        refDescr.delete();
        refKeyPts.delete();

        return refDescrArray;
    }
}
