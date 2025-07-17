const COMMENT = require("../models/commentsModel")

async function handleCommentPosting(req, res) {
  
  await COMMENT.create({
    comment: req.body.comment,
    postId: req.params.postId,
    createdBy: req.body.createdBy
  })
  console.log("***************Successfully Posted Comment*****************")
  return res.json({
    status: "success"
  })
}

async function handleGettingCommentsOnPost(req, res){
  const comments = await COMMENT.find({postId: req.params.postId}).sort("createdAt").populate("createdBy")
  console.log("all comments", comments)
  console.log("*******fetched all comments**********")
  return res.json(comments)
  
}


module.exports = {
    handleCommentPosting,
    handleGettingCommentsOnPost
}