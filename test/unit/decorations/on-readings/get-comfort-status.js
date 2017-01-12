import {expect} from "chai";

import {getComfortStatus} from "decorations/on-readings/get-comfort-status";

describe("Comfort decoration", () => {

    it("Return status object with value `active`", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "comfort",
                value: 2,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name"
        };

        const comfortStatus = getComfortStatus(reading, site);

        expect(comfortStatus).to.be.deep.equal({
            value: "active",
            time: 500
        });
    });

    it("Return status object with value `error`", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "comfort",
                value: 0,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name"
        };

        const comfortStatus = getComfortStatus(reading, site);

        expect(comfortStatus).to.be.deep.equal({
            value: "error",
            time: 500
        });
    });

    it("Return status object with value `warning`", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "comfort",
                value: 1,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name"
        };

        const comfortStatus = getComfortStatus(reading, site);

        expect(comfortStatus).to.be.deep.equal({
            value: "warning",
            time: 500
        });
    });

    it("Ignore not mappable status object", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "comfort",
                value: 18,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name"
        };

        const comfortStatus = getComfortStatus(reading, site);

        expect(comfortStatus).to.be.deep.equal(undefined);
    });

    it("Ignore reading older than site current status", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "comfort",
                value: 1,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name",
            status: {
                comfort: {
                    value: 0,
                    time: 600
                }
            }
        };

        const comfortStatus = getComfortStatus(reading, site);

        expect(comfortStatus).to.be.deep.equal(undefined);
    });

});
