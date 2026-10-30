import { NextResponse } from "next/server";
import { firebaseDefaults, firebaseSettingsSchema } from "@/cms/firebase";
import { getSettings, setSettings } from "@/server/settings";
import { requireAdmin, readJson, apiError } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request) {
  try {
    await requireAdmin(request, ["super_admin"]);
    return NextResponse.json(
      { settings: { ...firebaseDefaults, ...getSettings("firebase") } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function PUT(request) {
  try {
    const actor = await requireAdmin(request, ["super_admin"]);
    const settings = firebaseSettingsSchema.parse(
      await readJson(request, 10000),
    );
    setSettings("firebase", settings, actor);
    return NextResponse.json({
      settings,
      message:
        "Firebase connection settings saved. Existing CMS data and image URLs are unchanged.",
    });
  } catch (error) {
    return apiError(error);
  }
}
