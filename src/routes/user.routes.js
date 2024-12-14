import { Router } from "express";
import { 
  registerUser,
   loginUser,
    logoutUser, 
    refershAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUsreChannelProfile, 
    getWatchHistory 
  } from "../controllers/user.controller.js"; // Ensure all required controllers are imported
import { upload } from "../middlewares/multer.middleware.js"; // Multer middleware for file uploads
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Middleware to verify JWT

const router = Router();

// Route for user registration
router.route("/register").post(
  upload.fields([ 
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// Route for user login
router.route("/login").post(loginUser);

// Secured route for user logout
router.route("/logout").post(verifyJWT, logoutUser);

// Route for refreshing access token
router.route("/refresh-token").post(refershAccessToken);

router.route("/change-password").post(verifyJWT,changeCurrentPassword);

router.route("/current-user").get(verifyJWT,getCurrentUser);

router.route("/update-account").patch(verifyJWT,updateAccountDetails);

router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar);

router.route("/cover-image").patch(verifyJWT, upload.single("/coverImage"),updateUserCoverImage);

router.route("/username").get(verifyJWT,getUsreChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory)

export default router;
