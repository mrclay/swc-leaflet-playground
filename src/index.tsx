// organize-imports-ignore
import "teaful-devtools";

import React from "react";
import { createRoot } from "react-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { Features, Spec } from "./components/Features";
import { Log } from "./components/Log";
import "./index.scss";

const data: Array<Spec> = [];

const colors = "red blue purple brown gold skyblue".split(" ");
let colorI = 0;

document.querySelectorAll<HTMLElement>("[data-for]").forEach((el) => {
  const key = el.dataset.for || "";
  const json = el.textContent || "";
  const color = colors[colorI++ % colors.length];
  try {
    data.push({
      key,
      data: JSON.parse(json),
      color,
    });
  } catch (e) {
    console.log(e);
  }
});

function App() {
  return (
    <div>
      <MapContainer center={[0, 0]} zoom={12} doubleClickZoom={false}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        <Features data={data} />
      </MapContainer>
      <Log />
    </div>
  );
}

const container = document.getElementById("container");
if (!container) {
  throw new Error("#container not present");
}

const root = createRoot(container);

root.render(<App />);
