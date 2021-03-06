import { PineException } from './exception';
import {env, envNumber, envBool, throwError, toNumber, toBool} from './functions';

it('env', () => {
    expect(env('app_name')).toBe('pine-app');
    //with cache
    expect(env('app_name')).toBe('pine-app');
});

it('env with default value', () => {
    expect(env('not_exist')).toBe('');
    expect(env('not_exist', 'myval')).toBe('myval');
});

it('envNumber', () => {
    expect(envNumber('cache_expired_seconds')).toBe(3600);
    expect(envNumber('app_name')).toBe(0);
});

it('envNumber with default value', () => {
    expect(envNumber('not_exist', 12345)).toBe(12345);
});

it('envBool', () => {
    expect(envBool('app_debug')).toBe(true);
    expect(envBool('app_name')).toBe(false);
});

it('envBool with default value', () => {
    expect(envBool('not_exist', false)).toBe(false);
    expect(envBool('not_exist', true)).toBe(true);
});

class MyException {};

it('throwError', () => {
    expect(() => throwError('my error')).toThrowError('my error');
    
    try{
        throwError('my error', MyException.name, 3210)
    }catch(e){
        expect(e instanceof PineException).toBe(true);
        if(e instanceof PineException){
            expect(e.code).toBe(3210);
            expect(e.type).toBe(MyException.name);
        }
    }
});

it('toNumber', () => {
    expect(toNumber('123.456')).toBe(123.456);
    expect(toNumber('not_number')).toBe(0);
});

it('toBool', () => {
    expect(toBool('TrUe')).toBe(true);
    expect(toBool('not_true')).toBe(false);
});