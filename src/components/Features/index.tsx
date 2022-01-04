import { LatLngTuple } from "leaflet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { FeatureGroup, useMap } from "react-leaflet";
import { shapesFromSegments } from "../../segments";
import { Mark, Poly } from "../../shapes";
import { captureStaticMap, useStore } from "../../state";
import { MyMarker } from "../MyMarker";
import { MyPolygon } from "../MyPolygon";

export function Features() {
  // @ts-ignore
  const featureGroupRef = useRef<FeatureGroup>(null);
  const map = useMap();
  let [shapes, setShapes] = useStore.shapes();
  const [segments] = useStore.segments();
  captureStaticMap(map);

  // Shapes created from input segments
  const altShapes = useMemo(
    () => shapesFromSegments(segments, "#000"),
    [segments]
  );
  if (altShapes.length) {
    shapes = altShapes;
  }

  const shapeKeys = shapes.map((el) => el.key).join(" ");
  useEffect(() => {
    if (shapes.length) {
      const fg = featureGroupRef.current;
      map.fitBounds(fg.getBounds());
    }
  }, [shapeKeys]);

  const moveMark = useCallback((mark: Mark, pt: LatLngTuple) => {
    setShapes((shapes) =>
      shapes.map((shape) => {
        if (shape.key === mark.key) {
          return {
            ...shape,
            pt,
          };
        }
        return shape;
      })
    );
  }, []);

  const adjustPoly = useCallback((poly: Poly, polygons: LatLngTuple[][]) => {
    setShapes((shapes) =>
      shapes.map((shape) => {
        if (shape.key === poly.key) {
          return {
            ...shape,
            polygons,
          };
        }
        return shape;
      })
    );
  }, []);

  return (
    <FeatureGroup ref={featureGroupRef}>
      {shapes.map((shape) => {
        if (shape.type === "Mark") {
          const onMove = shapes === altShapes ? undefined : moveMark;
          return <MyMarker key={shape.key} shape={shape} onMove={onMove} />;
        }
        if (shape.type === "Poly") {
          const onChange = shapes === altShapes ? undefined : adjustPoly;
          return (
            <MyPolygon key={shape.key} shape={shape} onChange={onChange} />
          );
        }

        return null;
      })}
    </FeatureGroup>
  );
}
