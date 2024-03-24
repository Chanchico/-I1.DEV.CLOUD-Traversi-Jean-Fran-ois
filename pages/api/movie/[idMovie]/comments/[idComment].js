import {MongoUtils} from "../../../../utils/mongoUtils";
import {Utils} from "../../../../utils/utils";
import {ObjectId} from "mongodb";

const collection  = "comments";
export default async function commentManager(req, res){
    const connection = await MongoUtils.connectDb()
    const {idComment, idMovie} = req.query
    const method = req.method
    const comment = await MongoUtils.findDocumentById(connection, collection, idComment )
    const docFound = comment != null
    if (docFound){
        switch (method){
            case 'GET':
                res.json({ status: 200, 'method': method, data: docFound ? comment : Utils.formatTextOfRessourceUndifined(docFound) });
                break
            case 'PUT':
                // Attention il ne faut pas qu'il y est l'id dans le req body
                res.json({ status: 200, 'method': method, data:  docFound ? await MongoUtils.updateDocument(connection, collection, idComment, req.body) : Utils.formatTextOfRessourceUndifined(docFound)});
                break
            case 'DELETE':
                const session = (await MongoUtils.getClient()).startSession()
                const transactionOptions = {
                    readPreference: 'primary',
                    readConcern: { level: 'local' },
                    writeConcern: { w: 'majority' }
                };
                try {
                    await session.withTransaction(async () => {
                        const movie = await MongoUtils.findDocumentById(connection, "movies", idMovie);
                        const countComment = movie["num_mflix_comments"] -= 1;
                        await  (connection.collection("movies").updateOne( {_id : new ObjectId(idMovie) },{$set : {'num_mflix_comments': countComment}}, {session}));
                        const comment = req.body;
                        comment.movie_id = new ObjectId(idMovie);
                        await connection.collection(collection).deleteOne({_id : new ObjectId(idComment) }, {session});

                        res.json({ status: 200, 'method': method });
                    }, transactionOptions);
                } catch (error){

                    res.json({status: 500, error: error });
                }finally {
                    await session.endSession();
                }
        }
    } else {
        
    }

}