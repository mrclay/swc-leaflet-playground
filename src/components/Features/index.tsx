import { LatLngTuple } from "leaflet";
import React, { useCallback, useEffect, useRef } from "react";
import { FeatureGroup, useMap } from "react-leaflet";
import { Mark, Poly } from "../../shapes";
import { captureStaticMap, useStore } from "../../state";
import { MyMarker } from "../MyMarker";
import { MyPolygon } from "../MyPolygon";

export function Features() {
  // @ts-ignore
  const featureGroupRef = useRef<FeatureGroup>(null);
  const map = useMap();
  const [shapes, setShapes] = useStore.shapes();
  captureStaticMap(map);

  useEffect(() => {
    if (shapes.length) {
      const fg = featureGroupRef.current;
      map.fitBounds(fg.getBounds());
      map.setZoom(map.getZoom());
    }
  }, [shapes.length]);

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
      {shapes.map((shape, i) => {
        if (shape.type === "Mark") {
          return <MyMarker key={shape.key} shape={shape} onMove={moveMark} />;
        }
        if (shape.type === "Poly") {
          return (
            <MyPolygon key={shape.key} shape={shape} onChange={adjustPoly} />
          );
        }

        return null;
      })}
    </FeatureGroup>
  );
}
