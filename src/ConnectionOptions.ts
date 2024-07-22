import * as O from "fp-ts/Option";
import {pipe} from "fp-ts/function";
import {Option} from "fp-ts/Option";

export type ConnectionOptions = SrvFormatOptions | SimpleFormatOptions

export interface SrvFormatOptions {
    readonly _tag: "srvFormatOptions"
    readonly dbUsername: string
    readonly dbPassword: string
    readonly dbHost: string
    readonly dbName: string
    readonly appName: string
}

export interface SimpleFormatOptions {
    readonly _tag: "simpleFormatOptions"
    readonly dbUsername: Option<string>
    readonly dbPassword: Option<string>
    readonly dbHost: string
    readonly dbPort: Option<number>
    readonly dbName: string
}

export const SrvFormatOptions = (
    dbUsername: string,
    dbPassword: string,
    dbHost: string,
    dbName: string,
    appName: string
): SrvFormatOptions => ({_tag: "srvFormatOptions", dbUsername, dbPassword, dbHost, dbName, appName})

export const SimpleFormatOptions = (
    dbUsername: Option<string>,
    dbPassword: Option<string>,
    dbHost: string,
    dbPort: Option<number>,
    dbName: string
): SimpleFormatOptions => ({_tag: "simpleFormatOptions", dbUsername, dbPassword, dbHost, dbPort, dbName})

export const getConnectionString = (options: ConnectionOptions): string => {
    switch(options._tag) {
        case "srvFormatOptions":
            return `mongodb+srv://${options.dbUsername}:${options.dbPassword}@${options.dbHost}`
                + `/?retryWrites=true&w=majority&appName=${options.appName}`;
        case "simpleFormatOptions":
            return "mongodb://"
                + O.fold(
                    () => "",
                    (u: string) => O.fold(
                        () => `${u}@`,
                        (p: string) => `${u}:${p}@`
                    )(options.dbPassword)
                )(options.dbUsername)
                + options.dbHost
                + pipe(
                    options.dbPort,
                    O.map(p => `:${p.toString()}`),
                    O.getOrElse(() => "")
                )
                + "/?directConnection=true";
    }
}
