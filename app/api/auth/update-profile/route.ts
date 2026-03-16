import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const currentUser = await getCurrentUser(token);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "登录已过期" }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar, locale } = body;

    const updateData: Record<string, string> = {};
    if (name && typeof name === "string" && name.trim().length > 0 && name.length <= 50) {
      updateData.name = name.trim();
    }
    if (avatar && typeof avatar === "string") {
      updateData.avatar = avatar;
    }
    if (locale && (locale === "zh" || locale === "en")) {
      updateData.locale = locale;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: "没有可更新的字段" }, { status: 400 });
    }

    const updated = await prisma?.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: "更新失败" }, { status: 500 });
    }

    const { password: _, ...safeUser } = updated;
    return NextResponse.json({ success: true, message: "更新成功", user: safeUser });
  } catch (error) {
    console.error("[UpdateProfile Error]", error);
    return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
  }
}
