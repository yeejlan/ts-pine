import {IncomingMessage, ServerResponse} from 'http';
import {injectable} from 'inversify';
import {container} from './container';
import {app} from './app';
import mime from 'mime';
import path from 'path';
import fs from 'fs';
import {Form} from 'multiparty';
import {Context, RequestProcessTerminateException} from './context';

export interface RewriteRule {
    regex: RegExp,
    rewriteTo: string,
    paramMapping: Map<number, any>
}

@injectable()
export class Router {
    protected logger = app.logger;
    protected rules: RewriteRule[] = [];
    protected controllers: any = {};

    addRoute(regex: RegExp, rewriteTo: string, paramMapping: Map<number, any>) {
        let rule: RewriteRule = {
            regex: regex,
            rewriteTo: rewriteTo,
            paramMapping: paramMapping
        };
        this.rules.push(rule);
    }

    setControllers(controllers: any) {
        this.controllers = controllers;
    }

    async dispatch(request: IncomingMessage, response: ServerResponse) {
        let parsedUrl = new URL(request.url ?? '', `http://${request.headers.host}`);
        let params = parsedUrl.searchParams;
        let requestUri = parsedUrl.pathname;
        let uri = requestUri.replace(/^\//,'').replace(/\/$/,'');

        let ruleMatched = false;
        let controller = "";
        let action = "";

        if(app.debug == true) {
            let staticFileFound = await this.serveStaticFile(request, response);
            if(staticFileFound){
                return;
            }
        }

        //handle post data
        let post = await this.handlePost(request, response);
        for(let key in post) {
            params.set(key, post[key]);
        }

        //handle multi part form
        let result = await this.handleForm(request, response);
        let [files,fields] = result;
        for(let key in fields) {
            params.set(key, fields[key]);
        }

        //check rewrite rules
        for(let rewrite of this.rules){
            let matches = requestUri.match(rewrite.regex);
            if(!matches || matches.length < 1 ){
                continue;
            }
            //route matched
            let rewriteToArr = rewrite.rewriteTo.split('/');
            if(rewriteToArr.length == 2){
                controller = rewriteToArr[0];
                action = rewriteToArr[1];
            }
            //add params
            if(rewrite.paramMapping != null){
                for(let idx of rewrite.paramMapping.keys()){
                    if(idx < matches.length){
                        let key = rewrite.paramMapping.get(idx);
                        let value = matches[idx];
                        params.set(key, value);
                    }
                }
            }
            ruleMatched = true;
            break;
        }

        //normal controller/action parse
        if(!ruleMatched){
            let uriArr = uri.split('/');  //format: 'controller/action'
            if(uri == ''){
                controller = 'home';
                action = "index";
            }else if(uriArr.length == 1){
                controller = uriArr[0];
                action = "index";
            }else if(uriArr.length == 2){
                controller = uriArr[0];
                action = uriArr[1];
            }
        }

        let ctx = new Context(request, response);
        ctx.files = files;
        ctx.params = params;
        ctx.controller = controller;
        ctx.action = action;

        this.callAction(ctx, controller, action);
    }

    protected capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async callAction(ctx: Context, controller: string, action: string) {
        let controllerStr = this.capitalize(controller) + "Controller";
        let clz = this.controllers[controllerStr];
        if(!clz) {
            this._pageNotFound(ctx);
            return;
        }
        let instance = container.get<typeof clz>(clz);
        let actionStr = action + "Action";
        let func = instance[actionStr];
        if(!func) {
            this._pageNotFound(ctx);
            return;
        }
        try{
            await ctx.loadSession();
            instance.ctx = ctx;
            let before = instance.before;
            if(before) {
                await instance.before();
            }
            let out = await instance[actionStr]();
            await ctx.session.save();
            this._end(ctx, out);
            return;
        }catch(e){
            if(e instanceof RequestProcessTerminateException) {
                this._end(ctx);
                return;
            }else{
                let errStr = String(e);
                if(e instanceof Error) {
                    errStr = e.stack || String(e);
                }
                this.logger.error("Internal server error: %s", errStr);
                this._internalServerError(ctx, e);
                return;
            }
        }
    }

    protected _end(ctx: Context, data: any = null) {
        if(data) {
            if(typeof data == 'string' || data instanceof Buffer){
                ctx.response.setHeader('Content-Type', 'text/html; charset=UTF-8');
                ctx.response.end(data);
            }else{
                ctx.response.setHeader('Content-Type', 'application/json; charset=UTF-8');
                ctx.response.end(JSON.stringify(data));
            }
        }else{
            ctx.response.end();
        }
    }

    protected async _pageNotFound(ctx: Context){
        ctx.response.statusCode = 404;

        let msg404 = "Page Not Found!";
        let controllerStr = "ErrorController"
        let clz = this.controllers[controllerStr];
        if(!clz) {
            ctx.response.end(msg404);
            return
        }
        let instance = container.get<typeof clz>(clz);
        let actionStr = "page404Action";
        let func = instance[actionStr];
        if(!func) {
            ctx.response.end(msg404);
            return;
        }
        try{
            instance.ctx = ctx;
            let out = await instance[actionStr]();
            this._end(ctx, out);
            return;
        }catch(e){
            this._internalServerError(ctx, e)
        }finally {
            //delete uploaded files
            if(ctx.files) {
                let files = ctx.files;
                for (let key in files) {
                    if (files.hasOwnProperty(key)){
                        for(let file of files[key]){
                            fs.unlink(file.path, function (err) {});
                        }
                    }
                }
            }
            //delete end
        }
    }

    protected async _internalServerError(ctx: Context, err: unknown) {
        ctx.response.statusCode = 500;

        let body = '';

        let msg500 = "Internal Server Error!";
        let controllerStr = "ErrorController"
        let clz = this.controllers[controllerStr];
        if(!clz) {
            body = msg500;
        }
        let instance = null;
        let actionStr = 'page500Action';
        if(!body){
            instance = container.get<typeof clz>(clz);
            let func = instance[actionStr];
            if(!func) {
                body = msg500;
            }
        }
        if(!body){
            try{
                instance.ctx = ctx;
                let out = await instance[actionStr]();
                this._end(ctx, out);
            }catch(e){
                ctx.response.end(msg500);
                return;
            }
        }

        if(app.debug === true && err instanceof Error) {
            body += `<br />\n<pre>${err.stack}</pre>`;
        }
        ctx.response.end(body);
    }

    protected async handleForm(request: IncomingMessage, response: ServerResponse): Promise<[any, any]>{
        if(request.method == 'POST' && request.headers['content-type'] == 'multipart/form-data') {
            let form = new Form();
            return new Promise((resolve, reject) => {
                form.parse(request, function(err, fields, files) {
                    if(err) {
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.end('upload error');
                        reject(new Error(String(err)));
                    }else{
                        resolve([fields, files]);
                    }
                });
            });
        }
        return [{},{}];
    }

    protected async handlePost(request: IncomingMessage, response: ServerResponse): Promise<any> {
        if(request.method == 'POST' && request.headers['content-type'] == 'application/x-www-form-urlencoded') {
            return new Promise((resolve, reject) => {
                let queryData = "";
                request.on('data', function(data) {
                    queryData += data;
                    if(queryData.length > 1e6) {
                        queryData = "";
                        response.writeHead(413, {'Content-Type': 'text/plain'});
                        response.end();
                        request.socket.destroy();
                        resolve(false);
                    }
                });

                request.on('end', function() {
                    let post = new URLSearchParams(queryData);
                    resolve(post);
                });
            });
        }
        return {};
    }

    protected async serveStaticFile(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
        let fileNotFound = false;

        let BASEPATH = "public"
        let parsedUrl = new URL(request.url ?? '', `http://${request.headers.host}`);
        let uri = parsedUrl.pathname;
        let ctype = mime.getType(uri);
        let fileLoc = path.join(BASEPATH, uri);

        return new Promise((resolve, reject) => {
            fs.readFile(fileLoc, function(err, data) {
                if (err) {
                    resolve(fileNotFound);
                }else{
                    response.statusCode = 200;
                    response.setHeader('Content-Type', ctype ?? 'application/octet-stream');
                    response.write(data);
                    response.end();
                    resolve(true);
                }
            });
        });
    }
}

export const router = container.get(Router);
