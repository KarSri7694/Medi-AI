import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const MedicalHistorySchema = new mongoose.Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

MedicalHistorySchema.plugin(mongooseAggregatePaginate);

export const MedicalHistory = mongoose.model('MedicalHistory', MedicalHistorySchema);
