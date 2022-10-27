const ENABLE_LOGS = false;

export function log() {
  if (ENABLE_LOGS) console.log(...arguments);
}

export function group() {
  if (ENABLE_LOGS) console.group(...arguments);
}

export function groupEnd() {
  if (ENABLE_LOGS) console.groupEnd(...arguments);
}
