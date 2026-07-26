import { createApp } from './app.ts';
import { config } from './config.ts';
import { migrate } from './db.ts';

migrate();

createApp().listen(config.port, () => {
  console.log(`Teedeux Mart API listening on http://localhost:${config.port}`);
  console.log(`  health: http://localhost:${config.port}/api/health`);
});
