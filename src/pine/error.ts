interface Error {
    type: string,
    code: number,
}

export function throwError(type: string, message: string, code: number = 1000){
  let e: Error = new Error(message);
  e.type = type;
  e.code = code;
  throw e;
}
