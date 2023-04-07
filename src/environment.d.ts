declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REAL_DEBRID_API_KEY: string;
            ARIA2_URL: string;
            ARIA2_SECRET: string;
            WATCH_DIR?: string;
            WATCH_RATE?: any;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }
