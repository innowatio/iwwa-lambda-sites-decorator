import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import {v4} from "node-uuid";

chai.use(sinonChai);

import {handler} from "index";
import {getMongoClient} from "services/mongo-db";
import {getEventFromObject} from "../mocks";
import {SITES_COLLECTION} from "config";

describe("Handle kinesis answer event", async () => {

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

        const sites = await db.collection(SITES_COLLECTION).find({}).toArray();
        expect(sites).to.be.empty;
    });

    describe("Decorate sites", () => {

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

            const sensor = await db.collection(SITES_COLLECTION).findOne(
                { _id: "32" }
            );

            expect(sensor.employees).to.be.deep.equal("11-49");
            expect(sensor.businessType).to.be.equal(undefined);
            expect(sensor.areaInMq).to.equal(undefined);
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
            expect(sensor.areaInMq).to.equal(undefined);
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

            const sensor = await db.collection(SITES_COLLECTION).findOne(
                { _id: "32" }
            );

            expect(sensor.employees).to.be.deep.equal("11-49");
            expect(sensor.businessType).to.be.equal("Industria (costruzioni, manifatturiera, agricoltura)");
            expect(sensor.areaInMq).to.equal(undefined);
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

            const sensor = await db.collection(SITES_COLLECTION).findOne(
                {_id: "32"}
            );
            expect(sensor.areaInMq).to.equal("meno di 75");
            expect(sensor.employees).to.be.deep.equal(undefined);
            expect(sensor.businessType).to.be.equal(undefined);
        });

    });
});
