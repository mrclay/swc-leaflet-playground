// @ts-ignore
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FeatureGroup, useMap } from "react-leaflet";
import { MyPolygon } from "../MyPolygon";
import { MyMarker } from "../MyMarker";
import { createMark, createPoly, Mark, Poly, useStore } from "../../state";
import { LatLngTuple } from "leaflet";

type Data = LatLngTuple | Array<LatLngTuple> | Array<LatLngTuple[]>;

export interface Spec {
  data: Data;
  color: string;
  key: string;
}

interface FeaturesProps {
  data: Spec[];
}

export function Features({ data }: FeaturesProps) {
  // @ts-ignore
  const featureGroupRef = useRef<FeatureGroup>(null);
  const map = useMap();
  const [shapes, setShapes] = useStore.shapes();

  useEffect(() => {
    setShapes(
      data.map(({ data }) => {
        if (typeof data[0] === "number") {
          return createMark(data as LatLngTuple);
        }
        return createPoly(data as LatLngTuple[][]);
      })
    );
  }, []);

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
