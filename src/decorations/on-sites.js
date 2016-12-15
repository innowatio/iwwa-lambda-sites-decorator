import log from "../services/logger";

import {decorateSite} from "../steps/decorate-site";
import {getGeocoordinates} from "../steps/get-geocoordinates";

export async function decorateGeolocation(event) {

    try {
        const site = event.data.element;
        const id = event.data.id;
        if (!id ||
            !site ||
            !site.address) {
            return null;
        }

        log.info({event});

        const geocoordinates = await getGeocoordinates(`${site.address} ${site.province} ${site.city} ${site.country}`);
        if (geocoordinates) {
            await decorateSite(id, {
                ...site,
                latitude: geocoordinates.lat,
                longitude: geocoordinates.lng
            });
        }
    } catch (error) {
        log.error(error);
        throw new Error(error);
    }
}
