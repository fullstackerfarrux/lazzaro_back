import client from "../db/config.js";

export const getOrders = async (req, res) => {
  const allOrders = [];
  const category = await client.query("select * from orders");

  for (let i = 0; i < category.rows.length; i++) {
    let getUser = await client.query("SELECT * from users WHERE user_id = $1", [
      category.rows[i].user_id,
    ]);

    let res = {
      count: category.rows[i].count,
      order_id: category.rows[i].order_id,
      user_id: category.rows[i].user_id,
      username: category.rows[i].username,
      phone_number: category.rows[i].phone_number,
      total: category.rows[i].total,
      products: category.rows[i].products,
      comment: category.rows[i].comment,
      payment_type: category.rows[i].payment_type,
      payment_status: category.rows[i].payment_status,
      exportation: category.rows[i].exportation,
      created_at: category.rows[i].created_at,
      location:
        getUser.rows[0]?.reverse_location !== undefined
          ? getUser.rows[0]?.reverse_location
          : "",
    };

    allOrders.push(res);
  }

  return res.status(200).json({
    orders: allOrders,
  });
};

export const getOneOrder = async (req, res) => {
  let { user_id } = req.body;

  const orders = await client.query("select * from orders where user_id = $1", [
    user_id,
  ]);

  return res.status(200).json({
    orders: orders.rows,
  });
};
