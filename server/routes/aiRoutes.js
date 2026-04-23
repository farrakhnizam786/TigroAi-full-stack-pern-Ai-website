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

router.post('/generate-article', auth, generateArticle);
router.post('/generate-blog-title', auth, generateBlogTitle);
router.post('/generate-image', auth, generateImage);
router.post('/remove-background', auth, upload.single('image'), removeImageBackground);
router.post('/remove-object', auth, upload.single('image'), removeImageObject);
router.post('/review-resume', auth, upload.single('resume'), reviewResume);

export default router;
