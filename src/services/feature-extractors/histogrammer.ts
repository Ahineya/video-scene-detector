import {FrameData} from "../decoder/decoder.ts";

export class Histogrammer {
    static createHistogram(frame: FrameData, bins = 20): number[] {
        const data = frame.data;
        const histogram = new Array(bins).fill(0);

        const grayscaleData = new Uint8ClampedArray(data.length / 4);
        for (let i = 0; i < data.length; i += 4) {
            grayscaleData[i / 4] = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3) || 0;
        }

        for (let i = 0; i < grayscaleData.length; i++) {
            const bin = Math.floor((grayscaleData[i] / 255) * bins);

            const targetBin = bin >= bins
                ? bins - 1
                : bin;

            histogram[targetBin]++;
        }

        return histogram;
    }
}
