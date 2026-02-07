import { db } from "@/shared/lib/db";

export const logAudit = async (userId: string, action: string, details?: any, ip?: string) => {
    try {
        await db.auditLog.create({
            data: {
                userId,
                action,
                details: details ? JSON.stringify(details) : null,
                ipAddress: ip || null
            }
        });
    } catch (error) {
        console.error("Audit Logging Error:", error);
    }
};
