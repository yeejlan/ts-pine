
type EnvCache = { [k: string]: string };

let env_cache: EnvCache = {};

function env(key: string, default_value: string = ""): string {

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

function envNumber(key: string, default_value: number = 0): number {
    let val = env(key);
    if(!val) {
        return default_value;
    }
    return +val || 0;
}

function envBool(key: string, default_value: boolean = false): boolean {
    let val = env(key);
    if(!val) {
        return default_value;
    }
    if(val.toLowerCase() == 'true'){
        return true;
    }
    return false;
}

interface Error {
    type: string,
    code: number,
}

function throwError(type: string, message: string, code: number = 1000){
  let e: Error = new Error(message);
  e.type = type;
  e.code = code;
  throw e;
}

globalThis.env = env;
globalThis.envNumber = envNumber;
globalThis.envBool = envBool;
globalThis.throwError = throwError;
