import express from 'express';
import { addOneMark } from '../controllers/controller.js';

const router = express.Router();

router.post('/addOneMark', addOneMark);

export default router;
