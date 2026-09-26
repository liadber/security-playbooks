import { createApp } from './app.js';
import { loadConfig } from './config/config.js';
import type { Config } from './config/config.types.js';

// Composition root: the only place that reads the environment and exits the process.
function loadConfigOrExit(): Config {
  try {
    return loadConfig();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

const config = loadConfigOrExit();

createApp().listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
