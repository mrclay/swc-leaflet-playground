import { LatLngTuple, LeafletEventHandlerFnMap, PathOptions } from "leaflet";
import React, { useCallback, useMemo, useState } from "react";
import { Polygon, Tooltip } from "react-leaflet";
import { Mark, Poly, round } from "../../shapes";
import { MyMarker } from "../MyMarker";

type Mode = "" | "move" | "adjust";

const nextMode: Record<Mode, Mode> = { "": "move", move: "adjust", adjust: "" };

interface PolygonProps {
  shape: Poly;
  onChange: (mark: Poly, polygons: LatLngTuple[][]) => void;
}

export const MyPolygon: React.FC<PolygonProps> = ({ shape, onChange }) => {
  const [mode, setMode] = useState<Mode>("");

  const vertexMarks: Mark[][] = useMemo(
    () =>
      shape.polygons.map((polygon, i) =>
        polygon.map((pt, j) => ({
          type: "Mark",
          key: `${shape.key}:${i}-${j}`,
          color: shape.color,
          pt,
        }))
      ),
    [shape.polygons, shape.color]
  );

  const move = useCallback(
    (mark: Mark, pt: LatLngTuple) => {
      const dx = pt[0] - mark.pt[0];
      const dy = pt[1] - mark.pt[1];

      onChange(
        shape,
        shape.polygons.map((oldPolygon) => {
          return oldPolygon.map((oldPt) =>
            round([oldPt[0] + dx, oldPt[1] + dy])
          );
        })
      );
    },
    [shape, onChange]
  );

  const adjust = useCallback(
    (mark: Mark, pt: LatLngTuple) => {
      const [, keyI, keyJ] = mark.key.match(
        /:(\d+)-(\d+)$/
      ) as RegExpMatchArray;
      onChange(
        shape,
        shape.polygons.map((oldPolygon, i) => {
          if (i !== Number(keyI)) {
            return oldPolygon;
          }
          return oldPolygon.map((oldPt, j) => {
            return j !== Number(keyJ) ? oldPt : pt;
          });
        })
      );
    },
    [shape, onChange]
  );

  const handlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click(e) {
        e.originalEvent.stopPropagation();
        setMode(nextMode[mode]);
      },
    }),
    [mode, shape]
  );

  const pathOptions: PathOptions = useMemo(
    () => ({
      color: shape.color,
    }),
    [shape.color]
  );

  const adjustMarkers = useMemo(() => {
    const ret: JSX.Element[] = [];
    const onMove = mode === "move" ? move : adjust;
    vertexMarks.forEach((polygon) =>
      polygon.forEach((mark) => {
        ret.push(
          <MyMarker key={mark.key} shape={mark} onMove={onMove}>
            <Tooltip>{mark.key.substring(shape.key.length + 1)}</Tooltip>
          </MyMarker>
        );
      })
    );
    return ret;
  }, [mode, vertexMarks]);

  return (
    <>
      <Polygon
        interactive
        eventHandlers={handlers}
        pathOptions={pathOptions}
        positions={shape.polygons}
      >
        {Boolean(mode) && (
          <Tooltip key={JSON.stringify(shape.polygons)} permanent>
            {mode}
          </Tooltip>
        )}
      </Polygon>
      {Boolean(mode) && adjustMarkers}
    </>
  );
};
