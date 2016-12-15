import axios from "axios";
import get from "lodash.get";

import {GOOGLE_GEO_API_URL} from "../config";

export async function getGeocoordinates(address) {
    const result = await axios.get(`${GOOGLE_GEO_API_URL}/maps/api/geocode/json?address=${address}`);
    if (result && result.data && result.data.status === "OK" && result.data.results[0]) {
        const geoinfo = result.data.results[0];
        return get(geoinfo, "geometry.location");
    }
}
