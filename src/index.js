import "babel-polyfill";
import router from "kinesis-router";

import {decorateAlarmsStatus} from "./decorations/on-alarms";
import {decorateDemographics} from "./decorations/on-answers";
import {decorateGeolocation} from "./decorations/on-sites";
import {decorateSiteStatus} from "./decorations/on-readings";
import {updateAlarmsStatus} from "./decorations/on-alarms-aggregates";

export const handler = router()
    /*
     * Custom event dispatched on alarms trigger
     */
    .on("element inserted in collection alarm-triggered", updateAlarmsStatus)
    .on("element inserted in collection alarms", decorateAlarmsStatus)
    .on("element inserted in collection readings", decorateSiteStatus)
    .on("element inserted in collection sites", decorateGeolocation)
    .on("element replaced in collection sites", decorateGeolocation)
    .on("element inserted in collection answers", decorateDemographics);
