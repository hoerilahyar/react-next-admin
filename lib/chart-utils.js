// Small helper used by dashboard chart components.
//
// The template's chart libraries (ApexCharts, jsVectorMap) are loaded as
// plain global <script> tags in app/layout.js instead of being installed as
// npm packages. That means a component can mount slightly before the script
// has finished loading, so we poll for the global to show up before we try
// to use it.
export function waitForGlobal(name, { timeout = 5000, interval = 50 } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("waitForGlobal can only run in the browser"));
      return;
    }

    if (window[name]) {
      resolve(window[name]);
      return;
    }

    const start = Date.now();
    const timer = setInterval(() => {
      if (window[name]) {
        clearInterval(timer);
        resolve(window[name]);
      } else if (Date.now() - start > timeout) {
        clearInterval(timer);
        reject(new Error(`Timed out waiting for window.${name}`));
      }
    }, interval);
  });
}

// Similar to waitForGlobal, but waits for an arbitrary condition to become
// true. Used for the jsVectorMap "world_merc" map data, which is registered
// by a separate <script> (world-merc.js) after the jsVectorMap library
// itself has loaded.
export function waitForCondition(check, { timeout = 5000, interval = 50 } = {}) {
  return new Promise((resolve, reject) => {
    if (check()) {
      resolve();
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      if (check()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(timer);
        reject(new Error("Timed out waiting for condition"));
      }
    }, interval);
  });
}
