import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import {
  get_beatmaps,
  check_beatmap_general,
  check_beatmap_difficulty,
} from "./helpers/beatmap_helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    transparent: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }

  ipcMain.on("minimize_window", () => win.minimize());
  ipcMain.on("close_window", () => win.close());

  ipcMain.handle("get_osu_beatmaps", async (_, search) => {
    return await get_beatmaps(search);
  });
  ipcMain.handle("check_beatmap_general", async (_, beatmap_folder_path) => {
    return await check_beatmap_general(beatmap_folder_path);
  });
  ipcMain.handle(
    "check_beatmap_difficulty",
    async (_, beatmap_folder_path, osu_file_path) => {
      return await check_beatmap_difficulty(beatmap_folder_path, osu_file_path);
    }
  );
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
