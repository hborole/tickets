import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
  // Generate a random ticket id
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send({}).expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({ title: 'New ticket', price: 200 })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual('New ticket');
});
