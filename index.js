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
