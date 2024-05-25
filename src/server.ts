import app from "./app";
import { Config } from "./config";

const startServer = async () => {
  app.listen(Config.PORT, () => {
    console.log("Listen on port ");
  });
};

startServer();
