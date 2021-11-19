import http from 'http';
import {injectable} from 'inversify';
import {Container} from './container';
import {Logger} from './logger';
import {app} from './app';

@injectable()
export class Server {

	serve() {
    }
}

export const server = Container().get(Server);