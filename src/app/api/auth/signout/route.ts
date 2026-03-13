import { signOut } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    await signOut({ redirect: false });
    return NextResponse.redirect(new URL("/signup", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
