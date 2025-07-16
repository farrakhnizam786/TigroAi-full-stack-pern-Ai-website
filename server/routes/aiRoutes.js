import express from 'express';
import {upload} from '../configs/multer.js'
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeImageObject,
  reviewResume,
} from '../controllers/aicontroller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate-article', generateArticle);
router.post('/generate-blog-title', generateBlogTitle);
router.post('/generate-image', generateImage);
router.post('/remove-background',upload.single('image'), removeImageBackground);
router.post('/remove-object',upload.single('image'), removeImageObject);
router.post('/review-resume',upload.single('resume'), reviewResume);

export default router;
