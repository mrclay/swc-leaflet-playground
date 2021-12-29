import React from "react";
import { useStore } from "../../state";
import styles from "./Log.module.scss";

export function Log(): JSX.Element {
  const [log] = useStore.log();
  const [shapes] = useStore.shapes();

  return (
    <div className={styles.log}>
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
            <b style={{ fontFamily: "monospace", color: shape.color }}>
              {shape.key}
            </b>{" "}
            : {JSON.stringify(data)}
          </div>
        );
      })}
      <pre>{log.join("\n")}</pre>
    </div>
  );
}
