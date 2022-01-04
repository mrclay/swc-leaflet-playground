import { LatLngTuple } from "leaflet";
import { createMark, createPoly, Shape } from "./shapes";

let segmentCounter = 1;

const POINT_SEPARATOR = "],[";
const POLYGON_SEPARATOR = "]],[[";

export type Segment =
  | { type: "num"; value: number; key: number }
  | { type: "tuple"; value: LatLngTuple; key: number }
  | { type: "polygon"; value: LatLngTuple[]; key: number }
  | { type: "multigon"; value: LatLngTuple[][]; key: number }
  | { type: "literal"; value: string; key: number };

export const initSegments: Segment[] = [
  { type: "literal", value: "", key: segmentCounter++ },
];

function parseNumbers(value: string): Segment[] {
  const out: Segment[] = [];
  let copy = value
    .replace(/\s+/g, "")
    .replace(/^,?\[+/, "")
    .replace(/]+,?$/, "");

  while (true) {
    const m = copy.match(/(?:\b|-)\d+(?:\.\d+)?/);
    if (!m) {
      // Done! Finish up
      if (copy) {
        out.push({
          type: "literal",
          value: copy,
          key: segmentCounter++,
        });
      }
      return out;
    }

    if (typeof m.index === "number" && m.index > 0) {
      // capture stuff before number
      const before = copy.substring(0, m.index).trim();
      if (before) {
        out.push({
          type: "literal",
          value: before,
          key: segmentCounter++,
        });
      }
    }

    // capture the number
    out.push({
      type: "num",
      value: Number(m[0]),
      key: segmentCounter++,
    });

    // Start work on the rest
    if (typeof m.index === "number") {
      copy = copy.substring(m.index + m[0].length).trim();
    } else {
      // Shouldn't happen...
      throw new Error("RegExpMatch lacked index");
    }
  }
}

function buildTuples(segments: Segment[]): Segment[] {
  let out: Segment[] = [];

  // find first incidence then call iteratively to handle the rest
  for (let i = 0; i < segments.length; i++) {
    const curr = segments[i];
    const prev1 = segments[i - 1];
    const prev2 = segments[i - 2];

    // Collect for now, but may remove
    out.push(curr);

    if (
      curr.type === "num" &&
      prev2 &&
      prev2.type === "num" &&
      prev1 &&
      prev1.value === ","
    ) {
      // Move into tuple
      out.pop();
      out.pop();
      out.pop();
      out.push({
        type: "tuple",
        value: [prev2.value, curr.value],
        key: segmentCounter++,
      });
    }
  }

  // No point separators
  out = out.filter((el) => el.value !== POINT_SEPARATOR);

  const first = out[0];
  if (first && first.type === "literal") {
    first.value = first.value.replace(/^,/, "").replace(/^\[+/, "");
    if (!first.value) {
      out.unshift();
    }
  }

  const last = out[out.length - 1];
  if (last && last.type === "literal") {
    last.value = last.value.replace(/,$/, "").replace(/]+$/, "");
    if (!last.value) {
      out.pop();
    }
  }

  return out.length ? buildPolygons(out) : initSegments;
}

function buildPolygons(segments: Segment[]): Segment[] {
  let out: Segment[] = [];
  let points: LatLngTuple[] = [];

  segments.forEach((seg, i) => {
    // Add to output for now, but may remove later.
    out.push(seg);

    if (seg.type !== "tuple") {
      // restart collection
      points = [];
      return;
    }

    // Collect a tuple and check for end
    points.push(seg.value);

    const nextSeg = segments[i + 1];
    if (!nextSeg || nextSeg.type !== "tuple") {
      // We're definitely at the end of a set of tuples
      if (points.length > 2) {
        // Long enough for polygon
        // In output, replace the tuples with a polygon
        points.forEach(() => out.pop());
        out.push({
          type: "polygon",
          key: segmentCounter++,
          value: points,
        });

        // We'll discard the separator
        if (nextSeg) {
          nextSeg.value = "";
        }
      }

      // reset to try again
      points = [];
    }
  });

  // Discard the separator
  out = out.filter((el) => el.type !== "literal" || el.value);

  return out.length ? combinePolygons(out) : initSegments;
}

function combinePolygons(segments: Segment[]): Segment[] {
  let out: Segment[] = [];
  let polygons: LatLngTuple[][] = [];

  segments.forEach((seg, i) => {
    // Add to output for now, but may remove later.
    out.push(seg);

    if (seg.type !== "polygon") {
      // restart collection
      polygons = [];
      return;
    }

    // Collect a polygon and check for end
    polygons.push(seg.value);

    const nextSeg = segments[i + 1];
    if (!nextSeg || nextSeg.type !== "polygon") {
      // We're definitely at the end of a set of polygons
      // In output, replace the polygons with a multi
      polygons.forEach(() => out.pop());
      out.push({
        type: "multigon",
        key: segmentCounter++,
        value: polygons,
      });

      // reset to try again
      polygons = [];
    }
  });

  return out.length ? out : initSegments;
}

export function handleParsing(oldSegments: Segment[], key: number) {
  const seg = oldSegments.find((el) => el.key === key);
  if (!seg || seg.type !== "literal") {
    return oldSegments;
  }

  // parse nums
  const newSegments = parseNumbers(seg.value);
  const copy = oldSegments.slice();
  copy.splice(oldSegments.indexOf(seg), 1, ...newSegments);

  return buildTuples(copy);
}

export function shapesFromSegments(
  segments: Segment[],
  color?: string
): Shape[] {
  return segments
    .map((seg) => {
      switch (seg.type) {
        case "tuple":
          return createMark(seg.value, color);
        case "polygon":
          return createPoly([seg.value], color);
        case "multigon":
          return createPoly(seg.value, color);
        default:
          return null;
      }
    })
    .filter((el): el is Shape => Boolean(el));
}
