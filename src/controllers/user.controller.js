import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while genrating refersh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validate input fields
    if (
        [fullName, email, username, password].some((field) =>
            !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if the user already exists by email or username
    const existedUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Validate and process uploaded files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar || !avatar.url) {
        throw new ApiError(400, "Failed to upload avatar");
    }

    // Create the user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase(),
    });

    if (!user) {
        throw new ApiError(500, "Failed to create user");
    }

    // Fetch the newly created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Return the success response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Validate required fields
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // Find user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password); // Fixed method name
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id); // Ensure this function works as expected

    // Retrieve user data without sensitive fields
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Set cookies options
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Ensure HTTPS
        sameSite: "Strict", // Optional: prevent CSRF attacks
    };

    // Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions) // Fixed typo (replaced dot with comma)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        // Ensure req.user is defined and contains the correct user object
        if (!req.user || !req.user._id) {
            return res.status(401).json(new ApiResponse(401, {}, "Unauthorized"));
        }

        // Update user record to remove the refresh token
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined,
                },
            },
            { new: true }
        );

        // Clear cookies
        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Server error during logout"));
    }
});

const refershAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError (401, "unauthorized request")
    }

    try {
     const decodedToken = Jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )

     const user = await User.findById(decodedToken?._id)
 
     if (!user) {
         throw new ApiError(401, "Invalid refresh token")
     }
 
     if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "refresh token is expired or used")
     }
 
     const options = {
         httpOnly : true,
         secure: true
        }

     const {accessToken, newRefreshToken} = await
     generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken",newRefreshToken, options)
     .json(
         new ApiResponse(
             200,
             {accessToken,refreshToken : newRefreshToken},
             "Access token refreshed"
         )
     )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refershAccessToken
};
