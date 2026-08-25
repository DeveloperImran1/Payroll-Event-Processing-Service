import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EventServices } from './event.service';

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.createEventIntoDB(req.body);

  sendResponse(res, {
    statusCode: 202, // 202 Accepted because processing will happen asynchronously
    success: true,
    message: 'Event accepted for processing',
    data: result,
  });
});

const getEvent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await EventServices.getEventFromDB(id);

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Event not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event retrieved successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.getAllEventsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Events fetched successfully',
    data: result,
  });
});

export const EventControllers = {
  createEvent,
  getEvent,
  getAllEvents,
};
