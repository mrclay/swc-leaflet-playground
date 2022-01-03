import React, { ReactElement, useState } from "react";
import { changeColor } from "../../colors";
import { createMark, createPoly, round, strToShape } from "../../shapes";
import { useStaticMap, useStore } from "../../state";
import styles from "./TextUi.module.scss";

export function TextUi(): ReactElement | null {
  const [log] = useStore.log();
  const [shapes, setShapes] = useStore.shapes();
  const map = useStaticMap();
  const [value, setValue] = useState("");

  if (!map) {
    return null;
  }

  function addShape() {
    const shape = strToShape(value);
    if (shape) {
      setValue("");
      setShapes((old) => [...old, shape]);
    }
  }

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

  const copy = (key: string) => {
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
  };

  function remove(key: string) {
    setShapes((old) => old.filter((shape) => shape.key !== key));
  }

  return (
    <div className={styles["textUi"]}>
      {shapes.map((shape, i) => {
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
                <button type="button" onClick={() => remove(shape.key)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div className={styles.item}>
        <b>new shape :&nbsp;</b>
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />{" "}
          <button type="button" onClick={addShape}>
            Add
          </button>
        </div>
      </div>
      <pre>{log.join("\n")}</pre>
    </div>
  );
}
