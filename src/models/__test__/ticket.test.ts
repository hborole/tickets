import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create an instance of the ticket
  const ticket = Ticket.build({ title: 'Concert', price: 5, userId: '123' });

  // Save the ticket to the database
  await ticket.save(); // This will add a version of 0

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
});
