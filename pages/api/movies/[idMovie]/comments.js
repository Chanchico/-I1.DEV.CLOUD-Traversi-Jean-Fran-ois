import {ObjectId} from "mongodb";
import {MongoUtils} from "../../../../utils/mongoUtils";
import {Utils} from "../../../../utils/utils";

/**
 * @swagger
 * tags:
 *   name: Comments
 *   summary: Comment Manager
 *
 * /api/movies/{idMovie}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Add a comment to a movie
 *     description: Endpoint to add a comment to a movie.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         description: ID of the movie to which the comment will be added.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: comment
 *         description: The comment object to add.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the commenter.
 *             email:
 *               type: string
 *               format: email
 *               description: Email address of the commenter.
 *             text:
 *               type: string
 *               description: Text of the comment.
 *             date:
 *               type: string
 *               format: date-time
 *               description: Date and time of the comment.
 *     responses:
 *       200:
 *         description: Successfully added the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about state
 *                   example: The comment has been added successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about the error
 *                   example: Invalid input data
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about the error
 *                   example: Movie not found
 *
 *   get:
 *     tags: [Comments]
 *     summary: Get comments for a movie
 *     description: Retrieves comments for a specific movie.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         description: ID of the movie for which comments will be retrieved.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the comment.
 *                   name:
 *                     type: string
 *                     description: Name of the commenter.
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email address of the commenter.
 *                   text:
 *                     type: string
 *                     description: Text of the comment.
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time of the comment.
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about the error
 *                   example: Movie not found
 */


const collection = "comments";
export default async function handler(req, res) {
    const {idMovie} = req.query;
    const filter = {movie_id: new ObjectId(idMovie) };
    const connection = await MongoUtils.connectDb();
    const method = req.method;

    switch (method){
        case 'GET':
            const comments = await connection.collection(collection).find(filter).limit(10).toArray();
            res.status(200).json({data: comments });
            break;
        case 'POST':
            const session = (await MongoUtils.getClient()).startSession()
            const transactionOptions = {
                readPreference: 'primary',
                readConcern: { level: 'local' },
                writeConcern: { w: 'majority' }
            };
            //Open transaction for updating one movie and creating comment : that pratice ensures data consistency
            //See : https://www.mongodb.com/docs/manual/core/transactions/

            try {
                const comment = req.body;

                await session.withTransaction(async () => {
                    // TODO refacto this
                    try {
                        Utils.errorIdThrown(idMovie);
                    } catch (error){
                        res.status(404).json({message: error.message})
                        return
                    }
                    const movie = await MongoUtils.findDocumentById(connection, "movies", idMovie);
                    if (movie == null) {
                        throw new Error("The movie doesn't exist")
                    }
                    const countComment = movie["num_mflix_comments"] += 1;
                    await  (connection.collection("movies").updateOne( {_id : new ObjectId(idMovie) },{$set : {'num_mflix_comments': countComment}}, {session}));

                    comment["movie_id"] = new ObjectId(idMovie);
                    Utils.checkerCommentStruct(comment)
                    const mongoResult = await connection.collection(collection).insertOne(comment, {session});

                    res.status(201).json({ message: Utils.messageCreatedModel(collection), idComment: mongoResult.insertedId });
                }, transactionOptions);
            } catch (error){
                res.status(404).json({ error: error.message });
            }finally {
                await session.endSession();
            }

            break;
    }
}