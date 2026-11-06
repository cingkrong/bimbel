import crypto from "crypto";

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  order_id?: string;
  status?: string;
  [key: string]: any;
}

export interface SendCapiParams {
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
  eventName: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase" | "Lead" | "CompleteRegistration" | string;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: MetaUserData;
  customData?: MetaCustomData;
}

/**
 * Normalizes and hashes customer data with SHA-256 according to Meta Conversions API specifications.
 */
export function hashForMeta(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Normalizes and hashes phone numbers with SHA-256 (digits only, e.g. 6281234567890).
 */
export function hashPhoneForMeta(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  // Keep only digits
  let digits = phone.replace(/\D/g, "");
  // If starts with 08, convert to Indonesian international code 628
  if (digits.startsWith("08")) {
    digits = "62" + digits.slice(1);
  }
  return hashForMeta(digits);
}

/**
 * Sends a server-side event to Meta Conversions API (Graph API v19.0).
 */
export async function sendMetaCapiEvent(params: SendCapiParams): Promise<{
  success: boolean;
  eventsReceived?: number;
  fbtraceId?: string;
  error?: string;
}> {
  const pixelId = params.pixelId || process.env.META_PIXEL_ID;
  const accessToken = params.accessToken || process.env.META_CAPI_TOKEN;

  if (!pixelId || !accessToken) {
    return {
      success: false,
      error: "Meta Pixel ID atau Conversions API Access Token belum dikonfigurasi.",
    };
  }

  // Format user_data with SHA-256
  const formattedUserData: Record<string, any> = {};

  if (params.userData?.email) {
    formattedUserData.em = [hashForMeta(params.userData.email)];
  }
  if (params.userData?.phone) {
    formattedUserData.ph = [hashPhoneForMeta(params.userData.phone)];
  }
  if (params.userData?.firstName) {
    formattedUserData.fn = [hashForMeta(params.userData.firstName)];
  }
  if (params.userData?.lastName) {
    formattedUserData.ln = [hashForMeta(params.userData.lastName)];
  }
  if (params.userData?.city) {
    formattedUserData.ct = [hashForMeta(params.userData.city)];
  }
  if (params.userData?.clientIp) {
    formattedUserData.client_ip_address = params.userData.clientIp;
  }
  if (params.userData?.clientUserAgent) {
    formattedUserData.client_user_agent = params.userData.clientUserAgent;
  }
  if (params.userData?.fbp) {
    formattedUserData.fbp = params.userData.fbp;
  }
  if (params.userData?.fbc) {
    formattedUserData.fbc = params.userData.fbc;
  }

  const eventPayload: Record<string, any> = {
    event_name: params.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: formattedUserData,
  };

  if (params.eventId) {
    eventPayload.event_id = params.eventId;
  }
  if (params.eventSourceUrl) {
    eventPayload.event_source_url = params.eventSourceUrl;
  }
  if (params.customData) {
    eventPayload.custom_data = params.customData;
  }

  const requestBody: Record<string, any> = {
    data: [eventPayload],
  };

  if (params.testEventCode) {
    requestBody.test_event_code = params.testEventCode;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || "Gagal mengirim event ke Meta Conversions API.",
        fbtraceId: data.error?.fbtrace_id,
      };
    }

    return {
      success: true,
      eventsReceived: data.events_received,
      fbtraceId: data.fbtrace_id,
    };
  } catch (err: any) {
    console.error("Meta CAPI Error:", err);
    return {
      success: false,
      error: err.message || "Network error saat menghubungi Meta Graph API.",
    };
  }
}
