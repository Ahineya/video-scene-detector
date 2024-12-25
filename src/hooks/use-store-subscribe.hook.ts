import {useEffect, useState} from "react";
import {BehaviorSubject} from "rxjs";

export function useStoreSubscribe<T>(bs: BehaviorSubject<T>, initialState?: T) {
    const [data, setData] = useState<T>(initialState ?? bs.getValue());

    useEffect(() => {
        const subscription = bs.subscribe(setData);

        return () => {
            subscription.unsubscribe();
        };
    }, [bs]);

    return data;
}
