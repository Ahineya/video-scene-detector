import {FrameData} from "./decoder/decoder.ts";
import {ICutter} from "./cutters/cutter.interface.ts";

export class SceneCutter {
    static cutScenes(cutter: ICutter, frames: FrameData[]) {
        const differences = cutter.getSimilarities(frames);
        const cuts = cutter.getCuts(differences);

        return {
            cuts,
            differences,
        }
    }
}
