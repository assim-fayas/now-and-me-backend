const User = require('../model/user/user')
const Post = require('../model/user/post')
const Like = require('../model/user/like')
const Comment = require('../model/user/comment')
const Token = require('../model/user/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../service/sendEmail')
const crypto = require('crypto')
const { log } = require('console')
const { AsyncLocalStorage } = require('async_hooks')
require('dotenv').config()
const mongoose = require('mongoose');

//User Registration
const userRegistration = async (req, res, next) => {
    try {
        console.log("inside registration");
        const { name, email, password } = req.body;
        console.log(req.body);
        const check = await User.findOne({ email: email })
        if (check) {
            return res.status(400).send({ message: "Email alredy exist" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        })
        const added = await user.save()
        const token = crypto.randomBytes(32).toString("hex")
        const Ttoken = await new Token({
            userId: added._id,
            token: token
        }).save();
        await User.findOne({ email: email })
        const url = `${process.env.FRONT_END_URL}user/${added._id}/verify/${Ttoken.token}`
        sendEmail(user.email, " NOW AND ME mail verification", url)
        return res.status(201).send({ message: "An Email has been sent to your account please Verify" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error })
    }
}
//user login
const userLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        console.log("inside user");
        if (!user) {
            return res.status(404).send({ message: "user not found" })
        }
        const hashedPassword = user.password
        const password = await bcrypt.compare(req.body.password, hashedPassword)
        console.log("compared", password);
        if (!password) {
            return res.status(404).send({ message: "password not match" })
        }
        if (user.isBlocked) {
            return res.status(404).send({ message: "your account is suspended" })
        }
        if (!user.isMailVerified) {
            console.log("inside email ilaaaa");
            const token = await Token.findOne({ userId: user._id })
            if (!token) {
                console.log("inside token ilaaaa");
                const tokenGen = crypto.randomBytes(32).toString("hex")
                const Ttoken = await new Token({
                    userId: user._id,
                    token: tokenGen
                }).save()
                let url = `${process.env.FRONT_END_URL}user/${user._id}/verify/${Ttoken.token}`
                console.log("url", url);
                sendEmail(user.email, "NOW & ME mail verification", url)

            }
            return res.status(400).send({ message: "An Email has been sent to your account please Verify" })

        }
        const { _id } = user.toJSON();
        const token = jwt.sign({ _id: _id }, process.env._JWT_USER_SECERETKEY, { expiresIn: 3600 })
        console.log("usertoken", token);
        res.status(200).json({
            token
        })

    } catch (error) {
        res.status(500).send({ message: "Error in user login" })
        console.log(error);
    }
}
//Email verification for user
const verify = async (req, res) => {
    try {
        console.log("inside verify route");

        const id = req.params.id
        const token = req.params.token
        const user = await User.findOne({ _id: id })
        console.log("userrr", user);
        if (!user) {
            return res.status(400).send({ message: "invalid Link" })
        }
        const findtoken = await Token.findOne({ token: token })
        console.log(findtoken, "tokennn");
        if (!findtoken) {
            return res.status(400).send({ message: "invalid token" })
        }
        const verify = await User.updateOne({ _id: id }, { $set: { isMailVerified: true } })
        console.log(verify, "user verified");
        console.log("updated user", user);
        if (verify) {
            const deleteToken = await Token.deleteOne({ token: token })
            console.log("token deleted");
            res.json({ message: "success" })

        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Verification failed' })
    }
}


//user password   otp generating
const otp = async (req, res) => {
    try {
        console.log("inside the change password");
        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            })
        }
        if (user.isBlocked === true) {
            return res.status(404).send({
                messasge: "You'r  Accound is Suspended"
            })
        }
        let otp = Math.random().toString().substr(-4)
        console.log("otp", otp);
        sendEmail(user.email, "NOW & ME mail password reset", otp)
        const addOtpToDb = await User.findOneAndUpdate(
            {}, { $set: { otp: otp } }, { new: true })
        return res.status(200).send({ message: "An otp has been sent to your account please Verify" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Verification failed' })
    }
}


// otp verifying

const veryfyOtp = async (req, res) => {
    try {
        console.log("inside verify otp");
        const { otp } = req.body
        let userOtp = await User.find({ otp: otp })
            .then(userOtp => {
                if (userOtp && userOtp.length > 0) {
                    res.status(200).send({ message: "user verified dddd" })
                } else {
                    return res.status(404).send({ message: "Invalid Otp" })
                }
            })
        const deleteOtp = await User.findOneAndUpdate({ otp: otp }, { $set: { otp: '' } }, { new: true })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "verification failed" })
    }

}

//reset password

const changePassword = async (req, res) => {
    try {
        console.log("inside change password");
        const { password } = req.body
        console.log(password, "backed ethiya password");
        const hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword, "hashed passworddddd");
        const newPass = await User.updateOne({}, { $set: { password: hashedPassword } })
        console.log(newPass, "password updated");
        return res.status(200).send({ message: "password updated successfully" })
    } catch (error) {
        res.status(500).send({ message: "verification failed" })
    }
}



const check = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];


        if (!token) {
            return res.status(401).json({
                auth: false,
                status: "failed",
                message: "No token provided",
            });
        }


        jwt.verify(token, process.env._JWT_USER_SECERETKEY, (err, decoded) => {
            if (err) {
                console.log("errorororororo");
                return res.status(401).json({
                    auth: false,
                    status: "failed",
                    message: "Failed to authenticate",
                });
            } else {
                console.log("inside else block.......");
                console.log(decoded._id);
                req.headers.userId = decoded._id; // Assuming user ID is stored in '_id'
                return res.status(200).send({
                    message: 'success',
                });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "failed",
            message: "Internal server error",
        });
    }
}



const postThoughts = async (req, res) => {
    try {
        const user_id = req.headers.userId
        console.log(user_id);
        console.log("Post thoughts");
        const { postAnonymously, thoughts, tags } = req.body;
        console.log(req.body);

        const post = new Post({
            user: user_id,
            content: thoughts,
            tags: tags,
            anonymous: postAnonymously,
        });

        const postAdded = await post.save();
        console.log(postAdded);

        if (postAdded) {
            return res.status(201).json({ message: "Thought added successfully" });
        } else {
            return res.status(401).json({ message: "Thought not created" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Thought posting failed' });
    }
};


const showPosts = async (req, res) => {
    try {
        console.log("inside show posts");
        const allPosts = await Post.find({ block: false }).populate('user')
        if (allPosts) {
            return res.status(200).json(allPosts)

        } else {
            return res.staus(404).send({ message: "thoughts listing failed" })
        }
    } catch (error) {
        return res.status(500).send({ message: "thoughts listing faild" })
    }


}

//like and unliking

const addLike = async (req, res) => {
    try {
        console.log("inside add liking");
        const userid = req.headers.userId
        const postId = req.params.id
        console.log(postId);
        console.log(userid);
        const liked = await Like.find({ post: postId, user: userid })

        if (liked.length > 0) {
            console.log("inside unlikeddd");
            const unlike = await Like.findOneAndDelete({ user: userid, post: postId })
            if (unlike) {
                const likeCount = await Like.countDocuments({ post: postId })

                const likes = await Like.find({})
                return res.status(200).json({ likeCount, likes })
            } else {

                return res.status(400).send("Unliking failed")
            }
        } else {
            console.log("inside else");
            const like = new Like({
                user: userid,
                post: postId
            })
            const likeAdded = await like.save()
            console.log("saved");
            if (likeAdded) {
                console.log("inside liked after saving");
                const likeCount = await Like.countDocuments({ post: postId })
                const likes = await Like.find({})
                return res.status(200).json({ likeCount, likes })
            } else {
                return res.status(400).send("liking failed")
            }

        }

    } catch (error) {
        return res.status(500).send({ message: "Thoughts liking failed" })
    }
}
const getLikesandComments = async (req, res) => {
    try {
        console.log("getLikesandComments");
        const currentUserId = req.headers.userId
        const currentUser = await User.findById(currentUserId, 'name');
        const posts = await Post.aggregate([
            {
                $match: { block: false }, // Filter posts with block: false
            },
            {
                $lookup: {
                    from: 'likes', // Name of the "Like" collection
                    localField: '_id',
                    foreignField: 'post',
                    as: 'likes',
                },
            },
            {
                $lookup: {
                    from: 'comments', // Name of the "Comment" collection
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments',
                },
            },
            {
                $lookup: {
                    from: 'users', // Name of the "User" collection
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: '$userDetails', // Since $lookup returns an array, unwind it
            },
            {
                $lookup: {
                    from: 'users', // Name of the "User" collection for comments
                    localField: 'comments.user', // Match user ID from comments
                    foreignField: '_id',
                    as: 'commentUsers',
                },
            },
            {
                $unwind: {
                    path: '$commentUsers',
                    preserveNullAndEmptyArrays: true // Preserve posts without comments
                }
            },

            {
                $project: {
                    _id: 1, // Include the post ID
                    user: 1, // Include the user ID
                    content: 1, // Include the content
                    tags: 1,
                    timestamp: 1, // Include the timestamp
                    totalLikes: { $size: '$likes' }, // Calculate total likes
                    totalComments: { $size: '$comments' }, // Calculate total comments
                    likes: '$likes.user', // Include the users who liked the post
                    'userDetails.name': 1, // Include the user's name
                    currentUser: currentUserId,
                    anonymous: 1,
                    comments: {
                        _id: 1,
                        content: 1, // Include the comment content
                        timestamp: 1, // Include the comment timestamp
                        userName: '$commentUsers.name', // Include the user's name for each comment
                        userId: '$commentUsers._id', // Include the user's ID for each comment
                    },
                },
            },
            {
                $addFields: {
                    currentUserName: currentUser ? currentUser.name : null,
                },
            },
        ]);

        return res.json(posts);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "fetching likes and comment faild" })
    }
}



const editPost = async (req, res) => {
    try {
        console.log("inside editttt")
        const postId = req.params.id
        const user = req.headers.userId
        const post = await Post.findOne({ _id: postId, user: user })
        console.log(post);
        if (!post) {
            return res.status(403).send("acces forbidden")
        }
        return res.json(post);


    } catch (error) {
        return res.status(500).send({ message: "post editing faild" })
    }
}
const updatepost = async (req, res) => {
    try {
        console.log("inside update post");
        const postid = req.params.id
        console.log(postid);
        const user = req.headers.userId
        console.log(user);
        const post = await Post.findOne({ _id: postid })
        if (!post) {
            return res.status(404).send("error in post deleting ")
        }
        const { postAnonymously, thoughts, tags } = req.body;
        console.log("req body", req.body.postAnonymously);
        const updatePost = await Post.updateOne({ _id: postid }, { $set: { user: user, content: thoughts, tags: tags, anonymous: postAnonymously, } })
        console.log(updatePost);
        if (updatePost) {
            return res.status(200).send({ message: "Post updated Successfully" })
        } else {
            return res.status(404).send({ message: "Post updating faild" })
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Post updating faild" })
    }
}

const deletePost = async (req, res) => {
    try {
        console.log("inside delete post");
        const postId = req.params.id
        const user = req.headers.userId
        const post = await Post.findOne({ _id: postId, user: user })
        if (!post) {
            return res.status(403).send("acces forbidden")
        }
        //delete comment existed in this post
        const deleteComments = await Comment.deleteMany({ post: postId })
        const deletePost = await Post.findByIdAndDelete({ _id: postId })
        if (deletePost) {
            return res.status(200).send({ message: "Post Deleted Successfully" })
        } else {
            return res.status(404).send("post deleting faild ")
        }
    } catch (error) {

        return res.status(500).send({ message: "post deleting faild" })
    }
}

const flagpost = async (req, res) => {
    try {
        console.log("inside flagpost");
        const postId = req.params.id
        const user = req.headers.userId
        console.log(req.body);
        const post = await Post.findOne({ _id: postId })
        if (!post) {
            return res.status(403).send({ message: "acces forbidden" })
        }
        const newFlag = {
            user: user,
            reason: {
                report: await req.body.report,
                reason: await req.body.reason
            }
        };
        if (newFlag) {
            const addFlag = await Post.updateOne({ _id: postId }, { $push: { flags: newFlag } })
            if (addFlag) {
                return res.status(200).send({ message: "post flagged successfully" })

            } else {
                return res.status(404).send({ message: "error in post flagging" })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in post flagging" })
    }
}


//post comment

const postComment = async (req, res) => {
    try {
        console.log("inside post comment");
        console.log(req.body);
        const { userid, postid, content } = req.body
        const comment = new Comment({
            user: userid,
            post: postid,
            content: content

        })
        const postSaved = await comment.save()
        if (postSaved) {
            return res.status(200).send({ message: "comment added successfully" })
        } else {
            return res.status(404).send({ message: "Error in comment saving" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error in comment saving" })
    }
}

// get all comments

const getAllComments = async (req, res) => {
    try {
        console.log("inside All comments");
        const user = req.headers.userId
        if (!user) {
            return res.status(401).send({ message: "Un Authenticated user" })
        }
        const allComments = await Comment.find({})
        if (allComments) {
            return res.status(200).json({ allComments })
        } else {
            return res.status(404).send({ message: " error in retriving comments" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in retriving comments" })
    }
}

// delete comment
const deleteComment = async (req, res) => {
    try {
        console.log("inside delete comment");
        const user = req.headers.userId
        const commentId = req.params.id
        if (!user) {
            return res.status(401).send({ message: "Un Authenticated user" })
        }
        const deleteComment = await Comment.findByIdAndDelete({ _id: commentId })
        if (deleteComment) {
            return res.status(200).send({ message: "Comment Deleted Successfully" })
        } else {
            return res.status(404).send({ message: "Comment Deleting Faild" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in deleting comments" })
    }
}

const editComment = async (req, res) => {
    try {
        console.log("inside editComment");
        const user = req.headers.userId
        const commentId = req.params.id
        if (!user) {
            return res.status(401).send({ message: "Un Authenticated user" })
        }
        const getComment = await Comment.findById({ _id: commentId })

        if (getComment) {
            return res.json(getComment.content)
        } else {
            return res.status(404).send({ message: "comment retriving failed" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "comment retriving failed" })
    }
}

const updateComment = async (req, res) => {
    try {
        console.log("inside updateComment");
        const user = req.headers.userId
        const commentId = req.params.id
        console.log("comment id", commentId);
        console.log(req.body);
        const { comment } = req.body
        if (!user) {
            return res.status(401).send({ message: "Un Authenticated user" })
        }
        const updateComment = await Comment.updateOne({ _id: commentId }, { $set: { content: comment } })
        if (updateComment) {
            return res.status(200).send({ message: "comment updated successfully" })
        } else {
            return res.status(200).send({ message: "comment updating faild" })
        }
    } catch (error) {
        return res.status(500).send({ message: "comment updating faild" })
    }
}


const thoughtsOfSingleUser = async (req, res) => {
    try {
        console.log("inside thoughts of single user");
        const userId = req.headers.userId
        console.log("user iddddddd", userId);
        if (!userId) {
            return res.status(401).send({ message: "Un Authenticated user" })
        }
        const convertedUserId = new mongoose.Types.ObjectId(userId);
        const posts = await Post.aggregate([
            {
                $match: { user: convertedUserId, block: false }// Filter posts with block: false
            },
            {
                $lookup: {
                    from: 'likes', // Name of the "Like" collection
                    localField: '_id',
                    foreignField: 'post',
                    as: 'likes',
                },
            },
            {
                $lookup: {
                    from: 'comments', // Name of the "Comment" collection
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments',
                },
            },
            {
                $lookup: {
                    from: 'users', // Name of the "User" collection
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: '$userDetails', // Since $lookup returns an array, unwind it
            },
            {
                $lookup: {
                    from: 'users', // Name of the "User" collection for comments
                    localField: 'comments.user', // Match user ID from comments
                    foreignField: '_id',
                    as: 'commentUsers',
                },
            },
            {
                $unwind: {
                    path: '$commentUsers',
                    preserveNullAndEmptyArrays: true // Preserve posts without comments
                }
            },

            {
                $project: {
                    _id: 1, // Include the post ID
                    user: 1, // Include the user ID
                    content: 1, // Include the content
                    tags: 1,
                    timestamp: 1, // Include the timestamp
                    totalLikes: { $size: '$likes' }, // Calculate total likes
                    totalComments: { $size: '$comments' }, // Calculate total comments
                    likes: '$likes.user', // Include the users who liked the post
                    'userDetails.name': 1, // Include the user's name

                    anonymous: 1,
                    comments: {
                        _id: 1,
                        content: 1, // Include the comment content
                        timestamp: 1, // Include the comment timestamp
                        userName: '$commentUsers.name', // Include the user's name for each comment
                        userId: '$commentUsers._id', // Include the user's ID for each comment
                    },
                },
            },

        ]);
        console.log(posts, "posttttttttttttttttttttttttttttttttttttttttttttttttttt");
        return res.json(posts);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error in fetching thoughts of single user" })

    }
}
const getSingleTHoughts = async (req, res) => {
    try {
        // Find the specific post by its ID
        const postId = req.params.id
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send({ message: "no post found on this id" })

        }

        // Count the number of likes for the post
        const likeCount = await Like.countDocuments({ post: postId });

        // Count the number of comments for the post
        const commentCount = await Comment.countDocuments({ post: postId });

        // Return the post, like count, and comment count
        if (post, likeCount, commentCount) {
            return res.status(200).json({
                post,
                likeCount,
                commentCount,
            });
        } else {
            return res.status(404).send({ message: "error in single thought" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in single thought" })
    }
}
// getPostDetails(postId).then((result) => {
//     if (result.error) {
//         console.error(result.error);
//     } else {
//         console.log('Post:', result.post);
//         console.log('Like Count:', result.likeCount);
//         console.log('Comment Count:', result.commentCount);
//     }
// });

const allUsers = async (req, res) => {
    try {

        const expertid = req.headers.expertId;
        const allUser = await User.find({})
        if (allUser) {
            return res.status(200).json({ allUser, expertid })
        } else {
            return res.status(404).send({ message: "error in fetching users" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in fetching users" })
    }
}

const flagedPosts = async (req, res) => {
    try {
        console.log("inside flaged Posts");
        const flagedPosts = await Post.find({ flags: { $not: { $size: 0 } } }).populate({ path: 'flags.user', select: 'name', }).populate('user', 'name')
        console.log(flagedPosts);
        if (flagedPosts) {

            console.log(flagedPosts);
            return res.status(200).json({ flagedPosts })

        } else {
            return res.status(500).send({ message: "error in flaged post" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in flaged post" })
    }
}


module.exports = {
    userRegistration,
    verify,
    userLogin,
    otp,
    veryfyOtp,
    changePassword,
    check,
    postThoughts,
    showPosts,
    addLike,
    getLikesandComments,
    editPost,
    deletePost,
    updatepost,
    flagpost,
    postComment,
    getAllComments,
    deleteComment,
    editComment,
    updateComment,
    thoughtsOfSingleUser,
    allUsers,
    flagedPosts,
    getSingleTHoughts
}