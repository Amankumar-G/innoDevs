import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import request from 'supertest';
import app from './app.js';

describe('CRUD API', () => {
  beforeEach(() => {
    // Reset to initial dummy data before each test
    app.locals.items = [
      { id: 1, name: 'Laptop', price: 999.99 },
      { id: 2, name: 'Smartphone', price: 699.99 },
      { id: 3, name: 'Headphones', price: 149.99 }
    ];
    app.locals.currentId = 4;
  });

  it('should return all items', async () => {
    const response = await request(app).get('/items');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.length, 3);
  });

  it('should create a new item', async () => {
    const newItem = { name: 'Tablet', price: 499.99 };
    const response = await request(app)
      .post('/items')
      .send(newItem);
    
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.name, 'Tablet');
    assert.strictEqual(response.body.price, 499.99);
  });

  it('should update an item', async () => {
    const updatedData = { price: 129.99 };
    const response = await request(app)
      .put('/items/3') // Update headphones
      .send(updatedData);
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.price, 129.99);
  });

  it('should delete an item', async () => {
    const response = await request(app).delete('/items/2');
    assert.strictEqual(response.status, 204);
    
    const getResponse = await request(app).get('/items/2');
    assert.strictEqual(getResponse.status, 404);
  });
});