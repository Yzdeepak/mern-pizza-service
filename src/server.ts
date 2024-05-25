import { Logger } from "winston";
import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = async () => {
  app.listen(Config.PORT, () => {
    logger.info("Listen on port ");
  });
};

startServer();
