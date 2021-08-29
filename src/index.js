const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

const customers = [];

// Middleware
const accountExists = (req, res, next) => {
  const { cpf } = req.headers;
  const customer = customers.find(
    (customer) => customer.cpf === cpf
  );

  if(!customer) {
    return res.status(400).json({ error: "Customer not found." });
  }

  req.customer = customer;

  return next();
};

const getBalance = (statement) => {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    }else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
};

// Endpoints

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

app.post('/deposit', accountExists, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const operation = {
    description,
    amount,
    type: 'credit',
    created_at: new Date()
  };

  customer.statement.push(operation);

  return res.status(201).json({ operation });
});

app.post('/withdraw', accountExists, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;
  const balance = getBalance(customer.statement);

  if(balance < amount) {
    return res.status(400).json({ error: "Insufficents funds." })
  }

  const operation = {
    amount,
    type: 'debit',
    created_at: new Date()
  };

  customer.statement.push(operation);

  return res.status(201).json({ success: `Your balance is: ${balance}` });
});

const formatDate = (date) => {
  date = new Date(date);

  const day = date.getDay();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${day}/${month}/${year}`
}


app.get('/statement/date', accountExists, (req, res)=> {
  const { customer } = req;
  const { date } = req.query;

  const statement = customer.statement.filter((operation) =>
    formatDate(operation.created_at) === formatDate(date)
  );

  return res.status(200).json(statement);
});

app.listen(3333);