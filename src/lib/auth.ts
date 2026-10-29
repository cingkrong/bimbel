import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "cbt-cat-bimbel-loloskampus-secret-key-32chars-min-jwt-salt-2026"
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  deviceId: string;
  sessionId: string;
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;

  if (!token) return null;

  const decoded = await verifySessionToken(token);
  if (!decoded) return null;

  // Verify that the session is still active and has not been kicked out by another device
  const session = await prisma.authSession.findUnique({
    where: { id: decoded.sessionId },
    include: {
      user: {
        include: {
          profile: true,
          preferences: true,
        },
      },
    },
  });

  if (!session || !session.isActive) {
    return null;
  }

  // Update lastActiveAt periodically
  await prisma.authSession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return {
    ...session.user,
    currentSessionId: session.id,
    currentDeviceId: session.deviceId,
  };
}

