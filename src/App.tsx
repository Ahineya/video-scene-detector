import './App.css'
import './services/decoder/demuxer.ts'
import {VideoLoader} from "./components/video-loader.tsx";
import {FrameDrawer} from "./components/frame-drawer/frame-drawer.tsx";
import {Panel} from "./components/panel/panel.tsx";
import {Plotter} from "./components/plotter/plotter.tsx";
import {Overlay} from "./components/overlay/overlay.tsx";

function App() {
    return (
        <Panel direction="column" gap={16}>
            <VideoLoader/>
            <FrameDrawer/>
            <Plotter/>
            <Overlay />
        </Panel>
    )
}

export default App
