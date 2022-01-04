import React, { ReactElement, useCallback } from "react";
import { changeColor } from "../../colors";
import { createMark, createPoly, round } from "../../shapes";
import { useStaticMap, useStore } from "../../state";
import { Segments } from "./Segments";
import styles from "./TextUi.module.scss";

export function TextUi(): ReactElement | null {
  const [log] = useStore.log();
  const [shapes, setShapes] = useStore.shapes();
  const map = useStaticMap();

  function recolor(key: string) {
    setShapes((old) =>
      old.map((shape) => {
        if (key !== shape.key) {
          return shape;
        }
        return {
          ...shape,
          color: changeColor(shape.color),
        };
      })
    );
  }

  const split = (key: string) => {
    const shape = shapes.find((shape) => shape.key === key);
    if (!shape || shape.type !== "Poly") {
      return;
    }

    setShapes((shapes) => {
      const ret = shapes.filter((el) => el.key !== key);
      shape.polygons.forEach((polygon) => {
        ret.push(createPoly([polygon]));
      });
      return ret;
    });
  };

  const copy = useCallback(
    (key: string) => {
      if (!map) {
        return;
      }

      const center = map.getCenter();
      const centerPt = map.latLngToLayerPoint(center);
      const nudged = map.layerPointToLatLng(centerPt.add([50, 0]));

      const dx = nudged.lat - center.lat;
      const dy = nudged.lng - center.lng;

      const target = shapes.find((shape) => shape.key === key);
      if (!target) {
        return;
      }

      if (target.type === "Mark") {
        const newPt = round([target.pt[0] + dx, target.pt[1] + dy]);
        setShapes((old) => [...old, createMark(newPt)]);
      }
      if (target.type === "Poly") {
        const newPolygons = target.polygons.map((polygon) =>
          polygon.map((pt) => round([pt[0] + dx, pt[1] + dy]))
        );
        setShapes((old) => [...old, createPoly(newPolygons)]);
      }
    },
    [map]
  );

  function removeShape(key: string) {
    setShapes((old) => old.filter((shape) => shape.key !== key));
  }

  return (
    <div className={styles["text-ui"]}>
      <div className={styles.item}>
        <b>new shape :&nbsp;</b>
        <Segments />
      </div>

      {shapes.map((shape) => {
        let data: any = {};
        switch (shape.type) {
          case "Mark":
            data = shape.pt;
            break;
          case "Poly":
            data = shape.polygons;
            break;
        }
        return (
          <div key={shape.key} className={styles.item}>
            <b style={{ color: shape.color }}>{shape.key} :&nbsp;</b>
            <div>
              {JSON.stringify(data)}
              <div>
                <button type="button" onClick={() => recolor(shape.key)}>
                  Recolor
                </button>
                {shape.type === "Poly" && shape.polygons.length > 1 && (
                  <button type="button" onClick={() => split(shape.key)}>
                    Split
                  </button>
                )}
                <button type="button" onClick={() => copy(shape.key)}>
                  Copy
                </button>
                <button type="button" onClick={() => removeShape(shape.key)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <pre>{log.join("\n")}</pre>
    </div>
  );
}
