import {appStore} from "../../stores/app.store.ts";
import {useStoreSubscribe} from "../../hooks/use-store-subscribe.hook.ts";
import Plot from "react-plotly.js";
import {useMemo} from "react";
import {Panel} from "../panel/panel.tsx";

export const Plotter = () => {
    const descriptorType = useStoreSubscribe(appStore.algorithm);
    const differences = useStoreSubscribe(appStore.differences);
    const cuts = useStoreSubscribe(appStore.cuts);

    const timeElapsed = useStoreSubscribe(appStore.timeElapsed);

    const graph = useMemo(() => {
        const diffs = differences.map((_, i) => i + 1);

        return {
            diffs: {
                x: diffs,
                y: differences
            },
            shots: {
                x: cuts,
                y: cuts.map(() => 0)
            }
        }
    }, [differences, cuts]);

    return (
        <>
            <Panel direction="column" gap={16}>
                <Panel direction="column" gap={8}>
                    <Panel direction="row">
                        <input type="radio" id="histogram" name="descriptor" value="histogram"
                               checked={descriptorType === 'histogram'}
                               onChange={() => appStore.setAlgorithm('histogram')}/>
                        <label htmlFor="histogram">Histogram</label>
                    </Panel>

                    <Panel direction="row">
                        <input type="radio" id="cld" name="descriptor" value="cld" checked={descriptorType === 'cld'}
                               onChange={() => appStore.setAlgorithm('cld')}/>
                        <label htmlFor="cld">CLD</label>
                    </Panel>

                    <Panel direction="row">
                        <input type="radio" id="orb-cpu" name="descriptor" value="orb-cpu"
                               checked={descriptorType === 'orb-cpu'}
                               onChange={() => appStore.setAlgorithm('orb-cpu')}/>
                        <label htmlFor="orb-cpu">ORB CPU (Slow as hell)</label>
                    </Panel>

                    <Panel direction="row">
                        <input type="radio" id="orb-gpu" name="descriptor" value="orb-gpu"
                               checked={descriptorType === 'orb-gpu'}
                               onChange={() => appStore.setAlgorithm('orb-gpu')}/>
                        <label htmlFor="orb-gpu">ORB GPU (10x ORB CPU)</label>
                    </Panel>
                </Panel>
                <Panel direction="row">
                    <div>Time elapsed: {timeElapsed} ms</div>
                </Panel>
                <Plot
                    data={[
                        {
                            x: graph.diffs.x,
                            y: graph.diffs.y,
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: {color: 'blue'},
                            name: 'Frames difference'
                        },
                        {
                            x: graph.shots.x,
                            y: graph.shots.y,
                            type: 'scatter',
                            mode: 'markers',
                            marker: {color: 'red'},
                            name: 'Shots'
                        }
                    ]}
                    layout={{width: 800, height: 500, title: 'Frame changes'}}
                    onClick={(e) => {
                        const point = e.points[0];

                        appStore.setCurrentFrame(point.x as number);
                    }}
                />
            </Panel>
        </>
    );
}
