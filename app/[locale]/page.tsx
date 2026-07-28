import { redirect } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === "fr") {
    redirect("/landing");
  }

  redirect(`/${locale}/landing`);
}