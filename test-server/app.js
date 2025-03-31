import express from 'express';

const app = express();
app.use(express.json());

// Initialize with dummy data
let items = [
  { id: 1, name: 'Laptop', price: 999.99 },
  { id: 2, name: 'Smartphone', price: 699.99 },
  { id: 3, name: 'Headphones', price: 149.99 }
];
let currentId = 4; // Next ID to assign

// Create
app.post('/items', (req, res) => {
  const newItem = { id: currentId++, ...req.body };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Read all
app.get('/items', (req, res) => {
  res.json(items);
});

// Read single
app.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).send('Item not found');
  res.json(item);
});

// Update
app.put('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).send('Item not found');
  
  const updatedItem = { ...items[index], ...req.body };
  items[index] = updatedItem;
  res.json(updatedItem);
});

// Delete
app.delete('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).send('Item not found');
  
  items.splice(index, 1);
  res.status(204).send();
});

export default app;

// Start server only when not in test
if (process.env.NODE_ENV !== 'test') {
  const port = 5001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Initial items:', items);
  });
}