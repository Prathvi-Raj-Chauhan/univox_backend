const {Schema, model} = require("mongoose")

const commentSchema = new Schema({
    comment :{
        type: String,
        required: true,
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "posts"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
},{timestamps: true})

const COMMENT = model('comments', commentSchema)

module.exports = COMMENT