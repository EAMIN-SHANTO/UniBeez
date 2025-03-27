import express from "express";
import { getPosts,getPost,createPost,deletePost } from "../controllers/post.controller.js";




const router = express.Router();



// router.get("/anothertest", (req, res) => {
//     res.status(200).send("Hello from user route");
// });


router.get("/",getPosts);
router.get("/:slug",getPost);
router.post("/",createPost);
router.delete("/:id",deletePost);

   




export default router;