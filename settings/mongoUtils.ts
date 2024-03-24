import clientPromise from "../lib/mongodb";

export class MongoUtils {

	static dbName = "sample_mflix"

	static async connectDb() {
		const client = await clientPromise;
		return client.db(MongoUtils.dbName);
	}
}


  