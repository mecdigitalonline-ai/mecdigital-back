import "dotenv/config";

import { createConfiguredApp } from "./config.js";

const port = Number(process.env.PORT ?? 3001);
createConfiguredApp().listen(port, () => console.info(JSON.stringify({ event: "server_started", port })));
