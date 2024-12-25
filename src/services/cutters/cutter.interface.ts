import {FrameData} from "../decoder/decoder.ts";

export interface ICutter {
    getSimilarities(frames: FrameData[]): number[];
    getCuts(differences: number[]): number[];
}
