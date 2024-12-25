import {appStore} from "../../stores/app.store.ts";
import './overlay.scss';
import {useStoreSubscribe} from "../../hooks/use-store-subscribe.hook.ts";
import {Panel} from "../panel/panel.tsx";
import loader from "../../assets/loader.svg";

export const Overlay = () => {

    const isDecoding = useStoreSubscribe(appStore.decoding);

    return isDecoding
        ? (
            <Panel className="overlay" direction="column" gap={24}>
                <span>Decoding your video. Open the console to see the progress.</span>

                <img src={loader} alt="loader"/>
            </Panel>
        )
        : null
}
