import { Map } from "leaflet";
import { useEffect } from "react";
import createStore from "teaful";
import { initSegments } from "./segments";
import { getDefaultShapes } from "./shapes";

const initStore = {
  shapes: getDefaultShapes(),
  segments: initSegments,
  log: [] as string[],
  mapCounter: 0,
};

export const { useStore } = createStore(initStore);

// Can't store Map https://github.com/teafuljs/teaful-devtools/issues/5
export const staticStore = {
  // This is kept up to date by Features.
  map: null as Map | null,
};

export function captureStaticMap(map: Map) {
  const [, setMapCounter] = useStore.mapCounter();

  useEffect(() => {
    if (map) {
      staticStore.map = map;
      setMapCounter((old) => old + 1);
    }
  }, [map]);
}

export function useStaticMap() {
  useStore.mapCounter();
  return staticStore.map;
}

export function useLogger() {
  const [, setLog] = useStore.log();
  return (msg: string) => setLog((log) => [msg, ...log].slice(0, 20));
}
