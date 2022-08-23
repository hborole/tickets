import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  Subjects,
} from '@hbofficial/common';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.orderId = data.id;
    await ticket.save();

    msg.ack();
  }
}
