'use server'
import { revalidatePath } from "next/cache";
import { ApiResponse } from "../lib/api_response";
import { createClient } from "../lib/supabase_server_client";
import { Resend } from 'resend';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function signInWithOtp(prevState: any, formData: FormData): Promise<ApiResponse<any>> {
    const email = formData.get("email") as string;

    if (!email) {
        return { success: false, error: "Email is required" };
    }

    try {
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
        });

        if (linkError) {
            console.error("Link generation error:", linkError);
            return { success: false, error: linkError.message };
        }

        // Use the 6-digit OTP code for the custom link. 
        // Supabase's verifyOtp with type: 'magiclink' expects this code.
        const otp = data.properties.email_otp;
        const confirmLink = `http://localhost:3000/auth/confirm?token=${otp}&email=${email}`;

        const { error: sendError } = await resend.emails.send({
            from: 'CoC Base Share <onboarding@resend.dev>',
            to: email,
            subject: 'Your Magic Link for CoC Base Share',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #4A3B2A; text-align: center;">Welcome Chief!</h2>
                    <p style="color: #5c4d3c; font-size: 16px;">Ready to share your bases? Click the button below to sign in:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmLink}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Sign In to Village</a>
                    </div>
                    <p style="color: #888; font-size: 14px; text-align: center;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="color: #007bff; font-size: 12px; word-break: break-all; text-align: center;">${confirmLink}</p>
                    <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; border-top: 1 solid #eee; padding-top: 20px;">This link will expire in 5 minutes.</p>
                </div>
            `
        });

        if (sendError) {
            console.error("Resend error:", sendError);
            return { success: false, error: "Failed to send email. Please try again later." };
        }

        return {
            success: true,
            data: { emailSent: true, email },
            message: "A verification link has been sent to your email"
        };
    } catch (error: any) {
        console.error("Auth action error:", error);
        return { success: false, error: error.message || "An unexpected error occurred" };
    }
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
}