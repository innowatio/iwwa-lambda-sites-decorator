import moment from "moment";
import get from "lodash.get";

import {log} from "../../services/logger";

function defaultMapping(value) {
    switch (value) {
        case 0:
            return "error";
        case 1:
            return "active";
    }
}

export function getStatus(reading, site, statusType, statusMapper = defaultMapping) {

    const readingTime = moment.utc(reading.date);
    const readingMillis = readingTime.valueOf();

    const lastUpdate = get(site, `status.${statusType}.time`, 0);
    log.debug({
        lastUpdate,
        statusType,
        result: readingMillis < lastUpdate
    });

    if (readingMillis < lastUpdate) {
        return;
    }

    const measurement = reading.measurements.find(x => x.type === statusType);
    if (!measurement) {
        return;
    }

    const status = statusMapper(measurement.value);
    if (!status) {
        return;
    }

    log.debug({
        readingTime,
        readingMillis,
        lastUpdate,
        measurement,
        status
    });

    return {
        value: statusMapper(measurement.value),
        time: readingMillis
    };
}
