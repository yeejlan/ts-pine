import { PineError } from "./error";

type EnvCache = { [k: string]: string };

let env_cache: EnvCache = {};

export function env(key: string, default_value: string = ""): string {

    let val: string = '';
    if(env_cache.hasOwnProperty(key)){
        val = env_cache[key];
    }else{
        val = process.env[key] ?? '';
        env_cache[key] = val;
    }
    if(!val) {
        return default_value;
    }
    return val;
}

export function envNumber(key: string, default_value: number = 0): number {
    let val = env(key);
    if(!val) {
        return default_value;
    }
    return +val || 0;
}

export function envBool(key: string, default_value: boolean = false): boolean {
    let val = env(key);
    if(!val) {
        return default_value;
    }
    if(val.toLowerCase() == 'true'){
        return true;
    }
    return false;
}

export function throwError(type: string, message: string, code: number = 1000){
  let e = new PineError(message);
  e.type = type;
  e.code = code;
  throw e;
}

export function toNumber(val: string): number {
    return +val || 0;
}

export function toBool(val: string): boolean {
    if(val.toLowerCase() == 'true'){
        return true;
    }
    return false;
}