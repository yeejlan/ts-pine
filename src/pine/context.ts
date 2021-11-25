import {IncomingMessage, ServerResponse} from 'http';
import Cookies from 'cookies';
import {Session} from './session';
import {app} from './app';
import {v4 as uuidv4} from 'uuid';
import ejs from 'ejs';
import path from 'path';
import Joi from 'joi';
import {env, envNumber, envBool, throwError} from './functions';
import { UserException } from '.';

const c_post_body_size_max_byte = envNumber('post_body_size_max_byte', 1e8);
const c_session_name = env('session_name', 'session_id');
const c_cookie_domain = env('cookie_domain', '/');
const c_session_expire = envNumber('session_expire_seconds', 3600);
const c_session_enable = envBool('session_enable', false);

export type Params = {
    [k: string]: string,
}

export class Context {
    logger = app.logger;
    request: IncomingMessage;
    response: ServerResponse;
    cookies: Cookies;
    session: Session;
    params!: Params;
    controller!: string;
    id: string;
    action!: string;
    json: any = {};
    files: any;

    constructor(request: IncomingMessage, response: ServerResponse) {
        this.request = request;
        this.response = response;
        this.cookies = new Cookies(request, response);
        this.session = new Session();
        this.id = uuidv4();
    }

    async newSession(){
        if(!c_session_enable){
            return;
        }
        await this.session.destroy();
        this.session.sessionId = uuidv4();
        this.cookies.set(c_session_name, this.session.sessionId, {
            domain: c_cookie_domain
        })
    }

    async loadSession() {
        if(!c_session_enable){
            return;
        }
        let sessionId = this.cookies.get(c_session_name);
        if(!sessionId){
            await this.newSession();
        }else{
            this.session.sessionId = sessionId;
            await this.session.load();
        }
    }

    async flushSession() {
        await this.session.save();
    }

    validate(schema: Joi.Schema): any {
        let params = {};
        try{
            params = Joi.attempt(this.params, schema);
        }catch(err){
            throwError(UserException.name, err);
        }
        return params;
    }

    async getRawBody(): Promise<string> {
        const request = this.request;
        if(request.method == 'POST') {
            return new Promise((resolve, reject) => {
                let raw = '';
                request.on('data', function(data) {
                    raw += data;
                    if(raw.length > 1e8) {
                        raw = '';
                        reject('post too large');
                    }
                });

                request.on('end', function() {
                    resolve(raw);
                });
            });
        }
        return '';
    }

    async getJsonBody(throw_parse_error = false): Promise<any> {
        const rawBody = await this.getRawBody();
        try{
            return JSON.parse(rawBody);
        }catch(err){
            if(throw_parse_error){
                throw err;
            }
        }
        return null;
    }

    async render(filename: string, data: any): Promise<string> {
        let tplbase = 'templates';
        let options = {
            cache: true,
            client: false,
            async: true,
            root: tplbase
        }
        if(app.debug === true) {
            options.cache = false;
        }
        let fullname = path.join(tplbase, `${filename}.ejs`)
        let logger = this.logger;
        return new Promise((resolve, reject) => {
            ejs.renderFile(fullname, data, options, function(err, str){
                if(err) {
                    logger.error("Template render error: %s", err);
                    reject(err);
                }
                resolve(str);
            });
        });
    }

    exit() {
        throw new RequestProcessTerminateException();
    }

    redirect(location: string) {
        this.response.writeHead(302, {
            'Location': location
        });
    }
}

export class RequestProcessTerminateException extends Error {}

