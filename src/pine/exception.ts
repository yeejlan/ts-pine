export interface PineException extends Error {
    type: string,
    code: number,
}

export class PineException extends Error implements PineException {
    code: number;

    constructor(message: string, type?: string, code?: number) {
        super(message);
        this.type = type ?? PineException.name;
        this.code = code ?? 1000;
    }
};


