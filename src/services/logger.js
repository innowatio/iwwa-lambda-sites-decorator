import bunyan from "bunyan";

import {LOG_LEVEL} from "../config";

export const log = bunyan.createLogger({
    name: "iwwa-lambda-sites-decorator",
    level: (process.env.NODE_ENV === "test" && !process.env.LOG_LEVEL) ? "fatal" : LOG_LEVEL
});
