import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.appSetting.findMany({
      where: { isSecret: false },
    });

    const settingsMap: Record<string, string> = {
      active_payment_gateway: "BIONPAY_QRIS_ONLY",
      checkout_mode: "GATEWAY",
      whatsapp_hotline: "081234567890",
      maintenance_mode: "false",
      maintenance_message: "",
      meta_ads_active: "true",
      meta_pixel_id: "109832746192847",
      meta_track_pageview: "true",
      meta_track_viewcontent: "true",
      meta_track_initiatecheckout: "true",
      meta_track_purchase: "true",
      meta_track_lead: "true",
    };

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (err: any) {
    return NextResponse.json({
      settings: {
        active_payment_gateway: "BIONPAY_QRIS_ONLY",
        whatsapp_hotline: "081234567890",
        meta_ads_active: "false",
        meta_pixel_id: "",
      },
    });
  }
}
