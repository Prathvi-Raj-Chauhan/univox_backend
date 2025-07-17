const {Router} = require("express")
const {handlePosting, getAllPosts, upvotePost, downvotePost, getCurrentUserPosts, deleteCurrentUserPosts,updateVisibility} = require("../controllers/postControllers")
const router = Router()
const multer = require('multer')
const path = require("path")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/uploads/'))
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`
    cb(null,filename)
  }
})
const upload = multer({ storage: storage })


router.post('/',upload.single("coverImage"), handlePosting)
router.get('/', getAllPosts)
router.get('/:userId', getCurrentUserPosts)
router.post('/upvote/:postID', upvotePost)
router.post('/downvote/:postID', downvotePost)
router.delete('/:postId', deleteCurrentUserPosts)
router.patch('/visibility/:postId', updateVisibility);

module.exports = router