import {Decoder, FrameData} from "./decoder/decoder.ts";
import {map, takeUntil, tap, toArray} from "rxjs";
import {Histogrammer} from "./feature-extractors/histogrammer.ts";
import {CLD} from "./feature-extractors/cld.ts";
import {ORB} from "./feature-extractors/orb.ts";

export class FeatureExtractor {
    static async extract(file: File): Promise<FrameData[]> {
        let decoded = 0;

        const decoder = new Decoder();

        const doneDecoding = new Promise<FrameData[]>((resolve) => {
            decoder.onDecodedFrame.pipe(
                tap(() => console.log('Decoded frame', ++decoded)),
                map((frame) => {
                    const histogram = Histogrammer.createHistogram(frame);
                    const cld = CLD.createCLD(frame);
                    const orb = ORB.createOrb(frame);

                    return {
                        ...frame,
                        histogram,
                        cld,
                        orb,
                    }
                }),
                takeUntil(decoder.onDone),
                toArray()
            ).subscribe((frames: FrameData[]) => {
                console.log('Decoded:', frames.length);
                resolve(frames);
            });

            decoder.decode(file);
        });

        return doneDecoding;
    }
}
