import clientPromise from "../lib/mongodb";
import {MongoClient, ObjectId} from "mongodb";

export class MongoUtils {

	static dbName = "sample_mflix"

	static async connectDb() {
		const client = await clientPromise;
		return client.db(MongoUtils.dbName);
	}

	static async findRessourceById(connection: MongoClient, collection: string, idRessource: string){
		return await connection.collection(collection).findOne({_id : new ObjectId(idRessource) })
	}

}


  