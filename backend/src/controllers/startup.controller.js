import fetch from 'node-fetch';
import { asyncHandler } from '../utils/asyscHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';

const getUserLocation = asyncHandler(async (req, res) => {
  const ip =
    req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  if (!ip) {
    throw new apiError(404, 'ip not fetched');
  }

  const ipInfoToken = process.env.IPINFO_TOKEN;
  const ipInfoUrl = `https://ipinfo.io/${ip}/json?token=${ipInfoToken}`;

  const ipRes = await fetch(ipInfoUrl);
  const ipData = await ipRes.json();

  const [latitude, longitude] = ipData.loc ? ipData.loc.split(',') : [null, null];

  const city = ipData.city || null;
  const region = ipData.region || null;
  const country = ipData.country || null;

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { latitude, longitude, city, region, country },
        'Location details fetched',
      ),
    );
});

export { getUserLocation };
