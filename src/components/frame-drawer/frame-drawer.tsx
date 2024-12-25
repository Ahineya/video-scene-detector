import {useEffect, useRef} from "react";
import {appStore} from "../../stores/app.store.ts";
import {useStoreSubscribe} from "../../hooks/use-store-subscribe.hook.ts";

import "./frame-drawer.scss";
import {Panel} from "../panel/panel.tsx";

export const FrameDrawer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const frames = useStoreSubscribe(appStore.frames);
    const currentFrame = useStoreSubscribe(appStore.currentFrame);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const ctx = canvasRef.current.getContext('2d');

        if (!ctx) {
            return;
        }

        if (!frames[currentFrame]) {
            ctx.font = '36px monospace';
            ctx.fillText('[No video]', canvasRef.current.width / 2 - 120, canvasRef.current.height / 2);

            return;
        }

        const frame = frames[currentFrame];

        const imageData = ctx?.createImageData(frame.width, frame.height);
        imageData?.data.set(frame.data);

        canvasRef.current.width = frame.width;
        canvasRef.current.height = frame.height;

        ctx?.putImageData(imageData, 0, 0);
    }, [frames, currentFrame]);

    return (
        <Panel className="frame-drawer" direction="column" gap={16}>
            <canvas ref={canvasRef} className="frame-drawer-canvas"/>
            <Panel direction="row" gap={16}>
                <span>Frame: </span>
                <input type="number" min={0} max={frames.length} value={currentFrame} onChange={e => {
                    appStore.setCurrentFrame(parseInt(e.target.value, 10) || 0);
                }}/>
            </Panel>
        </Panel>
    )
}