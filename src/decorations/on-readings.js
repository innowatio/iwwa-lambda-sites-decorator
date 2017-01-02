import moment from "moment";

import log from "../services/logger";

import {retrieveSites} from "../services/mongo-db";
import {decorateSite} from "../steps/decorate-site";

export async function decorateLastUpdate(event) {

    try {
        const reading = event.data.element;
        if (!reading ||
            !reading.sensorId ||
            !reading.date) {
            return null;
        }

        log.debug({event});

        const sites = await retrieveSites({
            sensorsIds: reading.sensorId
        }) || [];

        for (var index = 0; index < sites.length; index++) {
            const site = sites[index];

            const readingTime = moment.utc(reading.date).valueOf();
            const lastUpdate = (site.lastUpdate || 0) < readingTime;

            log.debug({
                reading,
                readingTime,
                lastUpdate
            });

            if (lastUpdate) {
                await decorateSite(site._id, {
                    lastUpdate: readingTime
                });
            }
        }

        return;

    } catch (error) {
        log.error(error);
        throw new Error(error);
    }
}
