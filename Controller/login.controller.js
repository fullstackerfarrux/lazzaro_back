import jwt from "jsonwebtoken";
import client from "../db/config.js";

export const login = async (req, res) => {
  let { username, password } = req.body;

  let getSettings = await client.query("SELECT * FROM settings");

  if (
    username == getSettings.rows[0].admin_login &&
    password == getSettings.rows[0].admin_password
  ) {
    let token = jwt.sign(
      { id: getSettings.rows[0].id },
      process.env.SECRET_KEY,
      {
        expiresIn: "48h",
      }
    );

    return res.status(200).send({
      msg: "Login succes!!",
      token,
    });
  } else {
    return res.status(400).send({
      msg: "Bad Request",
    });
  }
};

export const changePassword = async (req, res) => {
  let { oldpassword, newpassword } = req.body;

  let getSettings = await client.query(
    "SELECT * FROM settings WHERE admin_password = $1",
    [oldpassword]
  );

  if (getSettings.rows.length > 0) {
    let updatePassword = await client.query(
      "UPDATE settings SET admin_password = $1 WHERE id = $2",
      [newpassword, getSettings.rows[0].id]
    );

    return res.status(200).send({
      msg: "Updated!",
    });
  } else {
    return res.status(400).send({
      msg: "Bad Request",
    });
  }
};

export const changeDelivery = async (req, res) => {
  let { delivery_price } = req.body;

  let getSettings = await client.query("SELECT * FROM settings");
  console.log(getSettings);

  let updatePassword = await client.query(
    "UPDATE settings SET delivery_price = $1 WHERE id = $2",
    [delivery_price, getSettings.rows[0].id]
  );

  return res.status(200).send({
    msg: "Updated!",
  });
};

export const getDelivery = async (req, res) => {
  let getSettings = await client.query("SELECT delivery_price FROM settings");

  return res.status(200).send({
    msg: getSettings.rows[0],
  });
};
