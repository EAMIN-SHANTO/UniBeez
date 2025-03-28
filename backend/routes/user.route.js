import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes - require authentication
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

router.get("/anothertest", (req, res) => {
    res.status(200).send("Hello from user route");
});

console.log('User routes loaded');
console.log('User routes registered:');
console.log('- GET /profile');
console.log('- PUT /profile');

export default router;