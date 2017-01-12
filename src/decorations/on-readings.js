import moment from "moment";

import {log} from "../services/logger";

import {retrieveSites} from "../services/mongo-db";
import {decorateSite} from "../steps/decorate-site";

import {getComfortStatus} from "./on-readings/get-comfort-status";
import {getTelecontrolStatus} from "./on-readings/get-telecontrol-status";

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

            let status = {
                ...site.status
            };

            const comfort = getComfortStatus(reading, site);
            if (comfort) {
                status = { ...status, comfort };
            }

            const telecontrol = getTelecontrolStatus(reading, site);
            if (telecontrol) {
                status = { ...status, telecontrol };
            }

            log.debug({
                reading,
                readingTime,
                lastUpdate,
                status
            });

            if (lastUpdate) {
                await decorateSite(site._id, {
                    lastUpdate: readingTime,
                    status
                });
            }
        }

        return;

    } catch (error) {
        log.error(error);
        throw new Error(error);
    }
}
