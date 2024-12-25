import {BehaviorSubject} from "rxjs";
import {FrameData} from "../services/decoder/decoder.ts";
import {SceneCutter} from "../services/scene-cutter.ts";
import {cldCutter, histogramCutter, orbCpuCutter, orbGpuCutter} from "../services/cutters/cutters.ts";

export type DescriptorType = 'histogram' | 'cld' | 'orb-cpu' | 'orb-gpu';

class AppStore {
    public decoding = new BehaviorSubject(false);

    public frames = new BehaviorSubject<FrameData[]>([]);
    public currentFrame = new BehaviorSubject(0);

    public algorithm = new BehaviorSubject<DescriptorType>('histogram');

    public cuts = new BehaviorSubject<number[]>([]);
    public differences = new BehaviorSubject<number[]>([]);

    public timeElapsed = new BehaviorSubject<number>(0);

    public setDecoding(decoding: boolean) {
        this.decoding.next(decoding);
    }

    public setFrames(frames: FrameData[]) {
        this.frames.next(frames);
        this.updateCutsAndDifferences();
    }

    public setAlgorithm(algorithm: DescriptorType) {
        this.algorithm.next(algorithm);
        this.updateCutsAndDifferences();
    }

    public setCurrentFrame(frameNumber: number) {
        if (frameNumber < 0 || frameNumber >= this.frames.value.length) {
            return;
        }

        this.currentFrame.next(frameNumber);
    }

    private updateCutsAndDifferences() {
        const frames = this.frames.getValue();
        const algorithm = this.algorithm.getValue();

        const startTime = performance.now();
        const {cuts, differences} = this.getCutsAndDifferences(frames, algorithm);
        const endTime = performance.now();

        this.cuts.next(cuts);
        this.differences.next(differences);

        this.timeElapsed.next(endTime - startTime);
    }

    private getCutsAndDifferences(frames: FrameData[], algorithm: DescriptorType) {
        switch (algorithm) {
            case 'histogram':
                return SceneCutter.cutScenes(histogramCutter, frames);
            case 'cld':
                return SceneCutter.cutScenes(cldCutter, frames);
            case 'orb-cpu':
                return SceneCutter.cutScenes(orbCpuCutter, frames);
            case 'orb-gpu':
                return SceneCutter.cutScenes(orbGpuCutter, frames);
        }
    }
}

export const appStore = new AppStore();
