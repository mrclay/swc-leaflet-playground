import React, { FormEvent, ReactElement, useCallback, useMemo } from "react";
import {
  handleParsing,
  initSegments,
  shapesFromSegments,
} from "../../segments";
import { useStore } from "../../state";
import styles from "./TextUi.module.scss";

export function Segments(): ReactElement | null {
  const [, setShapes] = useStore.shapes();
  const [segments, setSegments] = useStore.segments();

  const updateInput = useCallback(
    (e: FormEvent<HTMLInputElement>, key: number) => {
      setSegments((segments) =>
        segments.map((old) => {
          if (key !== old.key || old.type !== "literal") {
            return old;
          }

          return { ...old, value: e.currentTarget.value };
        })
      );
    },
    [setSegments]
  );

  const allowInput = useCallback(
    (key: number) => {
      setSegments((segments) =>
        segments.map((old) => {
          if (key !== old.key || old.type === "literal") {
            return old;
          }

          return { ...old, type: "literal", value: JSON.stringify(old.value) };
        })
      );
    },
    [setSegments]
  );

  const removeSegment = useCallback(
    (key: number) => {
      setSegments((segments) => segments.filter((el) => el.key !== key));
    },
    [segments]
  );

  const parseInput = useCallback(
    (e: React.KeyboardEvent, key: number) => {
      if (e.key === "Enter") {
        setSegments((segments) => handleParsing(segments, key));
      }
    },
    [setSegments]
  );

  const hasProposedShapes = useMemo(
    () => shapesFromSegments(segments).length > 0,
    [segments]
  );

  function addFromSegments(replace: boolean) {
    const newShapes = shapesFromSegments(segments);
    setShapes((shapes) => (replace ? newShapes : [...shapes, ...newShapes]));
    setSegments(initSegments);
  }

  return (
    <div>
      <div className={styles.segmented}>
        {segments.map((seg) => {
          const removeButton =
            segments.length > 1 ? (
              <button
                type="button"
                className={styles.remove}
                onClick={() => removeSegment(seg.key)}
              >
                &times;
              </button>
            ) : null;
          const onDoubleClick = () => allowInput(seg.key);

          switch (seg.type) {
            case "num":
              return (
                <span key={seg.key}>
                  <span className={styles.value} onDoubleClick={onDoubleClick}>
                    {seg.value}
                  </span>
                  {removeButton}
                </span>
              );
            case "tuple":
            case "polygon":
            case "multigon":
              return (
                <span key={seg.key}>
                  <span className={styles.value} onDoubleClick={onDoubleClick}>
                    {JSON.stringify(seg.value)}
                  </span>
                  {removeButton}
                </span>
              );
            default:
              const ems =
                segments.length === 1
                  ? 35
                  : Math.min(Math.max(seg.value.length * 0.7 + 1, 2), 35);

              return (
                <span key={seg.key}>
                  <input
                    type="text"
                    value={seg.value}
                    style={{ width: `${ems}em` }}
                    onInput={(e) => updateInput(e, seg.key)}
                    onKeyUp={(e) => parseInput(e, seg.key)}
                  />
                </span>
              );
          }
        })}
      </div>
      {hasProposedShapes && (
        <button type="button" onClick={() => addFromSegments(true)}>
          Replace all
        </button>
      )}
      {hasProposedShapes && (
        <button type="button" onClick={() => addFromSegments(false)}>
          Add
        </button>
      )}
      {segments !== initSegments && (
        <button type="button" onClick={() => setSegments(initSegments)}>
          Reset
        </button>
      )}
    </div>
  );
}
