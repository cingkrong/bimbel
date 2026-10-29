import { redirect } from "next/navigation";

export default function KuponAdminRedirect() {
  redirect("/admin/transaksi?tab=coupons");
}

