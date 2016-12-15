import log from "../services/logger";

import {decorateSite} from "../steps/decorate-site";

export async function decorateDemographics(event) {

    const answer = event.data.element;
    if (!answer ||
        !answer.category === "demographics" ||
        !answer.category === "building" ||
        !answer.answers) {
        return null;
    }

    log.info(event, "event");
    let siteInfos = {};

    switch (answer.category) {
        case "demographics": {
            const employeesNumberAnswer = answer.answers.find(x => x.id === 1);
            if (employeesNumberAnswer) {
                siteInfos = {
                    ...siteInfos,
                    employees: employeesNumberAnswer.answer
                };
            }

            const businessTypeAnswer = answer.answers.find(x => x.id === 2);
            if (businessTypeAnswer) {
                siteInfos = {
                    ...siteInfos,
                    businessType: businessTypeAnswer.answer
                };
            }
            break;
        }
        case "building": {
            const areaInMqAnswers = answer.answers.find(x => x.id === 1);
            if (areaInMqAnswers) {
                siteInfos = {
                    ...siteInfos,
                    areaInMq: areaInMqAnswers.answer
                };
            }
        }
    }

    await decorateSite(answer.siteId, siteInfos);
}
