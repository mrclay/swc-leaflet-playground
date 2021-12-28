import React, { useEffect, useMemo, useState } from "react";
import L, { LatLngTuple, LeafletEventHandlerFnMap } from "leaflet";
import { Marker } from "react-leaflet";
import { debounce } from "throttle-debounce";
import { round } from "../../util";
import { Mark, useLogger } from "../../state";

interface MarkerProps {
  shape: Mark;
  onMove?: (mark: Mark, pt: LatLngTuple) => void;
}

export const MyMarker: React.FC<MarkerProps> = ({ shape, onMove }) => {
  const logger = useLogger();

  const handlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click(e) {
        e.originalEvent.stopPropagation();
        logger(JSON.stringify(shape));
      },
      drag: debounce(50, (e) => {
        const marker: L.Marker = e.target;
        const newPt = round(marker.getLatLng());
        if (onMove) {
          onMove(shape, newPt);
        }
      }),
    }),
    [onMove, shape.pt]
  );

  return (
    <Marker
      interactive
      key={shape.key}
      draggable
      eventHandlers={handlers}
      position={shape.pt}
    />
  );
};
