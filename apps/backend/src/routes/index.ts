// routes/index.ts
import { Router } from 'express';
import { authRoutes } from './auth';


const express = require('express');
const router = express.Router();

router.use('/auth', authRoutes);


export { router as apiRoutes }; 