import clientPromise from "../lib/mongodb";
import {ObjectId} from "mongodb";

// This class contains methods to perform some redundant operations interacting with mongodb database.

export class MongoUtils {

	static dbName = "sample_mflix"

	static async getClient(){
		return  clientPromise;
	}
	static  async connectDb() {
		const client = await clientPromise;
		return client.db(MongoUtils.dbName);
	}

	static async findDocumentById(connection, collection , idRessource){
		return await connection.collection(collection).findOne({_id : new ObjectId(idRessource) });
	}

	static  async findComment(connection, collection, idMovie, idComment){
		return await connection.collection(collection).findOne({
			_id: new ObjectId(idComment),  movie_id: new ObjectId(idMovie) })
	}
	static async updateDocument(connection, collection, idDoc, docUpdated){
		return await connection.collection(collection).updateOne( {_id : new ObjectId(idDoc) },{$set : docUpdated});
	}

	static async deleteDocument(connection, collection, idDoc){
		return await  connection.collection(collection).deleteOne({_id : new ObjectId(idDoc) })
	}

	static async createDocument(connection, collection, newDoc) {
		return await connection.collection(collection).insertOne(newDoc)
	}


}


  