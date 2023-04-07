import {watch} from "chokidar";
import { ManageTorrentService } from "./service/manageTorrentsService";

const REAL_DEBRID_API_KEY = process.env.REAL_DEBRID_API_KEY;
const ARIA2_URL = process.env.ARIA2_URL;
const ARIA2_SECRET = process.env.ARIA2_SECRET;
const WATCH_DIR = process.env.WATCH_DIR || '/watch';
const WATCH_RATE : number = process.env.WATCH_RATE || 5000;

if (!REAL_DEBRID_API_KEY) {
  console.log('[!] REAL_DEBRID_API_KEY env var is not set')

  process.exit(-1)
}

if (!ARIA2_URL) {
  console.log('[!] ARIA2_URL env var is not set')

  process.exit(-1)
}

if (!ARIA2_SECRET) {
  console.log('[!] ARIA2_SECRET env var is not set')

  process.exit(-1)
}

const manageTorrentsService = new ManageTorrentService(REAL_DEBRID_API_KEY, ARIA2_URL, ARIA2_SECRET);

// Watch for new torrent files
console.log(`[+] Watching '${WATCH_DIR}' for new torrents`)

watch([`${WATCH_DIR}/*.torrent`, `${WATCH_DIR}/*.magnet`])
  .on('add', path => manageTorrentsService.addTorrent(path))

// Check the torrent watch list every "WATCH_RATE" ms
setInterval(() => manageTorrentsService.update(), WATCH_RATE)
