// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dct from 'dct';
import {FrameData} from "../decoder/decoder.ts";

const QUANTIZATION_TABLE = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99];

export class CLD {
    /*
    In the real world you would use not RGB but YCbCr color space here,
    but for the sake of simplicity we will use RGB. Still works fine.
     */
    static createCLD(
        frameData: FrameData,
        gridWidth = 8,
        gridHeight = 8,
        quantizationTable = QUANTIZATION_TABLE
    ) {
        const downsampled = CLD.downsample(frameData, gridWidth, gridHeight);
        const transformed = CLD.applyDCT(downsampled);
        const quantized = CLD.quantize(transformed, quantizationTable);

        return quantized;
    }

    static downsample(colorPlane: FrameData, gridWidth: number, gridHeight: number) {
        const blockWidth = Math.ceil(colorPlane.width / gridWidth);
        const blockHeight = Math.ceil(colorPlane.height / gridHeight);

        const downsampled = [];

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                let sum = 0;
                let count = 0;

                for (let j = y * blockHeight; j < (y + 1) * blockHeight && j < colorPlane.height; j++) {
                    for (let i = x * blockWidth; i < (x + 1) * blockWidth && i < colorPlane.width; i++) {
                        const idx = j * colorPlane.width + i;
                        sum += colorPlane.data[idx];
                        count++;
                    }
                }

                downsampled.push(sum / count);
            }
        }

        return downsampled;
    }

    static applyDCT(downsampled: number[]): number[] {
        return dct(downsampled);
    }

    static quantize(transformed: number[], quantizationTable: number[]) {
        const quantized = [];

        for (let i = 0; i < transformed.length; i++) {
            quantized.push(Math.round(transformed[i] / quantizationTable[i]));
        }

        return quantized;
    }
}
