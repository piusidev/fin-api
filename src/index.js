const { request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

const customers = [];

// Middleware
const accountExists = (req, res, next) => {
  const { cpf } = req.query;
  const customer = customers.find(
    (customer) => customer.cpf === cpf
  );

  if(!customer) {
    return res.status(400).json({ error: "Customer not found." });
  }

  req.customer = customer;

  return next();
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists." });
  };

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  });

  return res.status(201).send(customers);
});

app.get('/statement', accountExists, (req, res)=> {
  const { customer } = req;

  return res.status(200).json(customer.statement);
});

app.listen(3333);