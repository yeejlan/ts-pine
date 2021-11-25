import { PineException } from "./exception";

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

export function throwError(err: unknown, type: string|null = null, code: number|null = null){
    let message = '';
    let ex: PineException;
    if(err instanceof PineException){
        ex = err;
    }else{
        if(typeof err == 'string'){
            message = err;
        }else if(err instanceof Error){
            message = err.message;
        }else{
            message = String(err);
        }
        ex = new PineException(message);
    }
    ex.type = type ?? PineException.name;
    ex.code = code ?? 1000;
    throw ex;
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