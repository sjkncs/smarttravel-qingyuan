import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
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
    const { oldPassword, newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "新密码至少6位" }, { status: 400 });
    }

    // Get full user record with password
    const fullUser = await prisma?.user.findUnique({ where: { id: currentUser.id } });
    if (!fullUser) {
      return NextResponse.json({ success: false, message: "用户不存在" }, { status: 404 });
    }

    // If user has existing password, verify old password
    if (fullUser.password) {
      if (!oldPassword) {
        return NextResponse.json({ success: false, message: "请输入当前密码" }, { status: 400 });
      }
      const valid = await verifyPassword(oldPassword, fullUser.password);
      if (!valid) {
        return NextResponse.json({ success: false, message: "当前密码错误" }, { status: 400 });
      }
    }

    // Hash and update
    const hashed = await hashPassword(newPassword);
    await prisma?.user.update({
      where: { id: currentUser.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true, message: "密码修改成功" });
  } catch (error) {
    console.error("[ChangePassword Error]", error);
    return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
  }
}
