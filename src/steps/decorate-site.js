import isEmpty from "lodash.isempty";

import {upsertSite} from "../services/mongo-db";

export async function decorateSite(siteId, siteInfos) {
    if (!isEmpty(siteInfos)) {
        await upsertSite(siteId, {
            ...siteInfos
        });
    }
}
