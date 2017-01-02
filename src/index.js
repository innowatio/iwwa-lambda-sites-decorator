import "babel-polyfill";
import router from "kinesis-router";

import {decorateDemographics} from "./decorations/on-answers";
import {decorateGeolocation} from "./decorations/on-sites";
import {decorateLastUpdate} from "./decorations/on-readings";

export const handler = router()
    .on("element inserted in collection readings", decorateLastUpdate)
    .on("element inserted in collection sites", decorateGeolocation)
    .on("element replaced in collection sites", decorateGeolocation)
    .on("element inserted in collection answers", decorateDemographics);
