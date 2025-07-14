import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";
import { BeatmapProvider } from "./context/beatmap_context";

createRoot(document.getElementById("root")!).render(
  <BeatmapProvider>
    <App />
  </BeatmapProvider>
);
