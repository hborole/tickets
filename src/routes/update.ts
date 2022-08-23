import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@hbofficial/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    const { title, price } = req.body;

    ticket.set({ title, price });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      title: ticket.title,
      price: ticket.price,
      id: ticket.id,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
