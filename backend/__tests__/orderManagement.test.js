jest.mock('../middleware/auth.js', () => ({
  __esModule: true,
  authorize: jest.fn((req, res, next) => {
    req.user = { _id: 'mockUserId', role: 'admin' };
    next();
  }),
  authorizeAdmin: jest.fn((req, res, next) => {
    next();
  }),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Order = require('../models/order.model');

const mockOrderData = {
  user: new mongoose.Types.ObjectId(),
  orderItems: [{ name: 'Test Product 1', qty: 1, price: 100, product: new mongoose.Types.ObjectId() }],
  totalPrice: 100,
  totalValue: 100,
  customerInfo: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '1234567890',
    idNumber: '123456789',
  },
  pickupReturn: {
    pickupDate: new Date(),
    returnDate: new Date(),
    pickupAddress: '123 Test St',
    returnAddress: '123 Test St',
    pickupTime: '10:00',
    returnTime: '10:00',
  },
  contract: {
    signed: true,
    agreementVersion: '1.0',
  },
  idUpload: {
    uploaded: true,
  },
  payment: {
    method: 'cash',
  },
};

describe('Order Management API', () => {
  let mongoServer;
  let server;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    server = require('../server');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
  });

  afterEach(async () => {
    await Order.deleteMany();
  });

  it('should fetch all orders', async () => {
    const order1 = new Order(mockOrderData);
    await order1.save();

    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].totalPrice).toBe(100);
  });

  it('should update an order', async () => {
    const order = new Order(mockOrderData);
    await order.save();

    const res = await request(app)
      .put(`/api/orders/${order._id}`)
      .send({ status: 'Accepted' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('Accepted');
  });

  it('should delete an order', async () => {
    const order = new Order(mockOrderData);
    await order.save();

    const res = await request(app).delete(`/api/orders/${order._id}`);
    expect(res.statusCode).toEqual(200);

    const deletedOrder = await Order.findById(order._id);
    expect(deletedOrder).toBeNull();
  });
}); 