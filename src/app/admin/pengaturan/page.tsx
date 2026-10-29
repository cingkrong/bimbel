"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  Bell,
  CreditCard,
  Building2,
  ShieldAlert,
  HardDrive,
  Power,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ExternalLink,
  Save,
  Globe,
  Plus,
  Send,
  RefreshCw,
  QrCode,
  Key,
  Smartphone,
  Lock,
  Mail,
  Zap,
  HelpCircle,
  Copy,
  Sliders,
  Check,
  Eye,
  EyeOff
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Tenant {
  id: string;
  slug: string;
  customDomain: string | null;
  domainVerified: boolean;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "EXPIRED";
  brandName: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string | null;
  supportWhatsapp: string | null;
  maxStudents: number;
  activeStudents: number;
  validUntil: string | null;
  customWaActive: boolean;
  customPayActive: boolean;
}

interface NotificationLog {
  id: string;
  channel: "WHATSAPP" | "EMAIL" | "PUSH";
  provider: string;
  recipient: string;
  templateKey: string;
  payloadJson: string | null;
  status: "DELIVERED" | "SENT" | "FAILED" | "QUEUED";
  createdAt: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "notification";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);

  // Password / Secret visibility toggles
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Live Test States
  const [testingWa, setTestingWa] = useState(false);
  const [testWaRecipient, setTestWaRecipient] = useState("081234567890");
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [testingStorage, setTestingStorage] = useState(false);
  const [verifyingCname, setVerifyingCname] = useState<string | null>(null);

  // Modals
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);

  // Tenant Form
  const [tenantSlug, setTenantSlug] = useState("");
  const [tenantBrand, setTenantBrand] = useState("");
  const [tenantDomain, setTenantDomain] = useState("");
  const [tenantPrimary, setTenantPrimary] = useState("#0F172A");
  const [tenantSecondary, setTenantSecondary] = useState("#E11D48");
  const [tenantMaxStudents, setTenantMaxStudents] = useState(200);

  // Banner Form
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLink, setBannerLink] = useState("/tryout");
  const [bannerSort, setBannerSort] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const json = await res.json();
        setSettings(json.settings || {});
        setBanners(json.banners || []);
        setTenants(json.tenants || []);
        setNotificationLogs(json.notificationLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (overrideSettings?: Record<string, string> | unknown) => {
    if (
      overrideSettings &&
      typeof overrideSettings === "object" &&
      "preventDefault" in overrideSettings &&
      typeof (overrideSettings as any).preventDefault === "function"
    ) {
      (overrideSettings as any).preventDefault();
    }
    setSaving(true);
    const toSave =
      overrideSettings &&
      typeof overrideSettings === "object" &&
      !("preventDefault" in overrideSettings)
        ? (overrideSettings as Record<string, string>)
        : settings;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: toSave }),
      });
      if (res.ok) {
        showToast("Seluruh pengaturan berhasil disimpan ke database!");
      }
    } catch (err) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDeviceApproval = async (newVal: boolean) => {
    const strVal = newVal ? "true" : "false";
    const updated = { ...settings, enable_device_approval: strVal };
    setSettings(updated);
    await handleSaveSettings(updated);
  };

  // Test WhatsApp
  const handleTestWhatsApp = async () => {
    setTestingWa(true);
    try {
      const res = await fetch("/api/admin/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_WHATSAPP",
          payload: {
            recipient: testWaRecipient,
            provider: settings.wa_unofficial_provider || "BION_GATEWAY",
            message: "Uji coba integrasi WhatsApp Gateway LolosKampus CAT BKN. Sistem siap digunakan!",
          },
        }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message);
        if (json.log) setNotificationLogs((prev) => [json.log, ...prev]);
      }
    } catch (err) {
      alert("Gagal menguji kirim WhatsApp");
    } finally {
      setTestingWa(false);
    }
  };

  // Test Gateway
  const handleTestGateway = async (gatewayName: "BIONPAY" | "DUITKU" | "MIDTRANS") => {
    setTestingGateway(gatewayName);
    try {
      const res = await fetch("/api/admin/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_GATEWAY",
          payload: {
            gateway: gatewayName,
            baseUrl: settings.bionpay_base_url,
            merchantCode: settings.duitku_merchant_code,
            merchantId: settings.midtrans_merchant_id,
          },
        }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message);
      }
    } catch (err) {
      alert("Gagal menguji gateway pembayaran");
    } finally {
      setTestingGateway(null);
    }
  };

  // Test Storage
  const handleTestStorage = async () => {
    setTestingStorage(true);
    try {
      const res = await fetch("/api/admin/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_STORAGE",
          payload: {
            endpoint: settings.s3_endpoint,
            bucket: settings.s3_bucket,
          },
        }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message);
      }
    } catch (err) {
      alert("Gagal menguji storage");
    } finally {
      setTestingStorage(false);
    }
  };

  // Check CNAME
  const handleCheckCname = async (tenant: Tenant) => {
    if (!tenant.customDomain) return;
    setVerifyingCname(tenant.id);
    try {
      const res = await fetch("/api/admin/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHECK_CNAME",
          payload: { tenantId: tenant.id, domain: tenant.customDomain },
        }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message);
        setTenants((prev) =>
          prev.map((t) => (t.id === tenant.id ? { ...t, domainVerified: true } : t))
        );
      }
    } catch (err) {
      alert("Gagal verifikasi CNAME");
    } finally {
      setVerifyingCname(null);
    }
  };

  // Toggle Banner
  const handleToggleBanner = async (bannerId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerToggle: { bannerId, isActive: !currentActive },
        }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === bannerId ? { ...b, isActive: !currentActive } : b))
        );
      }
    } catch (err) {
      alert("Gagal mengubah banner");
    }
  };

  // Create Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug.trim() || !tenantBrand.trim()) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CREATE_TENANT",
          payload: {
            slug: tenantSlug,
            brandName: tenantBrand,
            customDomain: tenantDomain || null,
            primaryColor: tenantPrimary,
            secondaryColor: tenantSecondary,
            maxStudents: tenantMaxStudents,
          },
        }),
      });
      if (res.ok) {
        setIsAddTenantOpen(false);
        setTenantSlug("");
        setTenantBrand("");
        setTenantDomain("");
        fetchAllSettings();
        showToast("Mitra Whitelabel baru berhasil didaftarkan!");
      }
    } catch (err) {
      alert("Gagal menambah mitra");
    }
  };

  // Create Banner
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImage.trim()) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CREATE_BANNER",
          payload: {
            title: bannerTitle,
            subtitle: bannerSubtitle,
            imageUrl: bannerImage,
            linkUrl: bannerLink,
            sortOrder: bannerSort,
          },
        }),
      });
      if (res.ok) {
        setIsAddBannerOpen(false);
        setBannerTitle("");
        setBannerImage("");
        fetchAllSettings();
        showToast("Banner spotlight berhasil diunggah!");
      }
    } catch (err) {
      alert("Gagal menambah banner");
    }
  };

  const subTabs = [
    { id: "notification", label: "Layanan Notifikasi", icon: Bell },
    { id: "payment", label: "Gateway Pembayaran", icon: CreditCard },
    { id: "whitelabel", label: "Whitelabel & Custom Domain", icon: Building2 },
    { id: "security", label: "Keamanan & Sesi", icon: ShieldAlert },
    { id: "storage", label: "Storage & Media (R2/S3)", icon: HardDrive },
    { id: "maintenance", label: "Pemeliharaan & Banner", icon: Power },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        <p className="text-xs text-slate-400">Memuat konfigurasi sistem terpadu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Pusat Pengaturan Sistem (Settings & Whitelabel)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi lengkap notifikasi WhatsApp/Email, gateway pembayaran (Duitku, Midtrans, BionPay), multi-tenant mitra, dan keamanan.
          </p>
        </div>

        <button
          onClick={() => handleSaveSettings()}
          disabled={saving}
          className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-rose-600 font-bold text-xs shadow-md"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Seluruh Perubahan
        </button>
      </div>

      {/* 6 Segmented Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10 text-xs overflow-x-auto">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: LAYANAN NOTIFIKASI
      ========================================================================= */}
      {activeTab === "notification" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* WhatsApp Official (Meta Cloud API) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    WhatsApp Official (Meta Cloud API / WABA)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Resmi Meta BSP, bebas blokir nomor, template pesan terverifikasi.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.wa_official_active === "true"}
                    onChange={(e) =>
                      handleSettingChange("wa_official_active", e.target.checked ? "true" : "false")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    value={settings.meta_wa_phone_number_id || ""}
                    onChange={(e) => handleSettingChange("meta_wa_phone_number_id", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono"
                    placeholder="10982348123984"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WABA Account ID *
                  </label>
                  <input
                    type="text"
                    value={settings.meta_wa_waba_id || ""}
                    onChange={(e) => handleSettingChange("meta_wa_waba_id", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono"
                    placeholder="90123849102394"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta System User Permanent Token *
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets.metaToken ? "text" : "password"}
                      value={settings.meta_wa_access_token || ""}
                      onChange={(e) => handleSettingChange("meta_wa_access_token", e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                      placeholder="EAAJ..."
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecrets((prev) => ({ ...prev, metaToken: !prev.metaToken }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets.metaToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400">Template Invoice</span>
                    <input
                      type="text"
                      value={settings.meta_template_invoice || "pembayaran_berhasil"}
                      onChange={(e) => handleSettingChange("meta_template_invoice", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Template Ujian</span>
                    <input
                      type="text"
                      value={settings.meta_template_reminder || "pengingat_tryout"}
                      onChange={(e) => handleSettingChange("meta_template_reminder", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Template Login</span>
                    <input
                      type="text"
                      value={settings.meta_template_login || "persetujuan_login"}
                      onChange={(e) => handleSettingChange("meta_template_login", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Unofficial (BION / Fonnte / Wablas) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    WhatsApp Unofficial Gateway (BION / Fonnte / Baileys)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Biaya flat tanpa batas per pesan, pesan bebas tanpa review template Meta.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.wa_unofficial_active === "true"}
                    onChange={(e) =>
                      handleSettingChange("wa_unofficial_active", e.target.checked ? "true" : "false")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Provider Gateway
                    </label>
                    <select
                      value={settings.wa_unofficial_provider || "BION_GATEWAY"}
                      onChange={(e) => handleSettingChange("wa_unofficial_provider", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold"
                    >
                      <option value="BION_GATEWAY">BION Gateway (Local/VPS)</option>
                      <option value="FONNTE">Fonnte API</option>
                      <option value="WABLAS">Wablas Server</option>
                      <option value="BAILEYS">Custom Baileys Session</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nomor Pengirim (Device)
                    </label>
                    <input
                      type="text"
                      value={settings.wa_unofficial_sender || "081234567890"}
                      onChange={(e) => handleSettingChange("wa_unofficial_sender", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={settings.wa_unofficial_endpoint || "http://localhost:3105/api/send"}
                    onChange={(e) => handleSettingChange("wa_unofficial_endpoint", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Token / Device Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets.waToken ? "text" : "password"}
                      value={settings.wa_unofficial_token || ""}
                      onChange={(e) => handleSettingChange("wa_unofficial_token", e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecrets((prev) => ({ ...prev, waToken: !prev.waToken }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets.waToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Device Status & Live Test */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">Device Connected</span>
                      <p className="text-[10px] text-slate-400">Siap mengirim notifikasi transaksional</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={testWaRecipient}
                      onChange={(e) => setTestWaRecipient(e.target.value)}
                      placeholder="0812..."
                      className="w-28 px-2 py-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleTestWhatsApp}
                      disabled={testingWa}
                      className="btn-interactive inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                    >
                      {testingWa ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Uji Kirim WA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Settings & Recent Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Email Settings */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Layanan Email Transaksional (Resend API & SMTP)
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Provider Email
                  </label>
                  <select
                    value={settings.email_provider || "RESEND"}
                    onChange={(e) => handleSettingChange("email_provider", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold"
                  >
                    <option value="RESEND">Resend API (Deliverability 99%, React Email)</option>
                    <option value="SMTP">Standard SMTP Server (cPanel / Google / SES)</option>
                  </select>
                </div>

                {settings.email_provider === "RESEND" ? (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Resend API Key *
                    </label>
                    <input
                      type="text"
                      value={settings.resend_api_key || ""}
                      onChange={(e) => handleSettingChange("resend_api_key", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                      placeholder="re_..."
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">SMTP Host</span>
                      <input
                        type="text"
                        value={settings.smtp_host || "smtp.gmail.com"}
                        onChange={(e) => handleSettingChange("smtp_host", e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">SMTP Port</span>
                      <input
                        type="text"
                        value={settings.smtp_port || "587"}
                        onChange={(e) => handleSettingChange("smtp_port", e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sender Name & Email (From Header)
                  </label>
                  <input
                    type="text"
                    value={settings.email_from || "LolosKampus Official <noreply@loloskampus.com>"}
                    onChange={(e) => handleSettingChange("email_from", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Notification Logs Table */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-500" />
                  Log Notifikasi Terakhir (Audit Trail)
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Kanal</th>
                      <th className="py-2 px-3">Penerima</th>
                      <th className="py-2 px-3">Template</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-[11px]">
                    {notificationLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {log.channel}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {log.recipient}
                        </td>
                        <td className="py-2 px-3 text-slate-500">
                          {log.templateKey}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GATEWAY PEMBAYARAN (DUITKU, MIDTRANS, BIONPAY)
      ========================================================================= */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          {/* Active Mode Switcher */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Mode Prioritas Gateway Pembayaran
            </h3>
            <p className="text-xs text-slate-400">
              Pilih arsitektur pembayaran yang akan disajikan kepada siswa saat proses checkout paket.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {[
                {
                  id: "BIONPAY_QRIS_ONLY",
                  title: "BionPay Dynamic QRIS (Rekomendasi)",
                  desc: "Fee terendah, settlement instan, dual-merchant GoPay & ShopeePay.",
                  badge: "Hemat Biaya",
                },
                {
                  id: "MULTI_GATEWAY",
                  title: "Multi-Gateway (Hybrid)",
                  desc: "Virtual Account via Duitku / Midtrans + QRIS Dinamis via BionPay.",
                  badge: "Metode Terlengkap",
                },
                {
                  id: "MANUAL_WHATSAPP",
                  title: "Alihkan ke WhatsApp CS",
                  desc: "Siswa diarahkan langsung ke WhatsApp admin untuk transfer manual.",
                  badge: "Fallback Darurat",
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                    settings.active_payment_gateway === m.id
                      ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="radio"
                      name="active_gateway"
                      checked={settings.active_payment_gateway === m.id}
                      onChange={() => handleSettingChange("active_payment_gateway", m.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {m.badge}
                    </span>
                  </div>
                  <strong className="block text-xs text-slate-900 dark:text-white">{m.title}</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* 3 Gateway Forms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. BionPay Dynamic QRIS */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-950/[0.1] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    BionPay Dual-Merchant QRIS
                  </h3>
                  <a
                    href="https://orbit.bion.id/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 mt-0.5 font-bold"
                  >
                    Dokumentasi API Swagger <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BionPay Base URL
                  </label>
                  <input
                    type="text"
                    value={settings.bionpay_base_url || "https://orbit.bion.id"}
                    onChange={(e) => handleSettingChange("bionpay_base_url", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Key (`bp_live_...`) *
                  </label>
                  <input
                    type="password"
                    value={settings.bionpay_api_key || ""}
                    onChange={(e) => handleSettingChange("bionpay_api_key", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                    placeholder="bp_live_..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Webhook Secret (`whsec_...`) *
                  </label>
                  <input
                    type="password"
                    value={settings.bionpay_webhook_secret || ""}
                    onChange={(e) => handleSettingChange("bionpay_webhook_secret", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                    placeholder="whsec_..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Provider</span>
                    <select
                      value={settings.bionpay_provider || "AUTO"}
                      onChange={(e) => handleSettingChange("bionpay_provider", e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-bold"
                    >
                      <option value="AUTO">AUTO (Load Balanced)</option>
                      <option value="GOPAY">GoPay / GoBiz</option>
                      <option value="SHOPEEPAY">ShopeePay Partner</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Kedaluwarsa (Menit)</span>
                    <input
                      type="number"
                      value={settings.bionpay_expiry_minutes || "15"}
                      onChange={(e) => handleSettingChange("bionpay_expiry_minutes", e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-bold text-center"
                    />
                  </div>
                </div>

                {/* QRIS Merchant Configuration */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 space-y-2">
                  <span className="block font-bold text-[11px] text-slate-800 dark:text-white uppercase tracking-wider">
                    Identitas Voucher QRIS Resmi
                  </span>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                      Nama Merchant QRIS
                    </label>
                    <input
                      type="text"
                      value={settings.qris_merchant_name || "LOLOSKAMPUS BIMBEL CAT"}
                      onChange={(e) => handleSettingChange("qris_merchant_name", e.target.value)}
                      placeholder="LOLOSKAMPUS BIMBEL CAT"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        National Merchant ID (NMID)
                      </label>
                      <input
                        type="text"
                        value={settings.qris_nmid || "ID1024319802914"}
                        onChange={(e) => handleSettingChange("qris_nmid", e.target.value)}
                        placeholder="ID1024319802914"
                        className="w-full px-2 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Kota Merchant
                      </label>
                      <input
                        type="text"
                        value={settings.qris_merchant_city || "JAKARTA"}
                        onChange={(e) => handleSettingChange("qris_merchant_city", e.target.value)}
                        placeholder="JAKARTA"
                        className="w-full px-2 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-bold text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                      Base QRIS String (Opsional - Konversi Statis ke Dinamis)
                    </label>
                    <input
                      type="text"
                      value={settings.qris_static_string || ""}
                      onChange={(e) => handleSettingChange("qris_static_string", e.target.value)}
                      placeholder="00020101021126... (Jika punya string statis BCA/GoPay)"
                      className="w-full px-2 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[10px]"
                    />
                  </div>

                  {/* Upload QRIS Image */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Upload Barcode QRIS Asli Toko/Bimbel (Opsional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id="qris-image-file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              handleSettingChange("qris_static_image_url", base64);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="qris-image-file"
                        className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white text-[11px] font-semibold cursor-pointer border border-slate-300 dark:border-white/10"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        Pilih Gambar QRIS Asli...
                      </label>

                      {settings.qris_static_image_url && (
                        <button
                          type="button"
                          onClick={() => handleSettingChange("qris_static_image_url", "")}
                          className="px-2 py-1 text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
                        >
                          Hapus Gambar
                        </button>
                      )}
                    </div>

                    {settings.qris_static_image_url && (
                      <div className="mt-2 p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark flex items-center gap-3">
                        <img
                          src={settings.qris_static_image_url}
                          alt="QRIS Preview"
                          className="w-12 h-12 object-contain rounded-lg border border-slate-200"
                        />
                        <div className="text-[10px] text-slate-500">
                          <strong className="text-emerald-600 block">✓ Gambar QRIS Asli Terpasang</strong>
                          Barcode ini akan langsung ditampilkan kepada siswa saat checkout.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTestGateway("BIONPAY")}
                  disabled={testingGateway === "BIONPAY"}
                  className="w-full btn-interactive py-2 rounded-xl bg-emerald-600 text-white font-bold inline-flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {testingGateway === "BIONPAY" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Uji Koneksi BionPay
                </button>
              </div>
            </div>

            {/* 2. Duitku Pop-up & Redirect */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Duitku Virtual Account & QRIS
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Merchant Code *
                  </label>
                  <input
                    type="text"
                    value={settings.duitku_merchant_code || "D98765"}
                    onChange={(e) => handleSettingChange("duitku_merchant_code", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Key *
                  </label>
                  <input
                    type="password"
                    value={settings.duitku_api_key || ""}
                    onChange={(e) => handleSettingChange("duitku_api_key", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Environment
                  </label>
                  <select
                    value={settings.duitku_env || "sandbox"}
                    onChange={(e) => handleSettingChange("duitku_env", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Callback Webhook URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={settings.duitku_callback_url || "https://app.loloskampus.com/api/payment/duitku/callback"}
                    className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[10px] text-slate-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTestGateway("DUITKU")}
                  disabled={testingGateway === "DUITKU"}
                  className="w-full btn-interactive py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold inline-flex items-center justify-center gap-1.5"
                >
                  {testingGateway === "DUITKU" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Uji Koneksi Duitku
                </button>
              </div>
            </div>

            {/* 3. Midtrans Snap API */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Midtrans Snap API
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Server Key *
                  </label>
                  <input
                    type="password"
                    value={settings.midtrans_server_key || ""}
                    onChange={(e) => handleSettingChange("midtrans_server_key", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                    placeholder="SB-Mid-server-..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Key *
                  </label>
                  <input
                    type="text"
                    value={settings.midtrans_client_key || ""}
                    onChange={(e) => handleSettingChange("midtrans_client_key", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                    placeholder="SB-Mid-client-..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Merchant ID</span>
                    <input
                      type="text"
                      value={settings.midtrans_merchant_id || "M0987654321"}
                      onChange={(e) => handleSettingChange("midtrans_merchant_id", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Environment</span>
                    <select
                      value={settings.midtrans_is_production === "true" ? "true" : "false"}
                      onChange={(e) => handleSettingChange("midtrans_is_production", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-bold"
                    >
                      <option value="false">Sandbox</option>
                      <option value="true">Production</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notification Webhook URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={settings.midtrans_webhook_url || "https://app.loloskampus.com/api/payment/midtrans/webhook"}
                    className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-mono text-[10px] text-slate-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTestGateway("MIDTRANS")}
                  disabled={testingGateway === "MIDTRANS"}
                  className="w-full btn-interactive py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold inline-flex items-center justify-center gap-1.5"
                >
                  {testingGateway === "MIDTRANS" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Uji Koneksi Midtrans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: WHITELABEL & CUSTOM DOMAIN MITRA (MULTI-TENANT)
      ========================================================================= */}
      {activeTab === "whitelabel" && (
        <div className="space-y-6">
          {/* Header & Add Partner Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Manajemen Kemitraan & Multi-Tenant Whitelabel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola portal bimbel pihak ketiga dengan branding, subdomain, dan custom domain mereka sendiri.
              </p>
            </div>

            <button
              onClick={() => setIsAddTenantOpen(true)}
              className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Mitra Baru
            </button>
          </div>

          {/* DNS CNAME Configuration Guide */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
              <Globe className="w-4 h-4" />
              Panduan Konfigurasi DNS Klien (Cloudflare for SaaS / CNAME):
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Minta mitra menambahkan record DNS di penyedia domain mereka:
              <code className="mx-1 px-2 py-0.5 rounded bg-white dark:bg-surface-dark border font-mono font-bold text-indigo-600">
                CNAME | tryout | cname.loloskampus.com
              </code>
              Sertifikat SSL otomatis diterbitkan dalam 60 detik begitu CNAME terdeteksi aktif.
            </p>
          </div>

          {/* Tenants List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tenants.map((ten) => (
              <div
                key={ten.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border shadow-sm"
                        style={{ backgroundColor: ten.primaryColor }}
                        title="Warna Utama"
                      />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {ten.brandName}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ten.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {ten.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 italic">"{ten.tagline || "Portal Bimbel Kedinasan"}"</p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Subdomain Sistem:</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {ten.slug}.loloskampus.com
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Custom Domain:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {ten.customDomain || "Belum diatur"}
                        </span>
                        {ten.customDomain && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              ten.domainVerified
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {ten.domainVerified ? "SSL Active" : "Pending DNS"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/50 dark:border-white/5">
                      <span className="text-slate-400">Kuota Siswa Aktif:</span>
                      <span className="font-bold">
                        {ten.activeStudents} / {ten.maxStudents} Siswa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[11px] text-slate-400">
                    WA CS: <strong className="text-slate-600 dark:text-slate-300">{ten.supportWhatsapp || "-"}</strong>
                  </span>

                  {ten.customDomain && (
                    <button
                      type="button"
                      onClick={() => handleCheckCname(ten)}
                      disabled={verifyingCname === ten.id}
                      className="btn-interactive px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1"
                    >
                      {verifyingCname === ten.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Globe className="w-3 h-3 text-indigo-600" />
                      )}
                      Cek Status DNS
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: KEAMANAN & SESI PERANGKAT
      ========================================================================= */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Anti-Account Sharing & Kebijakan Sesi Perangkat
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cegah siswa saling pinjam akun tryout dan amankan otorisasi perangkat baru.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Maksimal Perangkat Aktif Bersamaan
                </label>
                <p className="text-[11px] text-slate-400">
                  Standar anti-sharing: 1 perangkat aktif per akun siswa. Login baru otomatis mencabut login lama.
                </p>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={settings.max_active_devices || "1"}
                  onChange={(e) => handleSettingChange("max_active_devices", e.target.value)}
                  className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-bold text-center"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Masa Berlaku Sesi Login (Hari)
                </label>
                <p className="text-[11px] text-slate-400">
                  Token sesi browser siswa akan kedaluwarsa otomatis setelah jangka waktu ini.
                </p>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.session_expiry_days || "14"}
                  onChange={(e) => handleSettingChange("session_expiry_days", e.target.value)}
                  className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-bold text-center"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2 text-xs">
              {/* TOGGLE PERSETUJUAN LOGIN PERANGKAT BARU */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Smartphone className="w-4 h-4 text-rose-500" />
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        Persetujuan Login Perangkat Baru (Device Login Approval)
                      </strong>
                      {settings.enable_device_approval === "true" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          AKTIF (Wajib Disetujui Perangkat Utama)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          NONAKTIF (Otomatis Override Sesi Lama)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                      {settings.enable_device_approval === "true"
                        ? "Saat ini aktif: Jika akun siswa login di perangkat baru, sesi akan ditahan dan meminta persetujuan pop-up real-time di perangkat utama. Mencegah akun dipakai bergantian atau dioperkan (anti-joki)."
                        : "Saat ini nonaktif: Siswa dapat langsung masuk di perangkat baru tanpa menunggu persetujuan. Sesi login di perangkat lama akan otomatis di-logout seketika demi menjaga batas maksimal perangkat aktif."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`text-[11px] font-bold ${settings.enable_device_approval === "true" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {settings.enable_device_approval === "true" ? "ON" : "OFF"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enable_device_approval === "true"}
                        onChange={(e) => handleToggleDeviceApproval(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    Tersinkronisasi otomatis dengan otentikasi login Next.js & sesi database PostgreSQL
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={saving}
                    className="self-end sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-[11px] transition-colors"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Simpan Manual
                  </button>
                </div>
              </div>

              {/* CLOUDFLARE TURNSTILE CAPTCHA */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-between gap-4">
                <div>
                  <strong className="block text-slate-900 dark:text-white">
                    Proteksi Bot Captcha (Cloudflare Turnstile)
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Cegah pendaftaran spam akun dan brute force password pada formulir autentikasi.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.enforce_captcha === "true"}
                    onChange={(e) =>
                      handleSettingChange("enforce_captcha", e.target.checked ? "true" : "false")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: STORAGE & MEDIA (CLOUDFLARE R2 / S3)
      ========================================================================= */}
      {activeTab === "storage" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-600" />
                  Media Storage (Cloudflare R2 / AWS S3 Compatible)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Penyimpanan berkas gambar butir soal, bukti transfer siswa, modul PDF, dan rekaman kelas.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestStorage}
                disabled={testingStorage}
                className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-xs font-bold"
              >
                {testingStorage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5 text-cyan-600" />}
                Uji Koneksi Bucket S3
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  S3 Endpoint URL *
                </label>
                <input
                  type="text"
                  value={settings.s3_endpoint || "https://0987abcdef654321.r2.cloudflarestorage.com"}
                  onChange={(e) => handleSettingChange("s3_endpoint", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bucket Name *
                </label>
                <input
                  type="text"
                  value={settings.s3_bucket || "loloskampus-exam-assets"}
                  onChange={(e) => handleSettingChange("s3_bucket", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Access Key ID *
                </label>
                <input
                  type="text"
                  value={settings.s3_access_key || ""}
                  onChange={(e) => handleSettingChange("s3_access_key", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Secret Access Key *
                </label>
                <input
                  type="password"
                  value={settings.s3_secret_key || ""}
                  onChange={(e) => handleSettingChange("s3_secret_key", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Public Asset CDN Domain (Custom Domain R2)
              </label>
              <input
                type="text"
                value={settings.s3_public_domain || "https://assets.loloskampus.com"}
                onChange={(e) => handleSettingChange("s3_public_domain", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: PEMELIHARAAN (MAINTENANCE) & SPOTLIGHT BANNERS
      ========================================================================= */}
      {activeTab === "maintenance" && (
        <div className="space-y-6">
          {/* Maintenance Mode Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Mode Pemeliharaan (Maintenance Window)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tampilkan halaman pemeliharaan sistem sementara bagi seluruh siswa saat rilis update server.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode === "true"}
                  onChange={(e) =>
                    handleSettingChange("maintenance_mode", e.target.checked ? "true" : "false")
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Mulai Pemeliharaan (Opsional)
                </label>
                <input
                  type="datetime-local"
                  value={settings.maintenance_start || ""}
                  onChange={(e) => handleSettingChange("maintenance_start", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimasi Selesai (Opsional)
                </label>
                <input
                  type="datetime-local"
                  value={settings.maintenance_end || ""}
                  onChange={(e) => handleSettingChange("maintenance_end", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pesan Notifikasi Siswa
              </label>
              <textarea
                rows={2}
                value={settings.maintenance_message || ""}
                onChange={(e) => handleSettingChange("maintenance_message", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Spotlight Banners Manager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Spotlight Banner Carousel (Dashboard Siswa)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Banner slider interaktif yang tampil di bagian atas dashboard siswa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddBannerOpen(true)}
                className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Upload Banner Baru
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4 w-28">Pratinjau</th>
                      <th className="py-3 px-4">Judul & Keterangan</th>
                      <th className="py-3 px-4 w-40">Tautan Tujuan</th>
                      <th className="py-3 px-4 w-20 text-center">Urutan</th>
                      <th className="py-3 px-4 w-32 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {banners.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="w-20 h-11 object-cover rounded-lg border border-slate-200 dark:border-white/10"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{b.title}</div>
                          <div className="text-[10px] text-slate-400">{b.subtitle}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-600">
                          {b.linkUrl || "/tryout"}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          #{b.sortOrder}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleBanner(b.id, b.isActive)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              b.isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}
                          >
                            {b.isActive ? "TAMPIL" : "NONAKTIF"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAMBAH MITRA WHITELABEL BARU
      ========================================================================= */}
      {isAddTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Daftarkan Mitra Whitelabel Baru
              </h2>
              <button onClick={() => setIsAddTenantOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lembaga Mitra *
                </label>
                <input
                  type="text"
                  placeholder="cth: Bimbel Mandiri Nusantara"
                  value={tenantBrand}
                  onChange={(e) => setTenantBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subdomain Slug (Unique) *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="mandiri"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-l-xl font-mono"
                    required
                  />
                  <span className="px-3 py-2 bg-slate-100 dark:bg-white/10 border border-l-0 border-slate-200 dark:border-white/10 rounded-r-xl font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    .loloskampus.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Domain (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="tryout.bimbelmandiri.com"
                  value={tenantDomain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Warna Utama
                  </label>
                  <input
                    type="color"
                    value={tenantPrimary}
                    onChange={(e) => setTenantPrimary(e.target.value)}
                    className="w-full h-9 p-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Warna Aksen
                  </label>
                  <input
                    type="color"
                    value={tenantSecondary}
                    onChange={(e) => setTenantSecondary(e.target.value)}
                    className="w-full h-9 p-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batas Kuota Siswa
                </label>
                <input
                  type="number"
                  value={tenantMaxStudents}
                  onChange={(e) => setTenantMaxStudents(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddTenantOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-interactive px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Daftarkan Mitra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAMBAH BANNER SPOTLIGHT
      ========================================================================= */}
      {isAddBannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Tambah Banner Spotlight Baru
              </h2>
              <button onClick={() => setIsAddBannerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Promo Banner *
                </label>
                <input
                  type="text"
                  placeholder="cth: Tryout Akbar Nasional SKD #2"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subteks / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  placeholder="cth: Segera amankan kuota pendaftaran!"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Gambar Banner *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddBannerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-interactive px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Upload Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PengaturanAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
