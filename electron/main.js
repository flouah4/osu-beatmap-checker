import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { check_beatmap, get_beatmaps } from "./helpers/beatmap_helper.js";

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

  win.loadURL("http://localhost:5173");

  ipcMain.on("minimize_window", () => win.minimize());
  ipcMain.on("close_window", () => win.close());

  ipcMain.handle("get_osu_beatmaps", async (_, search) => {
    return await get_beatmaps(search);
  });
  ipcMain.handle("check_beatmap", async (_, beatmap_id) => {
    return await check_beatmap(beatmap_id);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
