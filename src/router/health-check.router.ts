import { healthCheck } from '../controllers/health-check.contoller';
import express from 'express'

export default (router: express.Router) => {

    router.get('/health-check', healthCheck);
};