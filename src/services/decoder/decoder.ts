import {map, of, Subject, switchMap} from "rxjs";
import {Demuxer} from "./demuxer.ts";
import {readFileAsMp4Buffer} from "../../helpers/read-file-as-mp4-buffer.ts";

export type FrameData = {
    width: number,
    height: number,
    data: Uint8ClampedArray,
    histogram?: number[],
    cld?: number[],
    orb?: number[][],
}

export class Decoder {
    public onDecodedFrame = new Subject<FrameData>();
    public onDone = new Subject<void>();

    private decoder: VideoDecoder;

    constructor() {
        this.decoder = new VideoDecoder({
            output: (frame: VideoFrame) => {
                // TODO: I have absolutely no idea why the hell this example from MDN always throws an error,
                // so I'm just going to use the canvas API.

                // const frameData = new Uint8Array(frame.allocationSize());
                // const layout = await frame.copyTo(frameData);

                const canvas = document.createElement('canvas');
                canvas.width = frame.displayWidth;
                canvas.height = frame.displayHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(frame, 0, 0);
                    const buffer = context.getImageData(0, 0, frame.displayWidth, frame.displayHeight).data;

                    this.onDecodedFrame.next({
                        width: frame.displayWidth,
                        height: frame.displayHeight,
                        data: buffer,
                    });
                }

                frame.close();
            },
            error(e) {
                console.error(e);
            }
        });
    }

    decode = async (file: File) => {
        const mp4buffer = await readFileAsMp4Buffer(file);

        const demuxer = new Demuxer();

        of(null)
            .pipe(
                switchMap(() => demuxer.onDecoderConfigurationReady),
                map(c => this.decoder.configure(c)),
                switchMap(() => demuxer.onVideoChunk),
                map(({chunk}) => this.decoder.decode(chunk)),
                switchMap(() => demuxer.onProcessed),
                switchMap(() => this.decoder.flush()),
            )
            .subscribe(() => {
                console.log('done decoding');
                this.onDone.next();
            });

        demuxer.demux(mp4buffer);
    }
}
