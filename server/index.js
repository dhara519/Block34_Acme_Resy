const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Imported methods
const {
  client,
  buildTable,
  addCustomer,
  addRestaurant,
  createReservation,
  getReservations,
  getCustomers,
  getRestaurants,
  destroyReservation,
} = require("./db");

// Initialize the tables
const init = async () => {
  await client.connect();
  const response = await buildTable();
  app.listen(PORT, () => {
    console.log(`Hello from port number ${PORT}`);
  });
  const [moe, lucy, larry, ethyl, dorsia, sibley, antonios] = await Promise.all(
    [
      addCustomer({ name: "moe" }),
      addCustomer({ name: "lucy" }),
      addCustomer({ name: "larry" }),
      addCustomer({ name: "ethyl" }),
      addRestaurant({ name: "dorsia" }),
      addRestaurant({ name: "sibley" }),
      addRestaurant({ name: "antonios" }),
    ]
  );
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: moe.id,
      restaurant_id: dorsia.id,
      party_count: 6,
      date: "02/14/2025",
    }),
    createReservation({
      customer_id: lucy.id,
      restaurant_id: sibley.id,
      party_count: 2,
      date: "02/28/2025",
    }),
  ]);

  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });
  console.log(response);
};

const fetchCustomers = async () => {
  const SQL = `
  SELECT *
  FROM customers
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
  SELECT *
  FROM restaurants
    `;
  const response = await client.query(SQL);
  return response.rows;
};

// Routes

// GET //
app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await getCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await getRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await getReservations());
  } catch (ex) {
    next(ex);
  }
});

// POST //
app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await fetchCustomers(),
      await fetchRestaurants(),
      await createReservation({
        customer_id: req.body.customer_id,
        restaurant_id: req.body.restaurant_id,
        party_count: req.body.party_count,
        date: req.body.date,
      })
    );
  } catch (error) {
    console.log(error);
  }
});

// DELETE //
app.delete(
  "/api/customers/:customer_id/reservations",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
    }
  }
);

init();
