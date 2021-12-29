import { LatLngLiteral, LatLngTuple } from "leaflet";
import { niceColor } from "./colors";

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

export type Shape = Poly | Mark;

type Roundable = LatLngTuple | LatLngLiteral;

export function round(num: number, precision?: number): number;
export function round(obj: Roundable, precision?: number): LatLngTuple;
export function round(obj: Roundable | number, precision = 4) {
  const fix = (num: number) => Number(num.toFixed(precision));
  if (typeof obj === "number") {
    return fix(obj);
  }
  if (Array.isArray(obj)) {
    return [fix(obj[0]), fix(obj[1])];
  } else {
    return [fix(obj.lat), fix(obj.lng)];
  }
}

export function getDefaultShapes() {
  return [
    "[38.8979, -77.0333]",
    "[[[39.0149,-77.0444],[38.9252,-77.3163],[39.1301,-77.6019],[39.181,-77.0911]]]",
    "[[[38.9434,-76.9867],[38.9423,-76.8796],[38.8322,-76.9867]],[[38.922,-77.1845],[38.8376,-77.0251],[38.8344,-77.168]]]",
  ]
    .map(strToShape)
    .filter((val): val is Shape => Boolean(val));
}

let keyCounter = 1;

function createShapeKey(prefix = "shape") {
  return prefix + keyCounter++;
}

export function createPoly(polygons: LatLngTuple[][], color = ""): Poly {
  return {
    type: "Poly",
    key: createShapeKey("polygon"),
    color: color || niceColor(),
    polygons,
  };
}

export function createMark(pt: LatLngTuple, color = ""): Mark {
  return {
    type: "Mark",
    key: createShapeKey("marker"),
    color: color || niceColor(),
    pt,
  };
}

export function strToShape(txt: string): Shape | null {
  const fixed = txt
    .replace(/([-\d.]+)\s+([-\d.]+)/, "$1,$2")
    .replace(/\s+/, "")
    .replace(/(,$|^,)/, "")
    .replace(/,]/, "]")
    .replace(/^([-\d.]+)/, "[$1")
    .replace(/([-\d.]+)$/, "$1]");

  let data;
  try {
    data = JSON.parse(fixed);
  } catch (e) {
    data = -1;
  }
  if (data === -1) {
    try {
      data = JSON.parse(`[${fixed}]`);
    } catch (e) {
      return null;
    }
  }

  if (isLatLngTuple(data) || isLatLngLiteral(data)) {
    return createMark(round(data));
  }
  if (isMultiPoly(data)) {
    return createPoly(data);
  }
  if (isPolygon(data)) {
    return createPoly([data]);
  }

  return null;
}

/**
 * Note strings in the given array may be cast to numbers
 */
function isLatLngTuple(val: any): val is LatLngTuple {
  if (!Array.isArray(val) || val.length !== 2) {
    return false;
  }
  if (typeof val[0] === "string") {
    val[0] = Number(val[0]);
  }
  if (typeof val[1] === "string") {
    val[1] = Number(val[1]);
  }
  return (
    typeof val[0] === "number" &&
    typeof val[1] === "number" &&
    !isNaN(val[0]) &&
    !isNaN(val[1])
  );
}

/**
 * Note strings in the given obj may be cast to numbers
 */
function isLatLngLiteral(val: any): val is LatLngLiteral {
  if (!val || typeof val !== "object") {
    return false;
  }
  if (typeof val.lat === "string") {
    val.lat = Number(val.lat);
  }
  if (typeof val.lng === "string") {
    val.lng = Number(val.lng);
  }
  return typeof val.lat === "number" && typeof val.lng === "number";
}

/**
 * Note LatLngLiterals are turned into rounded tuples in val
 */
function isPolygon(val: any): val is LatLngTuple[] {
  if (!Array.isArray(val) || val.length < 3) {
    return false;
  }

  let ok = true;
  for (let i in val) {
    if (isLatLngLiteral(val[i]) || isLatLngTuple(val[i])) {
      val[i] = round(val[i]);
    } else {
      ok = false;
    }
  }

  return ok;
}

/**
 * Note LatLngLiterals are turned into tuples in val
 */
function isMultiPoly(val: any): val is LatLngTuple[][] {
  return Array.isArray(val) && val.every(isPolygon);
}
