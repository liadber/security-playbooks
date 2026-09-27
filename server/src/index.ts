import { createApp } from './app.js';
import { loadConfig } from './config/config.js';
import type { Config } from './config/config.types.js';
import { connectToDatabase } from './shared/db/db.js';

/** Composition root: the only place that reads the environment and exits the process. */
function loadConfigOrExit(): Config {
  try {
    return loadConfig();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

const config = loadConfigOrExit();

try {
  await connectToDatabase(config.mongodbUri);
  console.log('Connected to MongoDB');
} catch (err) {
  // The URI is not printed because it may contain credentials.
  console.error('Failed to connect to MongoDB:', (err as Error).message);
  process.exit(1);
}

createApp(config).listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
