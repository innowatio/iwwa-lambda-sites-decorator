import log from "./services/logger";

import {decorateSite} from "./steps/decorate-site";

export default async function pipeline(event) {

    log.info(event, "event");

    const rawReading = event.data.element;
    if (!rawReading ||
        !rawReading.category === "demographics" ||
        !rawReading.answers) {
        return null;
    }

    let siteInfos = {};

    const employeesNumberAnswer = rawReading.answers.find(x => x.id === 1);
    if (employeesNumberAnswer) {
        siteInfos = {
            ...siteInfos,
            employees: employeesNumberAnswer.answer
        };
    }

    const businessTypeAnswer = rawReading.answers.find(x => x.id === 2);
    if (businessTypeAnswer) {
        siteInfos = {
            ...siteInfos,
            businessType: businessTypeAnswer.answer
        };
    }

    await decorateSite(rawReading.siteId, siteInfos);
}
