// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {MP4ArrayBuffer, MP4Info, createFile, DataStream, MP4File, Sample} from "mp4box";
import {Subject} from "rxjs";

export class Demuxer {
    public onDecoderConfigurationReady = new Subject<VideoDecoderConfig>();
    public onVideoChunk = new Subject<{
        chunk: EncodedVideoChunk,
        progress: number,
        sampleNumber: number,
    }>();
    public onProcessed = new Subject<void>();

    private processedChunksSize = 0;

    demux(mp4buffer: MP4ArrayBuffer) {
        this.processedChunksSize = 0;
        const demuxedFile = createFile();

        demuxedFile.onError = (e: unknown) => {
            console.error(e);
        }

        demuxedFile.onSamples = (id: unknown, user: unknown, samples: Sample[]) => {
            console.log(id, user, samples);
            const processedChunksSize = samples.reduce((acc, sample) => acc + sample.size, 0);
            this.processedChunksSize += processedChunksSize;

            for (const sample of samples) {
                const chunk = new EncodedVideoChunk({
                    type: sample.is_sync ? "key" : "delta",
                    timestamp: 1e6 * sample.cts / sample.timescale,
                    duration: 1e6 * sample.duration / sample.timescale,
                    data: sample.data
                });

                this.onVideoChunk.next({
                    chunk,
                    progress: this.processedChunksSize / demuxedFile.samplesDataSize,
                    sampleNumber: sample.number,
                });
            }

            if (this.processedChunksSize === demuxedFile.samplesDataSize) {
                console.log('done demuxing');

                setTimeout(() => this.onProcessed.next(), 1000);
            }
        }

        demuxedFile.onReady = (info: MP4Info) => {
            const track = info.videoTracks[0];

            const config = {
                codec: track.codec.startsWith('vp08') ? 'vp8' : track.codec,
                codedHeight: track.video.height,
                codedWidth: track.video.width,
                description: this.getDescription(demuxedFile, track.id)
            }

            console.log(config)

            VideoDecoder.isConfigSupported(config).then((supported) => {
                if (supported) {
                    this.onDecoderConfigurationReady.next(config);
                    demuxedFile.setExtractionOptions(track.id);
                    demuxedFile.start();
                } else {
                    console.error('CONFIG IS NOT SUPPORTED', config);
                }
            });
        }

        demuxedFile.appendBuffer(mp4buffer);
        demuxedFile.flush();
    }

    getDescription = (file: MP4File, trackId: number) => {
        const trak = file.getTrackById(trackId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const entry of (trak as any).mdia.minf.stbl.stsd.entries) {
            const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
            if (box) {
                const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
                box.write(stream);
                return new Uint8Array(stream.buffer, 8);  // Remove the box header.
            }
        }

        throw new Error("avcC, hvcC, vpcC, or av1C box not found");
    }
}
