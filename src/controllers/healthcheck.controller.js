import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

import logger from "../logger/index.js"

const healthcheck = asyncHandler(async(req, res) => {
    
    logger.info("Healthcheck passed")
    
    return res.status(200).json(new ApiResponse(200, "Healthcheck is passed"))
})

export { healthcheck};