
/**
 * In an asynchronous context this method can be called to wait for some time.
 * @param ms wait time in ms
 */
export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function strMapToObj(strMap: Map<string, any>) {
    let obj = Object.create(null);
    strMap.forEach((v, k) => {
        obj[k] = v
    });
    return obj;
}

export function strMapToJson(strMap: any) {
    return JSON.stringify(strMapToObj(strMap));
}