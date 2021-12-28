import { LatLngLiteral, LatLngTuple } from 'leaflet';

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
