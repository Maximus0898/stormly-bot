const { Telegraf } = require('telegraf');
const MarkUp = require('telegraf/markup');

const Stage = require('telegraf/stage');
const session = require('telegraf/session');
const WizardScene = require('telegraf/scenes/wizard');

const dotenv = require('dotenv');
dotenv.config();
const getWeather = require('./api/getWeather');

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);

bot.start((ctx) =>
  ctx.reply(
    `Hello ${ctx.from.first_name}! I am Stormly.Would you like to know what's the weather like today?`,
    MarkUp.inlineKeyboard([
      MarkUp.callbackButton('Get Forecast', 'GET_FORECAST'),
    ]).extra()
  )
);
bot.help((ctx) =>
  ctx.reply("We don't have a help section right now! Sorry :(")
);

const getForecast = new WizardScene(
  'get_forecast',
  (ctx) => {
    ctx.reply('Please enter your city 🏙 :');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.cityName = ctx.message.text;
    getWeather(ctx.wizard.cityName)
      .then((res) => {
        // UNIX time to GMT
        const sunrise = new Date(parseInt(res.sys.sunrise) * 1000);
        const sunset = new Date(parseInt(res.sys.sunset) * 1000);

        ctx.reply(
          `Obtaining the current weather info for ${ctx.wizard.cityName}`
        );
        ctx.reply(
          `📍 ${res.name}\n\n🌡 Temperature: ${Math.floor(
            res.main.temp
          )} °C\n           ${
            res.weather[0].description.charAt(0).toUpperCase() +
            res.weather[0].description.slice(1)
          }\n\n💧 Humidity: ${res.main.humidity} %\n\n🚨 Pressure: ${
            res.main.pressure
          } hPa\n\n🌬 Wind: ${
            res.wind.speed
          } km/h\n\n🌅 Sunrise :  ${sunrise.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}\n\n🌇 Sunset:  ${sunset.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          `,
          MarkUp.inlineKeyboard([
            MarkUp.callbackButton('Get another forecast', 'GET_FORECAST'),
          ]).extra()
        );
      })
      .catch((err) => {
        ctx.reply(
          `Oops, Something went wrong.\nError: ${
            err.response.data.cod
          } - ${err.response.data.message.toUpperCase()}`,
          MarkUp.inlineKeyboard([
            MarkUp.callbackButton('Get another forecast', 'GET_FORECAST'),
          ]).extra()
        );
      });

    return ctx.scene.leave();
  }
);

const stage = new Stage([getForecast], { default: 'get_forecast' });

bot.use(session());
bot.use(stage.middleware());
bot.launch();
