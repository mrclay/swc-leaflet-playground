import L, { LatLngTuple, LeafletEventHandlerFnMap } from "leaflet";
import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import { debounce } from "throttle-debounce";
import { Mark, round } from "../../shapes";
import styles from "./MyMarker.module.css";

export interface MarkerProps {
  shape: Mark;
  type?: "marker" | "add" | "remove";
  onClick?: (mark: Mark) => void;
  onMove?: (mark: Mark, pt: LatLngTuple) => void;
}

export const MyMarker: React.FC<MarkerProps> = ({
  children,
  shape,
  type = "marker",
  onClick,
  onMove,
}) => {
  const handlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click(e) {
        e.originalEvent.stopPropagation();
        if (onClick) {
          onClick(shape);
        }
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
        html: (() => {
          switch (type) {
            case "marker":
              return `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 560" xml:space="preserve">
                  <path stroke-width="15" stroke="#fff" fill="${shape.color}"
                    d="M183 552s175-269 175-357C358 65 270 8 183 8S8 65 8 195c0 88 175 357 175 357zm-61-365a61 61 0 1 1 122 0 61 61 0 0 1-122 0z"/>
                </svg>`;
            case "add":
              return `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path fill="#fff" d="m12 4 8 8-8 8-8-8z"/>
                  <path stroke-width="1" stroke="#fff" fill="${shape.color}"
                    d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>`;
            case "remove":
              return `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path fill="#fff" d="m12 4 8 8-8 8-8-8z"/>
                  <path stroke-width="1" stroke="#fff" fill="${shape.color}"
                    d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5 11H7v-2h10v2z"/>
                </svg>`;
          }
          return "";
        })(),
        className: `${styles.icon} ${styles["type-" + type]}`,
      }),
    [shape.color, type]
  );

  /* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
     <path fill="#ffffff" d="M12,4 20,12 12,20 4,12z"/>
     <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
   </svg>
   */

  return (
    <Marker
      icon={icon}
      interactive
      key={shape.key}
      draggable
      eventHandlers={handlers}
      position={shape.pt}
    >
      {children}
    </Marker>
  );
};
