import client from "../db/config.js";

export const createCategory = async (req, res) => {
  let { category_name } = req.body;

  if (category_name == "" || category_name == undefined) {
    return res.status(400).json({
      msg: "title 404",
    });
  }
  const findCategory = await client.query(
    "SELECT * FROM category WHERE category_name = $1",
    [category_name]
  );

  if (findCategory.rowCount > 0) {
    return res.status(400).json({
      msg: "Exists!",
    });
  }

  await client.query("insert into category(category_name) values($1)", [
    category_name,
  ]);

  return res.status(200).json({
    msg: "Created!",
  });
};

export const deleteCategory = async (req, res) => {
  let { category_name } = req.body;

  if (category_name == "" || category_name == undefined) {
    return res.status(400).json({
      msg: "title 404",
    });
  }

  const deleteProduct = await client.query(
    "DELETE FROM product WHERE category_name = $1",
    [category_name]
  );

  const deleteCategory = await client.query(
    "DELETE FROM category WHERE category_name = $1",
    [category_name]
  );

  return res.status(200).json({
    msg: "Deleted!",
  });
};

export const getCategories = async (req, res) => {
  const category = await client.query("select * from category");
  return res.status(200).json({
    categories: category.rows,
  });
};

export const getCategoriesNot = async (req, res) => {
  const category = await client.query("select * from category");

  const notProduct = [];
  for (let i = 0; i < category.rowCount; i++) {
    const checkCategory = await client.query(
      "select * from product where category_name = $1",
      [category.rows[i].category_name]
    );

    if (checkCategory.rowCount <= 0) {
      notProduct.push(category.rows[i].category_name);
    }
  }

  return res.status(200).json({
    categories_not: notProduct,
  });
};
