import { notificationBatchPostSchema, notificationBatchPutSchema, socketGetNotificationSchema, } from "../../schema/schema.js";
import { sendErrorResponse } from "../../utils/function.js";
import prisma from "../../utils/prisma.js";
import { protectionAdmin, protectionMemberUser, } from "../../utils/protection.js";
import { rateLimit } from "../../utils/redis.js";
export const notificationPostMiddleware = async (c, next) => {
    const user = c.get("user");
    const teamMemberProfile = await protectionAdmin(user.id, prisma);
    if (!teamMemberProfile) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const isAllowed = await rateLimit(`rate-limit:${user.id}:email-post`, 50, 60);
    if (!isAllowed) {
        return sendErrorResponse("Too Many Requests", 429);
    }
    const { page, limit } = await c.req.json();
    const sanitizedData = notificationBatchPostSchema.safeParse({
        page,
        limit,
    });
    if (!sanitizedData.success) {
        return sendErrorResponse("Invalid Request", 400);
    }
    c.set("params", sanitizedData.data);
    c.set("teamMemberProfile", teamMemberProfile);
    return await next();
};
export const notificationPutMiddleware = async (c, next) => {
    const user = c.get("user");
    const teamMemberProfile = await protectionAdmin(user.id, prisma);
    if (!teamMemberProfile) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const isAllowed = await rateLimit(`rate-limit:${user.id}:notification-get`, 50, 60);
    if (!isAllowed) {
        return sendErrorResponse("Too Many Requests", 429);
    }
    const { batchData } = await c.req.json();
    const sanitizedData = notificationBatchPutSchema.safeParse({
        batchData,
    });
    if (!sanitizedData.success) {
        return sendErrorResponse("Invalid Request", 400);
    }
    c.set("params", sanitizedData.data);
    c.set("teamMemberProfile", teamMemberProfile);
    return await next();
};
export const notificationGetMiddleware = async (c, next) => {
    const user = c.get("user");
    const teamMemberProfile = await protectionMemberUser(user.id, prisma);
    if (!teamMemberProfile) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const isAllowed = await rateLimit(`rate-limit:${user.id}:notification-get`, 50, 60);
    if (!isAllowed) {
        return sendErrorResponse("Too Many Requests", 429);
    }
    const { take } = await c.req.json();
    const validatedData = socketGetNotificationSchema.safeParse({
        take,
    });
    if (!validatedData.success) {
        return sendErrorResponse("Invalid Request", 400);
    }
    c.set("params", validatedData.data);
    c.set("teamMemberProfile", teamMemberProfile);
    return await next();
};
export const notificationPutNotificationMiddleware = async (c, next) => {
    const user = c.get("user");
    const teamMemberProfile = await protectionMemberUser(user.id, prisma);
    if (!teamMemberProfile) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const isAllowed = await rateLimit(`rate-limit:${user.id}:notification-get`, 50, 60);
    if (!isAllowed) {
        return sendErrorResponse("Too Many Requests", 429);
    }
    const validatedData = socketGetNotificationSchema.safeParse({
        take: 10,
    });
    if (!validatedData.success) {
        return sendErrorResponse("Invalid Request", 400);
    }
    c.set("params", validatedData.data);
    c.set("teamMemberProfile", teamMemberProfile);
    return await next();
};
