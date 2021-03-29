 // Recommended way of loading dotenv
import { Client } from "./dependecy/Client";
import container from "./dependecy/Inversify.config";
import { Global } from "./dependecy/Global";
let client = container.get<Client>(Global.Client);
client.startUp().then(() => {
    console.log('Logged in!')
}).catch((error) => {
    console.log('Oh no! ', error)
});