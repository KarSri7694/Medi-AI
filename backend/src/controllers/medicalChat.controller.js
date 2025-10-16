import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { MedicalHistory } from '../models/mediHistory.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import axios from 'axios';

const getMedicalHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new apiError(400, 'User details not provided');
  }

  const MedicalHistoryDetails = await MedicalHistory.findOne({ owner: userId });

  if (!MedicalHistoryDetails) {
    throw new apiError(404, 'No such user exists');
  }

  const aiResponse = await axios.post(`http://${process.env.AI_SERVER_LOCALIP}:8080/init`, {
    MedicalHistoryDetails: MedicalHistoryDetails,
  });

  if (!aiResponse.data) {
    throw new apiError(400, 'No response from AI model');
  }

  return res
    .status(201)
    .json(new apiResponse(201, aiResponse.data, 'User Medical History shared with AI server'));
});

const mediChat = asyncHandler(async (req, res) => {
  const { userMessage } = req.body;
  if (!userMessage) {
    throw new apiError(400, 'User message is required');
  }

  const aiResponse = await axios.post(`http://${process.env.AI_SERVER_LOCALIP}:8080/chat`, {
    userMessage,
  });

  if (!aiResponse.data) {
    throw new apiError(400, 'No response from AI model');
  }

  return res.status(200).json(new apiResponse(200, aiResponse.data, 'Chat completed successfully'));
});

export { getMedicalHistory, mediChat };
