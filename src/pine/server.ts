import http from 'http';
import {injectable} from 'inversify';
import {container} from './container';
import {app} from './app';

@injectable()
export class Server {

	serve() {
    }
}

export const server = container.get(Server);