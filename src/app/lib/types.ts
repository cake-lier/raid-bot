export interface User {
    readonly username: string;
}

export type UserData =
    | {
          readonly isLoggedIn: true;
          readonly user: User;
      }
    | {
          readonly isLoggedIn: false;
          readonly user: undefined;
      };

export interface RegisteredUser {
    readonly userId: number;
    readonly chatId: number;
    readonly username: string;
}

export interface RegisteredUserData {
    readonly registeredUsers: RegisteredUser[];
}
