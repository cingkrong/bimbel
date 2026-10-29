import { redirect } from "next/navigation";

export default function AfiliasiAdminRedirect() {
  redirect("/admin/transaksi?tab=payouts");
}

