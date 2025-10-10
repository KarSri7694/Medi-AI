import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bycrpt, { hash } from 'bcrypt';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: String,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      min: 1,
      required: true,
    },
    height: {
      type: Number,
      min: 5,
      required: true,
    },
    bp: {
      type: String,
      required: true,
    },
    ongoingMedicine: {
      type: String,
    },
    diabetes: {
      type: String,
      required: true,
    },
    cholestrol: {
      type: String,
      required: true,
    },
    pastSurgery: {
      type: String,
    },
    dailyLifestyle: {
      type: String,
    },
    familyMedicalHistory: {
      type: String,
    },
  },
  { timestamps: true },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this, this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bycrpt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model('User', userSchema);
