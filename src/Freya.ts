 // Recommended way of loading dotenv
import { Bot } from "./dependecy/FreyaClient";
import container from "./dependecy/Inversify.config";
import { Global } from "./dependecy/Global";
let bot = container.get<Bot>(Global.Bot);
bot.startUp().then(() => {
    console.log('Logged in!')
}).catch((error) => {
    console.log('Oh no! ', error)
});