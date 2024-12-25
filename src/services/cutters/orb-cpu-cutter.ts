import {ICutter} from "./cutter.interface.ts";
import {FrameData} from "../decoder/decoder.ts";
import {hammingDistance} from "../../helpers/fast-hamming-distance.ts";

export class ORBCpuCutter implements ICutter {
    private SENSITIVITY = 3.2;
    private MIN_SHOT_LENGTH = 10;

    getSimilarities(frames: FrameData[]): number[] {
        const descriptors = frames.map(f => {
            return f.orb!;
        });

        const neighbors = [];

        for (let i = 0; i < descriptors.length - 1; i++) {
            const currentCLD = descriptors[i];
            const nextCLD = descriptors[i + 1];

            console.log(`Comparing ${i} and ${i + 1} of ${descriptors.length}`);

            const currentNeighbors = ORBCpuCutter.compareOrbDescriptors(currentCLD, nextCLD);

            neighbors.push(currentNeighbors);
        }

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

    static compareOrbDescriptors(points1: number[][], points2: number[][]) {
        const [biggerDescriptors, smallerDescriptors] = points1.length > points2.length
            ? [points1, points2]
            : [points2, points1];

        /*
            Descriptor is an array of 8 Int32 numbers.
            We need to compare each number with the same number from the other descriptor, calculating the hamming distance.
         */

        let neighbors = 0;

        for (let bdi = 0; bdi < biggerDescriptors.length; bdi++) {
            let distance1 = Infinity;
            let distance2 = Infinity;

            let foundNeighbor = false;

            for (let sdi = 0; sdi < smallerDescriptors.length; sdi++) {
                const descriptor1 = biggerDescriptors[bdi];
                const descriptor2 = smallerDescriptors[sdi];

                let hamming = 0;

                for (let j = 0; j < 8; j++) {
                    hamming += hammingDistance(descriptor1[j], descriptor2[j]);
                }

                if (hamming < distance1) {
                    distance2 = distance1;
                    distance1 = hamming;
                    foundNeighbor = true;
                } else if (hamming < distance2) {
                    distance2 = hamming;
                }
            }

            if (foundNeighbor && distance1 < distance2 * 0.3) { // TODO: Make this threshold configurable
                neighbors++;
            }
        }

        return neighbors;
    }
}