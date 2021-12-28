import { LatLngTuple } from "leaflet";
import createStore from "teaful";

interface ShapeProps {
  key: string;
  color: string;
}
export interface Poly extends ShapeProps {
  type: "Poly";
  polygons: LatLngTuple[][];
}
export interface Mark extends ShapeProps {
  type: "Mark";
  pt: LatLngTuple;
}

type Shape = Poly | Mark;

const initStore = {
  shapes: [] as Shape[],
  log: [] as string[],
};

let counter = 1;

function createKey(prefix = "shape") {
  return prefix + counter++;
}

function createDarkColor() {
  const one = () =>
    Math.floor(Math.random() * 155)
      .toString(16)
      .padStart(2, "0");
  return "#" + [0, 1, 3].map(one).join("");
}

export function createPoly(polygons: LatLngTuple[][]): Poly {
  return {
    type: "Poly",
    key: createKey("polygon"),
    color: createDarkColor(),
    polygons,
  };
}

export function createMark(pt: LatLngTuple): Mark {
  return {
    type: "Mark",
    key: createKey("marker"),
    color: createDarkColor(),
    pt,
  };
}

export const { useStore } = createStore(initStore);

export function useLogger() {
  const [, setLog] = useStore.log();
  return (msg: string) => setLog((log) => [msg, ...log].slice(0, 20));
}
