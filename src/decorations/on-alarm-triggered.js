import moment from "moment";
import get from "lodash.get";

import {log} from "../services/logger";

import {retrieveSites} from "../services/mongo-db";
import {decorateSite} from "../steps/decorate-site";

export async function updateAlarmsStatus(event) {

    try {

        log.debug({event});

        const alarm = event.data.element;
        if (!alarm ||
            !alarm.sensorId ||
            !alarm.count ||
            !alarm.date) {
            return null;
        }

        const alarmDate = moment.utc(alarm.date);
        const alarmMillis = alarmDate.valueOf();

        if (!alarmDate.isSame(moment.utc(), "day")) {
            return;
        }

        const sites = await retrieveSites({
            sensorsIds: alarm.sensorId
        }) || [];

        for (var index = 0; index < sites.length; index++) {
            const site = sites[index];

            const lastUpdate = get(site, "status.alarms.time", 0) < alarmMillis;

            const status = {
                ...site.status,
                alarms: {
                    time: alarmMillis,
                    value: "error",
                    count: alarm.count
                }
            };

            log.debug({
                alarm,
                alarmMillis,
                lastUpdate,
                status
            });

            if (lastUpdate) {
                await decorateSite(site._id, {
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
