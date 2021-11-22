import {IncomingMessage, ServerResponse} from 'http';
import Cookies from 'cookies';
import {Session} from './session';
import {app} from './app';
import {v4 as uuidv4} from 'uuid';
import ejs from 'ejs';
import path from 'path';
import {env, envNumber, envBool} from './functions';

export class Context {
    logger = app.logger;
    request: IncomingMessage;
    response: ServerResponse;
    cookies: Cookies;
    session: Session;
    protected sessionName = env('session_name');
    protected cookieDomain = env('cookie_domain');
    protected sessionExpire = envNumber('session_expire_seconds', 3600);
    protected sessionEnable = envBool('session_enable', false);
    constructor(request: IncomingMessage, response: ServerResponse) {
        this.request = request;
        this.response = response;
        this.cookies = new Cookies(request, response);
        this.session = new Session();
    }

    async newSession(){
        if(!this.sessionEnable){
            return;
        }
        await this.session.destroy();
        this.session.sessionId = uuidv4();
        this.cookies.set(this.sessionName, this.session.sessionId, {
            domain: this.cookieDomain
        })
    }

    async loadSession() {
        if(!this.sessionEnable){
            return;
        }
        let sessionId = this.cookies.get(this.sessionName);
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

