"use server";

import { ApiResponse } from "../lib/api_response";
import { createClient } from "../lib/supabase_server_client";
import { Base, BaseSchema } from "../types";
import { z } from "zod";

export async function uploadBase(prevState: ApiResponse<string> | undefined, formData: FormData): Promise<ApiResponse<string>> {
    const baseLink = formData.get("baseLink") as string;
    const thLevel = Number(formData.get("thLevel"));
    let imageUrl = formData.get("imageUrl") as string;
    const imageFile = formData.get("imageFile") as File;

    if (!baseLink || !z.string().url().safeParse(baseLink).success) {
        return { success: false, error: "Valid base link is required" };
    }

    if (!thLevel || thLevel < 1 || thLevel > 17) {
        return { success: false, error: "Town Hall level must be between 1 and 17" };
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "You must be signed in to upload a base" };
    }

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('base-previews')
            .upload(filePath, imageFile);

        if (uploadError) {
            return { success: false, error: "Failed to upload image: " + uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('base-previews')
            .getPublicUrl(filePath);

        imageUrl = publicUrl;
    }

    if (!imageUrl || !z.string().url().safeParse(imageUrl).success) {
        return { success: false, error: "Valid preview image or file is required" };
    }

    const { error } = await supabase.from('Base').insert({
        link: baseLink,
        preview_img_link: imageUrl,
        th_level: thLevel,
    })

    if (error) {
        console.error("error: ", error)
        return {
            success: false,
            error: error.message
        }
    }

    // revalidatePath("/");
    return { success: true, data: "Base uploaded successfully" };
}

export async function getAllBases(): Promise<ApiResponse<Base[]>> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('Base').select('*').order('created_at', { ascending: false });

    if (error) return {
        error: error.message,
        success: false
    }

    const parseddata = (data || []).map((d) => {
        const parseResult = BaseSchema.safeParse({
            id: d.id.toString(),
            link: d.link ?? '',
            createdAt: new Date(d.created_at),
            imgUrl: d.preview_img_link ?? '',
            thLevel: d.th_level ?? 1
        });

        if (!parseResult.success) {
            console.error("Failed to parse base data:", parseResult.error.format());
            return null;
        }
        return parseResult.data;
    }).filter((r): r is Base => r !== null);

    return {
        success: true,
        data: parseddata
    }
}

