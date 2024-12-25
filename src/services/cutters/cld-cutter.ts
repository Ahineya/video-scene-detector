import {ICutter} from "./cutter.interface.ts";
import {FrameData} from "../decoder/decoder.ts";
import {cosineSimilarity} from "../../helpers/cosine-similarity.ts";

export class CLDCutter implements ICutter {
    private SENSITIVITY = 2.2;
    private MIN_SHOT_LENGTH = 10;

    getSimilarities(frames: FrameData[]): number[] {
        const descriptors = frames.map(f => {
            return f.cld!;
        });

        const diffs = [];

        for (let i = 0; i < descriptors.length - 1; i++) {
            const currDescriptor = descriptors[i];
            const nextDescriptor = descriptors[i + 1];

            const diff = cosineSimilarity(currDescriptor, nextDescriptor);

            diffs.push(diff);
        }

        return diffs.slice(1, diffs.length - 1).map((v, i, arr) => {
            if (i === 0) {
                return 0;
            }

            return v - arr[i - 1];
        });
    }

    getCuts(similarities: number[]): number[] {
        const cuts: number[] = [];

        const averageSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
        const stdDeviation = Math.sqrt(similarities.reduce((a, b) => a + (b - averageSimilarity) ** 2, 0) / similarities.length);
        const dynamicThreshold = averageSimilarity - this.SENSITIVITY * stdDeviation;

        similarities.forEach((similarity, i) => {
            if (similarity < dynamicThreshold) {
                cuts.push(i + 1);
            }
        });

        return cuts.filter((cut, i) => {
            if (i === 0) {
                return cut > this.MIN_SHOT_LENGTH;
            }

            return cut - cuts[i - 1] > this.MIN_SHOT_LENGTH;
        });
    }
}