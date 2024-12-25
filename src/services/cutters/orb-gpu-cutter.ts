import {ICutter} from "./cutter.interface.ts";
import {FrameData} from "../decoder/decoder.ts";
import {GpuMatcher} from "./gpu-matcher/gpu-matcher.ts";

const gpuMatcher = new GpuMatcher();

export class ORBGPUCutter implements ICutter {
    private SENSITIVITY = 1.2;
    private MIN_SHOT_LENGTH = 10;

    getSimilarities(frames: FrameData[]): number[] {
        const descriptors = frames.map(f => {
            return f.orb!;
        });

        const neighbors = gpuMatcher.match(descriptors);

        const similarities = neighbors.slice(1, neighbors.length - 1).map(n => 1 / ((n || 1) + 0.00001)) // Better to normalize here
            .map((v, i, arr) => {
                if (i === 0) {
                    return 0;
                }

                return v - arr[i - 1];
            });

        return similarities;
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