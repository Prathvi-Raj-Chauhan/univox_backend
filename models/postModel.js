const {Schema, model} = require("mongoose")

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    postContent: {
        type: String,
        required: true,
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    coverImageURL:{
        type: String,
        required: false
    },
    isPublic:{
        type: Boolean
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    downvotes: {
        type: Number,
        default: 0,
    },
    voters: {
        type: Map, // key: userId, value: 1 (upvoted), -1 (downvoted)
        of: Number,
        default: {},
    },

},{timestamps:true})

const POST = model('posts', postSchema)

module.exports = POST