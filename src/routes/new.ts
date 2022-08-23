import { requireAuth, validateRequest } from '@hbofficial/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const id = req.currentUser!.id;

    const ticket = await Ticket.build({ title, price, userId: id });
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      title: ticket.title,
      price: ticket.price,
      id: ticket.id,
      userId: ticket.userId,
      version: ticket.version,
    });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
