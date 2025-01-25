import { Router } from "express";
import { 
  createReceipt, 
  deleteReceipt, 
  getReceiptById, 
  getReceipts, 
  searchReceipts, 
  updateReceipt 
} from "../controllers/receipt.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const receiptRouter = Router();

// Apply authentication to all receipt routes
receiptRouter.use(authenticate);

// Create receipt with file upload
receiptRouter.route('/')
  .post(upload.single('receiptFile'), createReceipt)
  .get(getReceipts);

  receiptRouter.route('/search').get( authenticate,searchReceipts);
// Individual receipt operations
receiptRouter.route('/:receiptId')
  .get(getReceiptById)
  .put(updateReceipt)
  .delete(deleteReceipt);


export default receiptRouter;