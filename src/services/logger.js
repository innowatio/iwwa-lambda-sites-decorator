import bunyan from "bunyan";

import {LOG_LEVEL} from "../config";

const logger = bunyan.createLogger({name: "iwwa-lambda-sites-decorator"});

logger.level(process.env.NODE_ENV === "test" ? "fatal" : LOG_LEVEL);

export default logger;
