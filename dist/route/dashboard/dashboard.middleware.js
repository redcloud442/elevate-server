import { dashboardPostSchema } from "../../schema/schema.js";
import { sendErrorResponse } from "../../utils/function.js";
import prisma from "../../utils/prisma.js";
import { protectionAdmin } from "../../utils/protection.js";
import { rateLimit } from "../../utils/redis.js";
import { supabaseClient } from "../../utils/supabase.js";
export const dashboardPostMiddleware = async (c, next) => {
    const token = c.req.header("Authorization")?.split("Bearer ")[1];
    if (!token) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const supabase = supabaseClient;
    const user = await supabase.auth.getUser(token);
    if (user.error) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const response = await protectionAdmin(user.data.user.id, prisma);
    if (response instanceof Response) {
        return response;
    }
    const { teamMemberProfile } = response;
    if (!teamMemberProfile) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const isAllowed = await rateLimit(`rate-limit:${teamMemberProfile.alliance_member_id}:dashboard-post`, 100, 60);
    if (!isAllowed) {
        return sendErrorResponse("Too Many Requests", 429);
    }
    const { dateFilter } = await c.req.json();
    const validate = dashboardPostSchema.safeParse({ dateFilter });
    if (!validate.success) {
        return sendErrorResponse("Invalid Request", 400);
    }
    c.set("teamMemberProfile", teamMemberProfile);
    c.set("dateFilter", dateFilter);
    await next();
};
export const dashboardGetMiddleware = async (c, next) => {
    const token = c.req.header("Authorization")?.split("Bearer ")[1];
    if (!token) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const supabase = supabaseClient;
    const user = await supabase.auth.getUser(token);
    if (user.error) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const response = await protectionAdmin(user.data.user.id, prisma);
    if (response instanceof Response) {
        return response;
    }
    const { teamMemberProfile } = response;
    if (!teamMemberProfile) {
        return sendErrorResponse("Unauthorized", 401);
    }
    const isAllowed = await rateLimit(`rate-limit:${teamMemberProfile.alliance_member_id}:dashboard-get`, 100, 60);
    if (!isAllowed) {
        return sendErrorResponse("Too Many Requests", 429);
    }
    await next();
};
