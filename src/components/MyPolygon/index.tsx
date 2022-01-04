import { LatLngTuple, LeafletEventHandlerFnMap, PathOptions } from "leaflet";
import React, { useCallback, useMemo, useState } from "react";
import { Polygon, Tooltip } from "react-leaflet";
import { Mark, Poly, round } from "../../shapes";
import { MyMarker } from "../MyMarker";

enum Mode {
  DEFAULT = "",
  MOVE = "move",
  ADJUST = "adjust",
}

const nextMode: Record<Mode, Mode> = {
  [Mode.DEFAULT]: Mode.MOVE,
  [Mode.MOVE]: Mode.ADJUST,
  [Mode.ADJUST]: Mode.DEFAULT,
};
const modeLabels: Record<Mode, string> = {
  [Mode.DEFAULT]: "",
  [Mode.MOVE]: "move",
  [Mode.ADJUST]: "adjust",
};

interface PolygonProps {
  shape: Poly;
  onChange?: (mark: Poly, polygons: LatLngTuple[][]) => void;
}

export const MyPolygon: React.FC<PolygonProps> = ({ shape, onChange }) => {
  const [mode, setMode] = useState<Mode>(Mode.DEFAULT);

  const vertexMarks: Mark[][] = useMemo(() => {
    if (mode === Mode.DEFAULT) {
      return [];
    }

    return shape.polygons.map((polygon, i) =>
      polygon.map((pt, j) => ({
        type: "Mark",
        key: `${shape.key}:${i}-${j}`,
        color: shape.color,
        pt,
      }))
    );
  }, [mode, shape.polygons, shape.color]);

  const midpointMarks: Mark[][] = useMemo(() => {
    if (mode !== Mode.ADJUST) {
      return [];
    }

    return shape.polygons.map((polygon, i) =>
      polygon.map((pt1, j) => {
        const pt2 = polygon[(j + 1) % polygon.length];
        const pt: LatLngTuple = [
          pt1[0] + (pt2[0] - pt1[0]) / 2,
          pt1[1] + (pt2[1] - pt1[1]) / 2,
        ];
        return {
          type: "Mark",
          key: `${shape.key}:${i}-${j}-mid`,
          color: shape.color,
          pt,
        };
      })
    );
  }, [mode, shape.polygons, shape.color]);

  const moveAll = useCallback(
    (mark: Mark, pt: LatLngTuple) => {
      if (!onChange) {
        return;
      }
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

  const removeOne = useCallback(
    (mark: Mark) => {
      if (!onChange) {
        return;
      }
      const [, keyI, keyJ] = mark.key.match(
        /:(\d+)-(\d+)$/
      ) as RegExpMatchArray;
      onChange(
        shape,
        shape.polygons.map((oldPolygon, i) =>
          oldPolygon.filter((pt, j) => i !== Number(keyI) || j !== Number(keyJ))
        )
      );
    },
    [shape, onChange]
  );

  const moveOne = useCallback(
    (mark: Mark, pt: LatLngTuple) => {
      if (!onChange) {
        return;
      }
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

  const addMidpoint = useCallback(
    (mark: Mark) => {
      if (!onChange) {
        return;
      }
      const [, keyI, keyJ] = mark.key.match(
        /:(\d+)-(\d+)-mid$/
      ) as RegExpMatchArray;

      onChange(
        shape,
        shape.polygons.map((oldPolygon, i) => {
          if (i !== Number(keyI)) {
            return oldPolygon;
          }

          const pts: LatLngTuple[] = [];
          oldPolygon.forEach((oldPt, j) => {
            pts.push(oldPt);
            if (j === Number(keyJ)) {
              pts.push(mark.pt);
            }
          });
          return pts;
        })
      );
    },
    [midpointMarks, onChange]
  );

  const handlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click(e) {
        e.originalEvent.stopPropagation();
        if (onChange) {
          setMode(nextMode[mode]);
        }
      },
    }),
    [mode, shape, onChange]
  );

  const pathOptions: PathOptions = useMemo(
    () => ({
      color: shape.color,
    }),
    [shape.color]
  );

  const adjustMarkers = useMemo(() => {
    const ret: JSX.Element[] = [];

    vertexMarks.forEach((polygon) =>
      polygon.forEach((mark) => {
        switch (mode) {
          case Mode.ADJUST:
            ret.push(
              <MyMarker
                key={mark.key}
                shape={mark}
                type={polygon.length > 3 ? "remove" : "marker"}
                onClick={polygon.length > 3 ? removeOne : undefined}
                onMove={moveOne}
              />
            );
            break;
          case Mode.MOVE:
            ret.push(
              <MyMarker
                key={mark.key}
                shape={mark}
                type="marker"
                onMove={moveAll}
              />
            );
            break;
        }
      })
    );

    return ret;
  }, [vertexMarks]);

  const midpointMarkers = useMemo(() => {
    const ret: JSX.Element[] = [];
    midpointMarks.forEach((polygon) =>
      polygon.forEach((mark) => {
        ret.push(
          <MyMarker
            key={mark.key}
            shape={mark}
            type="add"
            onClick={addMidpoint}
          />
        );
      })
    );
    return ret;
  }, [midpointMarks]);

  return (
    <>
      <Polygon
        interactive
        eventHandlers={handlers}
        pathOptions={pathOptions}
        positions={shape.polygons}
      >
        {mode !== Mode.DEFAULT && (
          <Tooltip key={JSON.stringify(shape.polygons)} permanent>
            {modeLabels[mode]}
          </Tooltip>
        )}
      </Polygon>

      {adjustMarkers}

      {midpointMarkers}
    </>
  );
};
