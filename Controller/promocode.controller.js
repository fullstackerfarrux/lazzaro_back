import client from "../db/config.js";

export const createPromo = async (req, res) => {
  let { promo_name, percent, initial_amount, limit } = req.body;

  if (promo_name == "" || promo_name == undefined) {
    return res.status(400).json({
      msg: "promo_name 404",
    });
  }

  let date = new Date();
  let now = `${date.getDate()}.${
    date.getMonth() > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
  }.${date.getFullYear()}`;

  let create = await client.query(
    "INSERT INTO promocode(title, sale, initial_amount, usage_limit, is_active, created_at) values($1, $2, $3, $4, $5, $6)",
    [promo_name, percent, initial_amount, limit, true, now]
  );

  return res.status(200).json({
    msg: "Created!",
  });
};

export const getPromo = async (req, res) => {
  let getAll = await client.query("SELECT * FROM promocode");

  return res.status(200).json({
    data: getAll.rows,
  });
};

export const deletePromo = async (req, res) => {
  let { id } = req.body;

  const deletePromo = await client.query(
    "UPDATE promocode SET is_active = false WHERE id = $1",
    [id]
  );

  return res.status(200).json({
    msg: "Updated!",
  });
};

export const getForUse = async (req, res) => {
  let { id, text } = req.body;

  let getOne = await client.query(
    "SELECT * FROM promocode WHERE title = $1 AND is_active = true",
    [text]
  );

  if (getOne.rows.length > 0) {
    if (getOne.rows[0].usage_limit <= getOne.rows[0]?.usedcount) {
      let updatePromo = await client.query(
        "UPDATE promocode SET is_active = false WHERE id = $1",
        [getOne.rows[0].id]
      );
      return res.status(200).json({
        msg: "Not Found",
      });
    }

    if (
      getOne.rows[0].users_id !== undefined &&
      getOne.rows[0].users_id?.length > 0
    ) {
      for (let i = 0; i < getOne.rows[0].users_id.length; i++) {
        if (getOne.rows[0].users_id[i] == id) {
          return res.status(200).json({
            msg: "Not Found",
          });
        }
      }
    }
  } else {
    return res.status(200).json({
      msg: "Not Found",
    });
  }

  return res.status(200).json({
    msg: getOne.rows[0],
  });
};
