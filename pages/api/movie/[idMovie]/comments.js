import {ObjectId} from "mongodb";
import {MongoUtils} from "../../../utils/mongoUtils";
import {Utils} from "../../../utils/utils";

const collection = "comments";
export default async function handler(req, res) {
    const {idMovie} = req.query;
    const filter = {movie_id: new ObjectId(idMovie) };
    const connection = await MongoUtils.connectDb();
    const method = req.method;

    switch (method){
        case 'GET':
            const comments = await connection.collection(collection).find(filter).limit(10).toArray();
            res.json({ status: 200, data: comments });
            break;
        case 'POST':
            // Attention il ne faut pas qu'il y est l'id dans le req body

            const session = (await MongoUtils.getClient()).startSession()
            const transactionOptions = {
                readPreference: 'primary',
                readConcern: { level: 'local' },
                writeConcern: { w: 'majority' }
            };
            // on veux que l'incremetation du nombre de commentaire dans movie ET que le commentaire soient créer, sinon erreur
            // Voir transaction dans MongoDB : https://www.mongodb.com/docs/manual/core/transactions/

            try {
                const comment = req.body;

                await session.withTransaction(async () => {
                    const movie = await MongoUtils.findDocumentById(connection, "movies", idMovie);
                    if (movie == null) {
                        throw new Error("The movie doesn't exist")
                    }
                    const countComment = movie["num_mflix_comments"] += 1;
                    await  (connection.collection("movies").updateOne( {_id : new ObjectId(idMovie) },{$set : {'num_mflix_comments': countComment}}, {session}));

                    comment["movie_id"] = new ObjectId(idMovie);
                    Utils.checkerCommentStruct(comment)
                    const mongoResult =await  await connection.collection(collection).insertOne(comment, {session});

                    res.json({ message: Utils.messageCreatedModel(collection), idComment: mongoResult.insertedId });
                }, transactionOptions);
            } catch (error){

                res.json({status: 500, error: error.message });
            }finally {
                await session.endSession();
            }

            break;
    }

}