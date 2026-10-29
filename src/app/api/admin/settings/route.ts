import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const DEFAULT_SETTINGS_MAP: Record<string, { value: string; category: string; isSecret?: boolean }> = {
  // Maintenance & General
  maintenance_mode: { value: "false", category: "maintenance" },
  maintenance_message: { value: "Sistem CAT BKN sedang dalam optimalisasi server berkala. Mohon tunggu beberapa saat.", category: "maintenance" },
  maintenance_start: { value: "", category: "maintenance" },
  maintenance_end: { value: "", category: "maintenance" },
  app_name: { value: "LolosKampus EdTech Portal", category: "general" },
  whatsapp_hotline: { value: "081234567890", category: "general" },
  support_email: { value: "support@loloskampus.com", category: "general" },

  // WhatsApp Official (Meta Cloud API)
  wa_official_active: { value: "true", category: "notification" },
  meta_wa_phone_number_id: { value: "10982348123984", category: "notification" },
  meta_wa_waba_id: { value: "90123849102394", category: "notification" },
  meta_wa_access_token: { value: "EAAJbZCVxZBv5YBO123456789abcdefghij", category: "notification", isSecret: true },
  meta_template_invoice: { value: "pembayaran_berhasil", category: "notification" },
  meta_template_reminder: { value: "pengingat_tryout", category: "notification" },
  meta_template_login: { value: "persetujuan_login", category: "notification" },

  // WhatsApp Unofficial (BION / Fonnte / Baileys)
  wa_unofficial_active: { value: "true", category: "notification" },
  wa_unofficial_provider: { value: "BION_GATEWAY", category: "notification" },
  wa_unofficial_endpoint: { value: "http://localhost:3105/api/send", category: "notification" },
  wa_unofficial_token: { value: "bion_wa_sec_99887766554433", category: "notification", isSecret: true },
  wa_unofficial_sender: { value: "081234567890", category: "notification" },
  wa_unofficial_status: { value: "CONNECTED", category: "notification" },

  // Email (Resend & SMTP)
  email_provider: { value: "RESEND", category: "notification" },
  resend_api_key: { value: "re_AbCdEf1234567890GhIjKlMn", category: "notification", isSecret: true },
  smtp_host: { value: "smtp.gmail.com", category: "notification" },
  smtp_port: { value: "587", category: "notification" },
  smtp_user: { value: "notifikasi@loloskampus.com", category: "notification" },
  smtp_pass: { value: "••••••••••••••••", category: "notification", isSecret: true },
  email_from: { value: "LolosKampus Official <noreply@loloskampus.com>", category: "notification" },

  // Payment Gateway
  active_payment_gateway: { value: "BIONPAY_QRIS_ONLY", category: "payment" },
  checkout_mode: { value: "GATEWAY", category: "payment" },

  // BionPay (Docs: https://orbit.bion.id/docs)
  bionpay_base_url: { value: "https://orbit.bion.id", category: "payment" },
  bionpay_api_key: { value: "bp_live_89a7f34bc012de5678", category: "payment", isSecret: true },
  bionpay_webhook_secret: { value: "whsec_34f5a6b7c8d9e01234", category: "payment", isSecret: true },
  bionpay_provider: { value: "AUTO", category: "payment" },
  bionpay_expiry_minutes: { value: "15", category: "payment" },

  // QRIS Standard & Merchant Identity
  qris_merchant_name: { value: "LOLOSKAMPUS BIMBEL CAT", category: "payment" },
  qris_nmid: { value: "ID1024319802914", category: "payment" },
  qris_merchant_city: { value: "JAKARTA", category: "payment" },
  qris_static_string: { value: "", category: "payment" },
  qris_static_image_url: { value: "", category: "payment" },

  // Duitku
  duitku_active: { value: "true", category: "payment" },
  duitku_merchant_code: { value: "D98765", category: "payment" },
  duitku_api_key: { value: "dkt_live_sec_1122334455", category: "payment", isSecret: true },
  duitku_env: { value: "sandbox", category: "payment" },
  duitku_callback_url: { value: "https://app.loloskampus.com/api/payment/duitku/callback", category: "payment" },
  duitku_return_url: { value: "https://app.loloskampus.com/payment/finish", category: "payment" },

  // Midtrans
  midtrans_active: { value: "true", category: "payment" },
  midtrans_server_key: { value: "SB-Mid-server-9988776655", category: "payment", isSecret: true },
  midtrans_client_key: { value: "SB-Mid-client-1122334455", category: "payment" },
  midtrans_merchant_id: { value: "M0987654321", category: "payment" },
  midtrans_is_production: { value: "false", category: "payment" },
  midtrans_webhook_url: { value: "https://app.loloskampus.com/api/payment/midtrans/webhook", category: "payment" },

  // Security & Devices
  max_active_devices: { value: "1", category: "security" },
  session_expiry_days: { value: "14", category: "security" },
  enable_device_approval: { value: "true", category: "security" },
  enforce_captcha: { value: "true", category: "security" },

  // Storage
  storage_provider: { value: "CLOUDFLARE_R2", category: "storage" },
  s3_endpoint: { value: "https://0987abcdef654321.r2.cloudflarestorage.com", category: "storage" },
  s3_bucket: { value: "loloskampus-exam-assets", category: "storage" },
  s3_access_key: { value: "r2_access_key_987654321", category: "storage", isSecret: true },
  s3_secret_key: { value: "r2_secret_key_abcdef123456", category: "storage", isSecret: true },
  s3_public_domain: { value: "https://assets.loloskampus.com", category: "storage" },

  // Whitelabel
  cname_target: { value: "cname.loloskampus.com", category: "whitelabel" },
};

const MOCK_TENANTS = [
  {
    id: "ten-01",
    slug: "mitrastan",
    customDomain: "tryout.mitrastan.com",
    domainVerified: true,
    status: "ACTIVE",
    brandName: "Bimbel Spesialis STAN Mandiri",
    tagline: "Kunci Lolos SPMB PKN STAN & Kedinasan No. 1",
    logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
    primaryColor: "#0F172A",
    secondaryColor: "#E11D48",
    supportEmail: "info@mitrastan.com",
    supportWhatsapp: "081299887766",
    maxStudents: 500,
    activeStudents: 342,
    validUntil: "2026-12-31T23:59:59Z",
    customWaActive: true,
    customPayActive: false,
  },
  {
    id: "ten-02",
    slug: "akademiipdn",
    customDomain: "cat.akademiipdn.id",
    domainVerified: false,
    status: "TRIAL",
    brandName: "Akademi Praja Nusantara",
    tagline: "Pusat Latihan CAT SKD & Fisik IPDN",
    logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200",
    primaryColor: "#1E3A8A",
    secondaryColor: "#D97706",
    supportEmail: "halo@akademiipdn.id",
    supportWhatsapp: "082155443322",
    maxStudents: 200,
    activeStudents: 88,
    validUntil: "2026-11-15T23:59:59Z",
    customWaActive: false,
    customPayActive: false,
  },
];

const MOCK_NOTIFICATION_LOGS = [
  {
    id: "notif-01",
    channel: "WHATSAPP",
    provider: "BION_GATEWAY",
    recipient: "081234567890",
    templateKey: "INVOICE_PAID",
    payloadJson: JSON.stringify({ invoice: "INV-20261028-001", amount: 99000, student: "Aditya Pratama" }),
    status: "DELIVERED",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "notif-02",
    channel: "WHATSAPP",
    provider: "META_CLOUD",
    recipient: "081398765432",
    templateKey: "EXAM_REMINDER",
    payloadJson: JSON.stringify({ tryout: "Tryout Akbar SKD #1", startTime: "19:30 WIB" }),
    status: "SENT",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "notif-03",
    channel: "EMAIL",
    provider: "RESEND",
    recipient: "siti.nurhaliza@gmail.com",
    templateKey: "INVOICE_PAID",
    payloadJson: JSON.stringify({ invoice: "INV-20261028-002", total: 249000 }),
    status: "DELIVERED",
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
  {
    id: "notif-04",
    channel: "WHATSAPP",
    provider: "BION_GATEWAY",
    recipient: "082155443322",
    templateKey: "LOGIN_APPROVAL",
    payloadJson: JSON.stringify({ device: "Safari Mobile / iOS", ip: "114.125.77.89" }),
    status: "SENT",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const MOCK_BANNERS = [
  {
    id: "ban-01",
    title: "Tryout Akbar Nasional SKD #1 Resmi Dibuka!",
    subtitle: "Raih skor 450+ dan amankan tiket PKN STAN 2026.",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    linkUrl: "/tryout",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "ban-02",
    title: "Diskon Early Bird 20% Bimbel Intensif Live Zoom",
    subtitle: "Gunakan kode promo LOLOSSTAN2026 saat checkout.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    linkUrl: "/bimbel",
    sortOrder: 2,
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settingsMap: Record<string, string> = {};
    Object.keys(DEFAULT_SETTINGS_MAP).forEach((k) => {
      settingsMap[k] = DEFAULT_SETTINGS_MAP[k].value;
    });

    let banners: any[] = MOCK_BANNERS;
    let tenants: any[] = MOCK_TENANTS;
    let notificationLogs: any[] = MOCK_NOTIFICATION_LOGS;

    try {
      const [dbSettings, dbBanners, dbTenants, dbLogs] = await Promise.all([
        prisma.appSetting.findMany(),
        prisma.spotlightBanner.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.tenant.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.notificationLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
      ]);

      dbSettings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });

      if (dbBanners.length > 0) banners = dbBanners;
      if (dbTenants.length > 0) tenants = dbTenants as any;
      if (dbLogs.length > 0) notificationLogs = dbLogs as any;
    } catch (err) {
      console.warn("DB fetch error in settings, using defaults:", err);
    }

    return NextResponse.json({
      settings: settingsMap,
      banners,
      tenants,
      notificationLogs,
    });
  } catch (error: any) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settings, bannerToggle, tenantUpdate } = body;

    // 1. Toggle Banner
    if (bannerToggle) {
      const { bannerId, isActive } = bannerToggle;
      await prisma.spotlightBanner.update({
        where: { id: bannerId },
        data: { isActive },
      });
      await recordAuditLog(admin.id, "TOGGLE_BANNER", "SpotlightBanner", bannerId, { isActive });
      return NextResponse.json({ success: true });
    }

    // 2. Update Tenant
    if (tenantUpdate) {
      const { id, ...data } = tenantUpdate;
      const updated = await prisma.tenant.update({
        where: { id },
        data,
      });
      await recordAuditLog(admin.id, "UPDATE_TENANT", "Tenant", id, data);
      return NextResponse.json({ success: true, tenant: updated });
    }

    // 3. Batch Update Settings
    if (settings) {
      for (const [key, val] of Object.entries(settings)) {
        const meta = DEFAULT_SETTINGS_MAP[key] || { category: "general", isSecret: false };
        await prisma.appSetting.upsert({
          where: { key },
          update: {
            value: String(val),
            category: meta.category,
            isSecret: meta.isSecret ?? false,
            updatedBy: admin.name,
          },
          create: {
            key,
            value: String(val),
            category: meta.category,
            isSecret: meta.isSecret ?? false,
            updatedBy: admin.name,
          },
        });
      }

      await recordAuditLog(admin.id, "UPDATE_SYSTEM_SETTINGS", "AppSetting", "GLOBAL", {
        keysUpdated: Object.keys(settings),
      });

      return NextResponse.json({ success: true, settings });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error: any) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, payload } = body;

    // Create New Tenant Partner
    if (type === "CREATE_TENANT") {
      const { slug, brandName, customDomain, primaryColor, secondaryColor, maxStudents, validUntil, supportEmail, supportWhatsapp } = payload;
      const created = await prisma.tenant.create({
        data: {
          slug: slug.toLowerCase().trim(),
          brandName,
          customDomain: customDomain ? customDomain.toLowerCase().trim() : null,
          domainVerified: false,
          primaryColor: primaryColor || "#0F172A",
          secondaryColor: secondaryColor || "#E11D48",
          maxStudents: Number(maxStudents) || 100,
          validUntil: validUntil ? new Date(validUntil) : null,
          supportEmail: supportEmail || null,
          supportWhatsapp: supportWhatsapp || null,
        },
      });

      await recordAuditLog(admin.id, "CREATE_TENANT", "Tenant", created.id, { slug, brandName });
      return NextResponse.json({ tenant: created }, { status: 201 });
    }

    // Create Spotlight Banner
    if (type === "CREATE_BANNER") {
      const { title, subtitle, imageUrl, linkUrl, sortOrder } = payload;
      const created = await prisma.spotlightBanner.create({
        data: {
          title,
          subtitle: subtitle || null,
          imageUrl,
          linkUrl: linkUrl || "/tryout",
          sortOrder: Number(sortOrder) || 1,
          isActive: true,
        },
      });

      await recordAuditLog(admin.id, "CREATE_BANNER", "SpotlightBanner", created.id, { title });
      return NextResponse.json({ banner: created }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
