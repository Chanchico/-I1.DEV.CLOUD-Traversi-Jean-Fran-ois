import {MongoUtils} from "../../../../../utils/mongoUtils";
import {Utils} from "../../../../../utils/utils";
import {ObjectId} from "mongodb";



/**
 * @swagger
 *
 * /api/movies/{movieId}/comments/{idComment}:
 *   get:
 *     tags: [Comments]
 *     summary: Get a comment
 *     description: Retrieves a comment for a specific movie.
 *     parameters:
 *       - in: path
 *         name: movieId
 *         description: ID of the movie for which the comment will be retrieved.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idComment
 *         description: ID of the comment to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 body:
 *                   type: string
 *                   description: The comment found
 *       404:
 *         description: Comment or movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about the error
 *                   example: Comment or movie not found
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment
 *     description: Updates a comment for a specific movie.
 *     parameters:
 *       - in: path
 *         name: movieId
 *         description: ID of the movie the comment belongs to.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idComment
 *         description: ID of the comment to update.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: comment
 *         description: The updated comment object. One of any existing value of comment structure
 *         required: true
 *         schema:
 *           type: object
 *           example: {email: "mail@mail.com"}
*
 *     responses:
 *       200:
 *         description: Successfully updated the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about state
 *                   example: The comment has been updated successfully
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
 *         description: Comment or movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about the error
 *                   example: Comment or movie not found
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     description: Deletes a comment for a specific movie.
 *     parameters:
 *       - in: path
 *         name: movieId
 *         description: ID of the movie the comment belongs to.
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idComment
 *         description: ID of the comment to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Successfully deleted the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about state
 *                   example: The comment has been deleted successfully
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
 *         description: Comment or movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Information about the error
 *                   example: Comment or movie not found
 */

const collection  = "comments";
export default async function commentManager(req, res){
    const connection = await MongoUtils.connectDb()
    const {idComment, idMovie} = req.query
    try {
        Utils.errorIdThrown(idMovie);
        Utils.errorIdThrown(idComment);

    } catch (error){
        res.status(404).json({message: error.message})
        return
    }
    const method = req.method
    const commentDb = await MongoUtils.findComment(connection, collection, idMovie, idComment)

    const docFound = commentDb != null  && Object.keys(commentDb).length !== 0


    const commentBody = req.body;
    if (docFound){
        switch (method){
            case 'GET':
                res.status(200).json({ data: commentDb });
                break
            case 'PUT':
                try {
                    // Todo refacto
                    if(commentBody.movie_id){
                        throw new Error("You cannot change the movieId or the movie_id should not be on the request boduy")
                    }

                    Utils.checkCommentOnUpdate(commentBody)
                    const mongoResp = await MongoUtils.updateDocument(connection, collection, idComment, commentBody);
                    if (mongoResp.modifiedCount === 0) {
                        res.status(200).json({message: Utils.messageNothingUpdated()});
                    } else {
                        res.status(200).json({message: Utils.messageUpdatedModel("comment")});
                    }
                } catch (error){
                    res.status(400).json({message: error.message})
                    return
                }

                res.status(201).json({message: Utils.messageUpdatedModel("comment")});
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
                        // TODO refacto this

                        const movie = await MongoUtils.findDocumentById(connection, "movies", idMovie);
                        const countComment = movie["num_mflix_comments"] -= 1;
                        await  (connection.collection("movies").updateOne( {_id : new ObjectId(idMovie) },{$set : {'num_mflix_comments': countComment}}, {session}));

                        await connection.collection(collection).deleteOne({_id : new ObjectId(idComment) }, {session});

                        res.status(202).json({ message: Utils.messageDeletedModel('comment') });
                    }, transactionOptions);
                } catch (error){

                    res.status(400).json({ error: error });
                }finally {
                    await session.endSession();
                }
        }
    } else {
        res.status(404).json({message: Utils.formatTextOfRessourceUndifined()})
    }



}