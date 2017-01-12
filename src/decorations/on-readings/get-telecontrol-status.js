import {getStatus} from "./get-status";

export function getTelecontrolStatus(reading, site) {
    return getStatus(reading, site, "telecontrol");
}
