import {ChangeEvent} from "react";
import {appStore} from "../stores/app.store.ts";
import {FeatureExtractor} from "../services/feature-extractor.ts";

export const VideoLoader = () => {
    const openFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];

        if (!file) {
            return;
        }

        appStore.setDecoding(true);

        setTimeout(() => {
            FeatureExtractor.extract(file)
                .then((frames) => {
                    appStore.setFrames(frames);
                    appStore.setDecoding(false);
                })
        }, 500);
    }

    return (
        <input type="file" onChange={openFile} accept="video/mp4"/>
    );
}
