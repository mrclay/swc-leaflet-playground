// organize-imports-ignore
import "teaful-devtools";

import React from "react";
import { createRoot } from "react-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { Features } from "./components/Features";
import { TextUi } from "./components/TextUi";
import "./index.scss";

function App() {
  return (
    <div>
      <MapContainer center={[0, 0]} zoom={12} doubleClickZoom={false}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        <Features />
      </MapContainer>
      <TextUi />
    </div>
  );
}

const container = document.getElementById("container");
if (!container) {
  throw new Error("#container not present");
}

const root = createRoot(container);

root.render(<App />);
