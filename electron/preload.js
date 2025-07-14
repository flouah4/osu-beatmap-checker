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
    check_beatmap: (beatmap_id) => ipcRenderer.invoke("check_beatmap", beatmap_id),
  },
});
