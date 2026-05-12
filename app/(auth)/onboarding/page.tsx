import { redirect } from "next/navigation";
import { isFirstBoot } from "@/app/lib/dal";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const firstBoot = await isFirstBoot();
  if (!firstBoot) redirect("/login");

  return <OnboardingForm />;
}
