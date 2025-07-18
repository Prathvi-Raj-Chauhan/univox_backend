const POST = require('../models/postModel')

const {v2: cloudinary} = require("cloudinary")

cloudinary.config();

function uploadToCloudinary(fileBuffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'univox_posts', public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}


async function handlePosting(req, res){
    const {title, postContent, isPublic, createdBy} = req.body
    
    if (!title || !postContent || !isPublic) {
      return res.status(400).json({ status: "fail", message: "Missing fields" });
    }
    let imageUrl = '';
    if (req.file) {
        try {
        // Use original filename or generate your own
        const filename = `${Date.now()}-${req.file.filename}`;
        imageUrl = await uploadToCloudinary(req.file.buffer, filename);
        } catch (err) {
        return res.status(500).json({ status: "fail", message: "Image upload failed", error: err });
        }
    }


    const post = await POST.create({
        title: title,
        postContent: postContent,
        // coverImageURL:  req.file && req.file.filename ? `/uploads/${req.file.filename}` : '',
        coverImageURL:  imageUrl,
        isPublic: isPublic,
        // createdBy: req.user._id
        createdBy: createdBy
    })
    console.log("************Successfully Uploaded*************")
    return res.json({
        post
    })
}

async function getAllPosts(req, res){
    const allPosts = await POST.find({isPublic: true}).sort("createdAt").populate('createdBy');
    console.log("**********Successfully sent all Posts***********")
    console.log(allPosts)
    return res.json(allPosts)
}

async function getCurrentUserPosts(req, res){
    const allPosts = await POST.find({createdBy: req.params.userId}).sort("createdAt").populate('createdBy');
    console.log("**********Successfully sent user's Posts***********")
    console.log(allPosts)
    return res.json(allPosts)
}

async function deleteCurrentUserPosts(req, res){
    const allPosts = await POST.deleteOne({_id:  req.params.postId});
    console.log("**********Successfully sent user's Posts***********")
    console.log("deleted post")
    return res.json(allPosts)
}

async function upvotePost(req, res){
    console.log('upwnvote requrest made **********')
    const { postID } = req.params;
    const { userId } = req.body;

    const post = await POST.findById(postID);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const previousVote = post.voters.get(userId);

    if (previousVote === 1) {
    // Toggle off the upvote
    post.upvotes -= 1;
    post.voters.set(userId, 0);
} else {
    // Remove downvote if it exists
    if (previousVote === -1) {
        post.downvotes -= 1;
    }
    // Add upvote
    post.upvotes += 1;
    post.voters.set(userId, 1);
}
    await post.save();
    return res.status(200).json(post);
}

async function downvotePost(req, res){
    console.log('downvote requrest made **********')
    const { postID } = req.params;
  const { userId } = req.body;

  const post = await POST.findById(postID);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const previousVote = post.voters.get(userId);

  if (previousVote === -1) {
    // Toggle off the downvote
    post.downvotes -= 1;
    post.voters.set(userId, 0);
} else {
    // Remove upvote if it exists
    if (previousVote === 1) {
        post.upvotes -= 1;
    }
    // Add downvote
    post.downvotes += 1;
    post.voters.set(userId, -1);
}


  await post.save();
  return res.status(200).json(post);
}
async function updateVisibility (req, res){
    console.log("Public private request made")
  try {
    const { postId } = req.params;
    const { public } = req.body;
    const post = await POST.findByIdAndUpdate( postId, { isPublic: public }, { new: true });
    if (!post){
        console.log("post not found")
        return res.status(404).json({ error: "Post not found" });
    } 
    console.log("success request public private")
    res.json(post);
  } catch (err) {
    console.log("server error")
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
    handlePosting,
    getAllPosts,
    upvotePost,
    downvotePost,
    getCurrentUserPosts,
    deleteCurrentUserPosts,
    updateVisibility
}