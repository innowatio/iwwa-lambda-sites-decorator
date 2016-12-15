import chai, {expect} from "chai";
import {v4} from "node-uuid";
import nock from "nock";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import url from "url";

chai.use(sinonChai);

import {handler} from "index";
import {getMongoClient} from "services/mongo-db";
import {
    getApiResponse,
    getEventFromObject
} from "../mocks";
import {
    GOOGLE_GEO_API_URL,
    SITES_COLLECTION
} from "config";

describe("Handle kinesis event", async () => {

    var db;
    const context = {
        succeed: sinon.spy(),
        fail: sinon.spy()
    };

    before(async () => {
        db = await getMongoClient();
        await db.createCollection(SITES_COLLECTION);
    });

    after(async () => {
        await db.dropCollection(SITES_COLLECTION);
        await db.close();
    });

    afterEach(async () => {
        await db.collection(SITES_COLLECTION).remove({});
        context.succeed.reset();
        context.fail.reset();
    });

    it("Ignore event", async () => {

        const emptyEvent = getEventFromObject({
            id: "eventId",
            data: {
                element: {},
                id: v4()
            },
            type: "element inserted in collection answers"
        });

        await handler(emptyEvent, context);
        expect(context.succeed).to.have.been.calledOnce;

        const eventReading = getEventFromObject({
            id: "eventId",
            data: {
                element: {},
                id: v4()
            },
            type: "element inserted in collection readings"
        });

        await handler(eventReading, context);
        expect(context.succeed).to.have.been.calledTwice;

        const answerEvent = getEventFromObject({
            id: "eventId",
            data: {
                element: {
                    answers: [{
                        id: 3,
                        answer: "Wrong answer",
                    }],
                    siteId: "32",
                    category: "demographics",
                },
                id: v4()
            },
            type: "element inserted in collection answers"
        });

        await handler(answerEvent, context);
        expect(context.succeed).to.have.been.calledThrice;

        const emptyEventSites = getEventFromObject({
            id: "eventId",
            data: {
                element: {},
                id: v4()
            },
            type: "element inserted in collection sites"
        });

        await handler(emptyEventSites, context);
        expect(context.succeed).to.have.callCount(4);

        const sites = await db.collection(SITES_COLLECTION).find({}).toArray();
        expect(sites).to.be.empty;
    });

    it("Fail on malformed event", async () => {
        const failEvent = getEventFromObject({
            id: "eventId",
            type: "element inserted in collection sites"
        });

        await handler(failEvent, context);
        expect(context.fail).to.have.been.calledOnce;
    });

    describe("Decorate sites", () => {

        describe("On answers events", () => {

            it("Update employees info", async () => {
                const event = getEventFromObject({
                    id: "eventId",
                    data: {
                        element: {
                            answers: [{
                                id: 1,
                                answer: "11-49",
                            }],
                            siteId: "32",
                            category: "demographics",
                        },
                        id: v4()
                    },
                    type: "element inserted in collection answers"
                });

                await handler(event, context);
                expect(context.succeed).to.have.been.calledOnce;

                const sites = await db.collection(SITES_COLLECTION).find({}).toArray();
                expect(sites).to.not.be.empty;

                const site = await db.collection(SITES_COLLECTION).findOne(
                    { _id: "32" }
                );

                expect(site.employees).to.be.deep.equal("11-49");
                expect(site.businessType).to.be.equal(undefined);
                expect(site.areaInMq).to.equal(undefined);
            });

            it("Update businessType info", async () => {
                const event = getEventFromObject({
                    id: "eventId",
                    data: {
                        element: {
                            answers: [{
                                id: 2,
                                answer: "Industria (costruzioni, manifatturiera, agricoltura)",
                            }],
                            siteId: "32",
                            category: "demographics",
                        },
                        id: v4()
                    },
                    type: "element inserted in collection answers"
                });

                await handler(event, context);
                expect(context.succeed).to.have.been.calledOnce;

                const sites = await db.collection(SITES_COLLECTION).find({}).toArray();
                expect(sites).to.not.be.empty;

                const sensor = await db.collection(SITES_COLLECTION).findOne(
                    { _id: "32" }
                );

                expect(sensor.businessType).to.be.equal("Industria (costruzioni, manifatturiera, agricoltura)");
                expect(sensor.employees).to.be.deep.equal(undefined);
            });

            it("Update both businessType and employees info", async () => {
                const event = getEventFromObject({
                    id: "eventId",
                    data: {
                        element: {
                            answers: [{
                                id: 1,
                                answer: "11-49",
                            }, {
                                id: 2,
                                answer: "Industria (costruzioni, manifatturiera, agricoltura)",
                            }],
                            siteId: "32",
                            category: "demographics",
                        },
                        id: v4()
                    },
                    type: "element inserted in collection answers"
                });

                await handler(event, context);
                expect(context.succeed).to.have.been.calledOnce;

                const sites = await db.collection(SITES_COLLECTION).find({}).toArray();
                expect(sites).to.not.be.empty;


                const site = await db.collection(SITES_COLLECTION).findOne({
                    _id: "32"
                });

                expect(site.employees).to.be.deep.equal("11-49");
                expect(site.businessType).to.be.equal("Industria (costruzioni, manifatturiera, agricoltura)");
                expect(site.areaInMq).to.equal(undefined);
            });

            it("Update areaInMq info", async () => {
                const event = getEventFromObject({
                    id: "eventId",
                    data: {
                        element: {
                            answers: [{
                                id: 1,
                                answer: "meno di 75",
                            }],
                            siteId: "32",
                            category: "building",
                        },
                        id: v4()
                    },
                    type: "element inserted in collection answers"
                });

                await handler(event, context);
                expect(context.succeed).to.have.been.calledOnce;

                const sites = await db.collection(SITES_COLLECTION).find({}).toArray();
                expect(sites).to.not.be.empty;

                const site = await db.collection(SITES_COLLECTION).findOne(
                    {_id: "32"}
                );
                expect(site.areaInMq).to.equal("meno di 75");
                expect(site.employees).to.be.deep.equal(undefined);
                expect(site.businessType).to.be.equal(undefined);
            });

        });

        describe("On sites events", () => {

            const site = {
                country: "IT",
                city: "Curno",
                province: "BG",
                address: "Via Enrico Fermi, 2, Curno"
            };

            const urlEncoded = url.resolve("", `${site.address} ${site.province} ${site.city} ${site.country}`);

            nock(GOOGLE_GEO_API_URL)
                .get(`/maps/api/geocode/json?address=${urlEncoded}`)
                .reply(200, getApiResponse(45.6812469, 9.6078499))
                .get("/maps/api/geocode/json?address=Test%20BG%20Curno%20IT")
                .reply(200, getApiResponse(10, 10));

            it("Update latitude and longitude info", async () => {
                const event = getEventFromObject({
                    id: v4(),
                    data: {
                        element: site,
                        id: "cb0a32e9-d11c-4994-a22f-12fe08738468"
                    },
                    type: "element inserted in collection sites"
                });

                await handler(event, context);

                const siteSaved = await db.collection(SITES_COLLECTION).findOne({
                    _id: "cb0a32e9-d11c-4994-a22f-12fe08738468"
                });

                expect(siteSaved).to.be.deep.equal({
                    _id: "cb0a32e9-d11c-4994-a22f-12fe08738468",
                    latitude: 45.6812469,
                    longitude: 9.6078499,
                    ...site
                });

                const eventPut = getEventFromObject({
                    id: v4(),
                    data: {
                        element: {
                            ...site,
                            address: "Test"
                        },
                        id: "cb0a32e9-d11c-4994-a22f-12fe08738468"
                    },
                    type: "element replaced in collection sites"
                });

                await handler(eventPut, context);

                const siteUpdated = await db.collection(SITES_COLLECTION).findOne({
                    _id: "cb0a32e9-d11c-4994-a22f-12fe08738468"
                });

                expect(siteUpdated).to.be.deep.equal({
                    _id: "cb0a32e9-d11c-4994-a22f-12fe08738468",
                    latitude: 10,
                    longitude: 10,
                    ...site,
                    address: "Test"
                });
            });

        });

    });
});
