const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json())

const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - array
 */

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

app.get('/statement/:cpf', (req, res)=> {
  const { cpf } = req.params;

  const customer = customers.find(
    (customer) => customer.cpf === cpf
  );

  if(customer === undefined) {
    return res.status(400).json({ error: "Customer not find." });
  };

  if(customer.statement.length === 0) {
    return res.status(204);
  }

  return res.status(200).json(customer.statement);
});

app.listen(3333);