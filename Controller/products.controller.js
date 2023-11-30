import client from "../db/config.js";

export const createProduct = async (req, res) => {
  let { title, description, price, images, category_name } = req.body;

  if (title == "" || title == undefined) {
    return res.status(400).json({
      msg: "title 404",
    });
  } else if (description == "" || description == undefined) {
    return res.status(400).json({
      msg: "description 404",
    });
  } else if (price == undefined) {
    return res.status(400).json({
      msg: "price 404",
    });
  } else if (images == undefined || images == "") {
    return res.status(400).json({
      msg: "images 404",
    });
  }

  await client.query(
    "insert into product(title, description, price, images, category_name) values($1, $2, $3, $4, $5)",
    [title, description, +price, images, category_name]
  );

  return res.status(200).json({
    msg: "Created!",
  });
};

export const getProducts = async (req, res) => {
  const products = await client.query("select * from product");
  return res.status(200).json({
    products: products.rows,
  });
};

export const deleteProduct = async (req, res) => {
  let { id } = req.body;

  const deleteProduct = await client.query(
    "DELETE FROM product WHERE product_id = $1",
    [id]
  );

  return res.status(200).json({
    msg: "Deleted!",
  });
};

export const changeStatusProduct = async (req, res) => {
  let { id } = req.body;

  const getStatus = await client.query(
    "SELECT * FROM product WHERE product_id = $1",
    [id]
  );

  const changeStatus = await client.query(
    "UPDATE product SET is_active = $1 WHERE product_id = $2",
    [!getStatus.rows[0].is_active, id]
  );

  return res.status(200).json({
    msg: "Changed!",
  });
};

export const getProduct = async (req, res) => {
  let { id } = req.body;
  const product = await client.query(
    "select * from product where product_id = $1",
    [id]
  );
  return res.status(200).json({
    product: product.rows,
  });
};

export const editProduct = async (req, res) => {
  let { id, title, description, price, images, category_name } = req.body;

  await client.query(
    "UPDATE product SET title = $1, description = $2, price = $3, images = $4, category_name = $5 WHERE product_id = $6",
    [title, description, +price, images, category_name, id]
  );

  return res.status(200).json({
    msg: "Updated!",
  });
};
