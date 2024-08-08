import { Storage } from "./Storage";
import { compare } from "bcrypt";

export interface User {
    readonly username: string;
}

export interface FullUser extends User {
    readonly password: string;
}

export class UserModel {
    constructor(private readonly storage: Storage) {}

    public async logIn(userData: FullUser): Promise<boolean> {
        const user = await this.storage
            .getDb()
            .collection("users")
            .findOne<{ password: string }>({ username: userData.username });
        return !!user?.password && (await compare(userData.password, user.password));
    }
}
