import {MongoClient} from "mongodb";

import {
    MONGODB_URL,
    SITES_COLLECTION
} from "../config";

let dbInstance;

export async function getMongoClient () {
    if (!dbInstance) {
        dbInstance = await MongoClient.connect(MONGODB_URL);
    }
    return dbInstance;
}

export async function upsertSite(id, site) {
    const db = await getMongoClient();
    await db.collection(SITES_COLLECTION).updateOne(
        {_id: id},
        {$set: site},
        {upsert: true}
    );
}
