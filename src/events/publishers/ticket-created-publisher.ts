import { Publisher, Subjects, TicketCreatedEvent } from '@hbofficial/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
