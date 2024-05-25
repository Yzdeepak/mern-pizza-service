import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = async () => {
  try {
    app.listen(Config.PORT, () => {
      logger.info("Listen on port ");
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

startServer();
