import { Publisher, Subjects, TicketUpdatedEvent } from '@hbofficial/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
