import {expect} from "chai";

import {getTelecontrolStatus} from "decorations/on-readings/get-telecontrol-status";

describe("Telecontrol decoration", () => {

    it("Return status object with value `active`", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "telecontrol",
                value: 1,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name"
        };

        const telecontrolStatus = getTelecontrolStatus(reading, site);

        expect(telecontrolStatus).to.be.deep.equal({
            value: "active",
            time: 500
        });
    });

    it("Return status object with value `error`", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "telecontrol",
                value: 0,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name"
        };

        const telecontrolStatus = getTelecontrolStatus(reading, site);

        expect(telecontrolStatus).to.be.deep.equal({
            value: "error",
            time: 500
        });
    });

    it("Ignore not mappable status object", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "telecontrol",
                value: 18,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name"
        };

        const telecontrolStatus = getTelecontrolStatus(reading, site);

        expect(telecontrolStatus).to.be.deep.equal(undefined);
    });

    it("Ignore reading older than site current status", () => {

        const reading = {
            date: "1970-01-01T00:00:00.500Z",
            measurements: [{
                type: "telecontrol",
                value: 1,
                unitOfMeasurement: "status"
            }]
        };

        const site = {
            _id: "site-id",
            name: "site-name",
            status: {
                telecontrol: {
                    value: 0,
                    time: 600
                }
            }
        };

        const telecontrolStatus = getTelecontrolStatus(reading, site);

        expect(telecontrolStatus).to.be.deep.equal(undefined);
    });

});
