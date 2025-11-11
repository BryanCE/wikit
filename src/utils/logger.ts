import pino from "pino";
import { existsSync, mkdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const LOG_DIR = join(homedir(), ".config", "wikit", "logs");
const LOG_FILE = join(LOG_DIR, "wikit.log");
const ERROR_LOG_FILE = join(LOG_DIR, "error.log");

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

// Rotate old logs (delete wikit.log if older than 7 days)
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

if (existsSync(LOG_FILE)) {
  const stats = statSync(LOG_FILE);
  const age = Date.now() - stats.mtimeMs;

  if (age > SEVEN_DAYS) {
    unlinkSync(LOG_FILE);
  }
}

// Create file destinations with append mode
const allLogsDestination = pino.destination({
  dest: LOG_FILE,
  sync: false,
});

const errorLogsDestination = pino.destination({
  dest: ERROR_LOG_FILE,
  sync: false,
});

// Create logger with multistream
const streams = [
  { level: 'info' as const, stream: allLogsDestination },
  { level: 'error' as const, stream: errorLogsDestination }
];

const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  },
  pino.multistream(streams)
);

export { logger };
