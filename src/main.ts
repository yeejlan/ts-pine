import dotenv from 'dotenv';
dotenv.config();
import {container} from './pine/container';
import {Logger, ConsoleLogger} from './pine/logger';
container.bind(Logger).to(ConsoleLogger);
import {app, server} from './pine';

async function main() {
    await app.bootstrap();
}

main();
server.serve();

app.shutdown();

