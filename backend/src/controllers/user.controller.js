import { asyncHandler } from '../utils/asyscHandler.js';
import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const existedUser = await User.findById(userId);
    const accessToken = existedUser.generateAccessToken();
    const refreshToken = existedUser.generateRefreshToken();

    existedUser.refreshToken = refreshToken;
    await existedUser.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, 'Something went wrong while generating access and refresh token');
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    username,
    password,
    age,
    gender,
    weight,
    height,
    bp,
    ongoingMedicines,
    diabetes,
    cholestrol,
    pastSurgery,
    dailyLifestyle,
    familyMedicalHistory,
  } = req.body;

  if (
    [
      fullName,
      email,
      username,
      password,
      age,
      gender,
      weight,
      height,
      bp,
      ongoingMedicines,
      diabetes,
      cholestrol,
      pastSurgery,
      dailyLifestyle,
      familyMedicalHistory,
    ].some((field) => field?.trim() === '')
  )
    throw new apiError(400, 'All fields are required');

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new apiError(409, 'User with same email or username already exists');

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
    age,
    gender,
    weight,
    height,
    bp,
    ongoingMedicines,
    diabetes,
    cholestrol,
    pastSurgery,
    dailyLifestyle,
    familyMedicalHistory,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const createdUser = await User.findById(user._id).select('-password - refreshToken');

  if (!createdUser) {
    throw new apiError(500, 'Something went wrong while registring the user');
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new apiResponse(200, createdUser, 'User registered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new apiError(400, 'email/ username is required');
  }

  const existedUser = await user.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    throw new apiError(404, 'User not found');
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, 'Password is incorrect');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);

  const loggedInUser = await User.findById(existedUser._id).select('-password -refreshToken');

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged in successfully',
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // find user
  // clear cookies
  // make refreshToken null
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new apiResponse(200, {}, 'User logged out'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresToken from cookies
  // validate it with db
  // generate new accessToken
  // provide accessToken & refreshToken to user in cookies

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, 'Unauthorized request');
  }

  try {
    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed',
        ),
      );
  } catch (error) {
    throw new apiError(401, error?.message || 'Invalid refresh token');
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // get user id by cookie
  // get new password from req.body
  // encrpyt the password
  // update the user details and save in db

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(401, 'Invalid old password');
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, {}, 'Passwors changed successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new apiResponse(200, req.user, 'Current user fetched successfully'));
});

// const updateAccountDetails = asyncHandler(async (req, res) => {
//   const { fullName, email } = req.body;

//   if (!(fullName || email)) {
//     throw new apiError(400, 'All fields are required');
//   }

//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set: {
//         fullName,
//         email,
//       },
//     },
//     { new: true },
//   ).select('-password');

//   return res.status(200).json(new apiResponse(200, user, 'Account details updated successfully'));
// });

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
};
