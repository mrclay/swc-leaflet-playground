import L, { LatLngTuple, LeafletEventHandlerFnMap } from "leaflet";
import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import { debounce } from "throttle-debounce";
import { Mark } from "../../state";
import { round } from "../../util";
import styles from "./MyMarker.module.css";

interface MarkerProps {
  shape: Mark;
  onMove?: (mark: Mark, pt: LatLngTuple) => void;
}

export const MyMarker: React.FC<MarkerProps> = ({ shape, onMove }) => {
  const handlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click(e) {
        e.originalEvent.stopPropagation();
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

  const icon = useMemo(
    () =>
      L.divIcon({
        html: [
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 560" xml:space="preserve">`,
          `<path stroke-width="15" stroke="#ffffff" fill="${shape.color}" `,
          `d="M183 552s175-269 175-357C358 65 270 8 183 8S8 65 8 195c0 88 175 357 175 357zm-61-365a61 61 0 1 1 122 0 61 61 0 0 1-122 0z"/>`,
          `</svg>`,
        ].join(""),
        className: styles.icon,
      }),
    [shape.color]
  );

  return (
    <Marker
      icon={icon}
      interactive
      key={shape.key}
      draggable
      eventHandlers={handlers}
      position={shape.pt}
    />
  );
};
