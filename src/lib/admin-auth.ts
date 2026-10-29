import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdminRole } from "@prisma/client";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "cbt-cat-bimbel-loloskampus-secret-key-32chars-min-jwt-salt-2026"
);

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  name: string;
}

export async function createAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return null;

  const decoded = await verifyAdminToken(token);
  if (!decoded) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: decoded.adminId },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    avatarUrl: admin.avatarUrl,
  };
}

export async function recordAuditLog(
  first:
    | {
        adminId: string;
        action: string;
        targetEntity: string;
        targetId: string;
        detailsJson?: string;
        ipAddress?: string;
      }
    | string,
  action?: string,
  targetEntity?: string,
  targetId?: string,
  details?: any,
  ipAddress?: string
) {
  let adminId: string;
  let act: string;
  let entity: string;
  let id: string;
  let detailsStr: string | null = null;
  let ip = "127.0.0.1";

  if (typeof first === "object") {
    adminId = first.adminId;
    act = first.action;
    entity = first.targetEntity;
    id = first.targetId;
    detailsStr = first.detailsJson || null;
    ip = first.ipAddress || "127.0.0.1";
  } else {
    adminId = first;
    act = action || "UNKNOWN";
    entity = targetEntity || "GLOBAL";
    id = targetId || "";
    detailsStr = details ? (typeof details === "string" ? details : JSON.stringify(details)) : null;
    ip = ipAddress || "127.0.0.1";
  }

  try {
    return await prisma.auditLog.create({
      data: {
        adminId,
        action: act,
        targetEntity: entity,
        targetId: id,
        detailsJson: detailsStr,
        ipAddress: ip,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

