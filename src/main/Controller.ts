import { Express, Request, Response } from "express";
import { Subscription, SubscriptionId, SubscriptionModel } from "./SubscriptionModel";
import { FullUser, User, UserModel } from "./UserModel";
import { StatusCodes } from "http-status-codes";

export interface SubscriptionsResponse {
    readonly subscriptions: Subscription[];
}

export const userApiPath = "/api/users/loggedIn";

export const subscriptionsApiPath = "/api/subscriptions";

declare module "express-session" {
    interface SessionData {
        user?: User;
    }
}

export class Controller {
    private getSubscriptions = (request: Request, response: Response): void => {
        if (!request.session.user) {
            response.sendStatus(StatusCodes.FORBIDDEN);
            return;
        }
        this.subscriptionModel
            .getSubscriptions()
            .then((subscriptions) => response.json({ subscriptions }))
            .catch(() => response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private insertSubscription = (
        request: Request<never, Subscription, Subscription>,
        response: Response,
    ): void => {
        if (!request.session.user) {
            response.sendStatus(StatusCodes.FORBIDDEN);
            return;
        }
        this.subscriptionModel
            .insertSubscription(request.body)
            .then((success) =>
                success
                    ? response.json(request.body)
                    : response.sendStatus(StatusCodes.BAD_REQUEST),
            )
            .catch(() => response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private deleteSubscription = (
        request: Request<never, never, SubscriptionId>,
        response: Response,
    ): void => {
        if (!request.session.user) {
            response.sendStatus(StatusCodes.FORBIDDEN);
            return;
        }
        this.subscriptionModel
            .deleteSubscription(request.body)
            .then((success) =>
                success ? response.send() : response.sendStatus(StatusCodes.BAD_REQUEST),
            )
            .catch(() => response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private getLoggedInUser = (request: Request, response: Response): void => {
        if (!request.session.user) {
            response.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        response.json(request.session.user);
    };

    private logIn = (request: Request<never, User, FullUser>, response: Response): void => {
        this.userModel
            .logIn(request.body)
            .then((result) => {
                if (result) {
                    request.session.user = { username: request.body.username };
                    response.json(request.session.user);
                    return;
                }
                response.sendStatus(StatusCodes.UNAUTHORIZED);
            })
            .catch(() => response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private logOut = (request: Request, response: Response): void => {
        request.session.destroy((e: unknown) => {
            if (e) {
                response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
                return;
            }
            response.send();
        });
    };

    constructor(
        private readonly subscriptionModel: SubscriptionModel,
        private readonly userModel: UserModel,
    ) {}

    public registerRoutes(app: Express): void {
        app.get(subscriptionsApiPath, this.getSubscriptions)
            .post(subscriptionsApiPath, this.insertSubscription)
            .delete(subscriptionsApiPath, this.deleteSubscription)
            .get(userApiPath, this.getLoggedInUser)
            .post(userApiPath, this.logIn)
            .delete(userApiPath, this.logOut);
    }
}