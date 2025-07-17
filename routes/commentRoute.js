const {Router}  = require("express")
const {handleCommentPosting, handleGettingCommentsOnPost} = require("../controllers/commentsControllers")
const router = Router()

router.post('/:postId', handleCommentPosting)
router.get('/:postId', handleGettingCommentsOnPost)
module.exports = router