import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'New ticket',
    price: 20,
  });
};

it("returns a 404 if provided id doesn't exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'New ticket',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  await request(app)
    .put('/api/tickets/123')
    .send({
      title: 'New ticket',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await createTicket();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'New title',
      price: 100,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const response = await createTicket();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'Test ticket',
      price: -1,
    })
    .expect(400);
});

it('updates the ticket provided valid inputs ', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'New ticket',
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New title',
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('New title');
  expect(ticketResponse.body.price).toEqual(100);
});