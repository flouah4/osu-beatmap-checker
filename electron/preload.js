import { contextBridge, ipcRenderer, shell } from "electron";

contextBridge.exposeInMainWorld("api", {
  window: {
    minimize: () => ipcRenderer.send("minimize_window"),
    close: () => ipcRenderer.send("close_window"),
  },
  link: {
    open: (url) => shell.openExternal(url),
  },
  osu: {
    get_beatmaps: (search) => ipcRenderer.invoke("get_osu_beatmaps", search),
    check_beatmap_general: (beatmap_folder_path) => ipcRenderer.invoke("check_beatmap_general", beatmap_folder_path),
    check_difficulty: (osu_file_path) => ipcRenderer.invoke("check_beatmap_general", osu_file_path),
  },
});
