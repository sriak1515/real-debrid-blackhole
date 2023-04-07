type UnrestrictLinkResponse = {
    "id": string,
    "filename": string,
    "mimeType": string,  // Mime Type of the file, guessed by the file extension
    "filesize": number, // Filesize in bytes, 0 if unknown
    "link": string, // Original link
    "host": string, // Host main domain
    "chunks": number, // Max Chunks allowed
    "crc": number, // Disable / enable CRC check 
    "download": string, // Generated link
    "streamable": number // Is the file streamable on website
}

type AddTorrentResponse = {
    id: string,
    uri: string
}

type TorrentInfo = {
    "id": string,
    "filename": string,
    "original_filename": string, // Original name of the torrent
    "hash": string, // SHA1 Hash of the torrent
    "bytes": number, // Size of selected files only
    "original_bytes": number, // Total size of the torrent
    "host": string, // Host main domain
    "split": number, // Split size of links
    "progress": number, // Possible values: 0 to 100
    "status": TorrentStatus,
    "added": string, // jsonDate
    "files": TorrentFile[],
    "links": string[],
    "ended": string, // !! Only present when finished, jsonDate
    "speed": number, // !! Only present in "downloading", "compressing", "uploading" status
    "seeders": number // !! Only present in "downloading", "magnet_conversion" status
}

type TorrentFile = {
    "id": number,
    "path": string, // Path to the file inside the torrent, starting with "/"
    "bytes": number,
    "selected": number // 0 or 1
}

type TorrentStatus = "magnet_error" | "magnet_conversion" | "waiting_files_selection" | "queued" | "downloading" | "downloaded" | "error" | "virus" | "compressing" |"uploading" | "dead" //Current status of the torrent
