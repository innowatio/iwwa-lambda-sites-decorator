import get from "lodash.get";
import moment from "moment";

import {log} from "../services/logger";

import {retrieveSites} from "../services/mongo-db";
import {decorateSite} from "../steps/decorate-site";

export async function decorateAlarmsStatus(event) {

    try {
        const alarm = event.data.element;
        if (!alarm || !alarm.sensorId) {
            return null;
        }

        log.debug({event});

        const sites = await retrieveSites({
            sensorsIds: alarm.sensorId
        }) || [];

        for (var index = 0; index < sites.length; index++) {
            const site = sites[index];

            const status = {
                ...site.status,
                alarms: {
                    value: get(site, "status.alarms.value", "active"),
                    time: moment.utc().valueOf()
                }
            };

            log.debug({
                alarm,
                status
            });

            await decorateSite(site._id, {
                status
            });

        }

        return;

    } catch (error) {
        log.error(error);
        throw new Error(error);
    }
}
