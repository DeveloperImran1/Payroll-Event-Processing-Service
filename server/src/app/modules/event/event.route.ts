import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { EventControllers } from './event.controller';
import { EventValidations } from './event.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(EventValidations.createEventValidation),
  EventControllers.createEvent
);

router.get('/:id', EventControllers.getEvent);

export const EventRoutes = router;
