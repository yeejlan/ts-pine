import {env, envNumber, envBool, throwError} from './common';

it('env', () => {
    expect(env('app_name')).toBe('pine-lib');
    //with cache
    expect(env('app_name')).toBe('pine-lib');
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
    expect(() => throwError(MyException.name, 'my error', 3210)).toThrowError('my error');
    
    try{
        throwError(MyException.name, 'my error', 3210)
    }catch(e){
        expect(e instanceof Error).toBe(true);
        if(e instanceof Error){
            expect(e.type).toBe(MyException.name);
            expect(e.code).toBe(3210);
        }
    }
});

