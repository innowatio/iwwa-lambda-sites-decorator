import {getStatus} from "./get-status";

function comfortMapper(value) {
    switch (value) {
        case 0:
            return "error";
        case 1:
            return "warning";
        case 2:
            return "active";
    }
}

export function getComfortStatus(reading, site) {
    return getStatus(reading, site, "comfort", comfortMapper);
}
