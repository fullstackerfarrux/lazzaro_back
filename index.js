import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import client from "./db/config.js";
import loginRoute from "./Router/login.route.js";
import categoryRoute from "./Router/category.route.js";
import productRoute from "./Router/products.route.js";
import userRoute from "./Router/user.route.js";
import bannerRoute from "./Router/banner.route.js";
import promocodeRoute from "./Router/promocode.route.js";
import newsletterRoute from "./Router/newsletter.route.js";
import orderRoute from "./Router/orders.route.js";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

let port = process.env.PORT || 4001;
const bot = new TelegramBot(process.env.TelegramApi, { polling: true });

bot.onText(/start/, async (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Здравствуйте ${msg.chat.first_name}!
       Добро пожаловать! Я официальный бот Lazzaro Burger.
       Здесь можно посмотреть меню и заказать на дом!`,
    {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить контакт", request_contact: true }]],
        resize_keyboard: true,
      }),
    }
  );
});

bot.on("contact", async (msg) => {
  const find = await client.query(
    "select * from users where phone_number = $1",
    [msg.contact.phone_number]
  );

  if (find.rowCount == 0) {
    let username = msg.chat.username !== undefined ? msg.chat.username : "";

    const create = await client.query(
      "INSERT INTO users(user_id, chat_id, username, firstname, phone_number) values($1, $2, $3, $4, $5)",
      [
        msg.from.id,
        msg.chat.id,
        username,
        msg.contact.first_name,
        msg.contact.phone_number,
      ]
    );

    bot.sendMessage(msg.chat.id, `Пожалуйста отправьте геопозицию`, {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить геопозицию", request_location: true }]],
        resize_keyboard: true,
      }),
    });
  } else {
    bot.sendMessage(msg.chat.id, `Пожалуйста отправьте геопозицию`, {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить геопозицию", request_location: true }]],
        resize_keyboard: true,
      }),
    });
  }
});

bot.on("location", async (msg) => {
  let { latitude, longitude } = msg.location;
  const location = [latitude, longitude];

  let locationString = "";
  let data = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
  )
    .then((res) => res.json())
    .then(
      (data) =>
        (locationString = `${data.address?.city}, ${data.address?.county}, ${data.address?.road}`)
    );

  const update = await client.query(
    "UPDATE users SET user_location = $1, reverse_location = $2 WHERE user_id = $3",
    [location, locationString, msg.from.id]
  );

  bot.sendMessage(
    msg.chat.id,
    `🛒 <b>Для выбора товара нажмите на кнопку "Меню"</b>

📍 Ваш текущий адрес: ${locationString}

<i>Для изменения адреса нажмите на кнопку "Изменить геопозицию"</i>`,
    {
      reply_markup: JSON.stringify({
        keyboard: [
          [
            {
              text: `Меню`,
              web_app: {
                url: `https://lazzaro-front.vercel.app/${msg.from.id}`,
              },
            },
          ],
          [{ text: "Изменить геопозицию", request_location: true }],
        ],
        resize_keyboard: true,
      }),
      parse_mode: "HTML",
    }
  );
});

bot.on("message", async (msg) => {
  if (msg.web_app_data?.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);
      if (msg.web_app_data.data.length >= 0) {
        let user = await client.query(
          "SELECT * FROM users where user_id = $1",
          [msg.from.id]
        );

        let getPromo = await client.query(
          "SELECT * FROM promocode WHERE id = $1 AND is_active = true",
          [data.promocode]
        );

        let create = await client.query(
          "INSERT INTO orders(products, total, user_id, promocode_id, username, phone_number, comment, payment_type, exportation) values($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [
            data.order_products,
            `${data?.total}`,
            msg.from.id,
            data.promocode,
            msg.from.first_name,
            user.rows[0].phone_number,
            data.comment,
            data.payment,
            data.delivery,
          ]
        );

        let percentagePromo = "";
        if (data.promocode !== "") {
          const order = await client.query(
            "SELECT * FROM orders WHERE user_id = $1",
            [msg.from.id]
          );

          percentagePromo = `${getPromo.rows[0].sale}`;
          let orders_id = [];
          let usedCount = getPromo.rows[0]?.used_count + 1;
          if (
            getPromo.rows[0].orders_id !== undefined &&
            getPromo.rows[0].orders_id?.length > 0
          ) {
            for (let i = 0; i < getPromo.rows[0].orders_id.length; i++) {
              orders_id.push(getPromo.rows[0].orders_id[i]);
            }
            orders_id.push(order.rows[order.rows.length - 1].order_id);
          } else {
            orders_id.push(order.rows[order.rows.length - 1].order_id);
          }

          let updatePromo = await client.query(
            "UPDATE promocode SET used_count = $1, orders_id = $2 WHERE id = $3",
            [usedCount, orders_id, getPromo.rows[0].id]
          );

          if (getPromo.rows[0].usage_limit == getPromo.rows[0].used_count + 1) {
            let updatePromo = await client.query(
              "UPDATE promocode SET is_active = false WHERE id = $1",
              [getPromo.rows[0].id]
            );
          }
        }
        let getCount = await client.query("SELECT MAX(count) FROM orders");

        let startSum = 10000;
        let kmSum = 2000;

        // Convert from degrees to radians
        function degreesToRadians(degrees) {
          var radians = (degrees * Math.PI) / 180;
          return radians;
        }

        // Function takes two objects, that contain coordinates to a starting and destination location.
        function calcDistance(startingCoords, destinationCoords) {
          let startingLat = degreesToRadians(startingCoords.latitude);
          let startingLong = degreesToRadians(startingCoords.longitude);
          let destinationLat = degreesToRadians(destinationCoords.latitude);
          let destinationLong = degreesToRadians(destinationCoords.longitude);

          // Radius of the Earth in kilometers
          let radius = 6571;

          // Haversine equation
          let distanceInKilometers =
            Math.acos(
              Math.sin(startingLat) * Math.sin(destinationLat) +
                Math.cos(startingLat) *
                  Math.cos(destinationLat) *
                  Math.cos(startingLong - destinationLong)
            ) * radius;

          return distanceInKilometers;
        }

        let sCoords = {
          latitude: 41.302626,
          longitude: 69.279813,
        };

        let dCoords = {
          latitude: user.rows[0].user_location[0],
          longitude: user.rows[0].user_location[1],
        };

        let dist = Math.round(calcDistance(sCoords, dCoords));
        let resDeliveryPrice = dist * kmSum + startSum;

        const order = await client.query(
          "SELECT * FROM orders WHERE user_id = $1",
          [msg.from.id]
        );

        let products = [];
        for (
          let p = 0;
          p < order.rows[order.rows.length - 1].products.length;
          p++
        ) {
          let productToJson = JSON.parse(
            order.rows[order.rows.length - 1].products[p]
          );
          products.push(productToJson);
        }

        const token = process.env.TelegramApi;
        const chat_id = process.env.CHAT_ID;
        const message = `<b>Поступил заказ с Telegram бота:</b> ${
          getCount.rows[0].max
        } %0A
  <b>Имя клиента:</b> ${msg.from.first_name} %0A
  <b>Номер:</b> ${user.rows[0].phone_number} ${
          msg.from.username !== undefined ? `| @${msg.from.username}` : ""
        }%0A
  <b>Адрес:</b> ${user.rows[0].reverse_location} (Локация после сообщения) %0A
          %0A
  <b>Дистанция:</b> ${dist}km%0A
  <b>Оплате (${data.payment}) </b>%0A
  <b>Тип выдачи:</b> ${data.delivery} %0A
  <b>Комментарий: ${data.comment !== "" ? `${data.comment}` : "Нет"}</b> %0A
  <b>Промокод: ${
    data.promocode !== ""
      ? `${getPromo?.rows[0]?.title} - ${percentagePromo}%`
      : "Не использован"
  }</b> %0A
  %0A
  <b>Сумма заказа:</b> ${
    data.delivery == "Доставка"
      ? `${(data?.total - resDeliveryPrice).toLocaleString()}`
      : `${(data?.total + 0).toLocaleString()}`
  } UZS %0A
  <b>Доставка:</b> ${
    data.delivery == "Доставка"
      ? ` ${resDeliveryPrice?.toLocaleString()} (${dist} km)`
      : "Самовызов"
  }%0A
  <b>Итого:</b> ${(data?.total + 0).toLocaleString()} UZS%0A
  %0A
  <b>Товары в корзине:</b> ${products.map((i, index) => {
    let text = ` %0A ${index + 1}. ${i.product_name} ${
      i.filling !== "" ? `(${i.filling})` : ``
    } %0A 
    ${i.count} x ${i.price.replace(/\D/g, " ")} = ${
      i.price.replace(/\D/g, "") * i.count
    }`;
    return text;
  })} %0A
        `;
        await axios.post(
          `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&parse_mode=html&text=${message}`
        );

        await axios.post(
          `https://api.telegram.org/bot${token}/sendLocation?chat_id=${chat_id}&latitude=${user.rows[0].user_location[0]}&longitude=${user.rows[0].user_location[1]}`
        );

        await bot.sendMessage(
          msg.chat.id,
          `Ваш заказ принят! Cкоро оператор свяжется с вами! Спасибо за доверие 😊
          Для нового заказа нажмите на кнопку "Отправить контакт"`,
          {
            reply_markup: JSON.stringify({
              keyboard: [
                [{ text: "Отправить контакт", request_contact: true }],
              ],
              resize_keyboard: true,
            }),
          }
        );
      }
    } catch (error) {
      console.log("error ->", error);
    }
  }
});

app.use(loginRoute);
app.use(categoryRoute);
app.use(productRoute);
app.use(userRoute);
app.use(bannerRoute);
app.use(promocodeRoute);
app.use(newsletterRoute);
app.use(orderRoute);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/Images");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
});

app.listen(port, () => {
  console.log(port);
});
