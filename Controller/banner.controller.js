import client from "../db/config.js";

export const createPhoto = async (req, res) => {
  let { img_url } = req.body;

  if (img_url == "" || img_url == undefined) {
    return res.status(400).json({
      msg: "img_url 404",
    });
  }

  img_url.map(async (p, index) => {
    await client.query("insert into banner(banner_img) values($1)", [p]);
  });

  return res.status(200).json({
    msg: "Created!",
  });
};

export const getPhoto = async (req, res) => {
  const images = await client.query("SELECT * FROM banner");

  return res.status(200).json({
    images: images.rows,
  });
};

export const deletePhoto = async (req, res) => {
  let { imges_url } = req.body;

  if (imges_url == undefined) {
    return res.status(400).json({
      msg: "imges_url 404",
    });
  }

  let getALl = await client.query("SELECT * FROM banner");
  let filter = [];

  for (let i = 0; i < getALl.rows.length; i++) {
    for (let j = 0; j < imges_url.length; j++) {
      let check = getALl.rows[i].banner_id == imges_url[j].banner_id;

      if (!check) {
        filter.push(getALl.rows[i]);
      }
    }
  }

  filter.map(async (p, index) => {
    await client.query("DELETE FROM banner WHERE banner_img = $1", [
      p.banner_img,
    ]);
  });

  return res.status(200).json({
    msg: "Deleted!",
  });
};
