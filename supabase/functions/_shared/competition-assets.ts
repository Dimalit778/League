import type { SupabaseClient } from "@supabase/supabase-js";

export type FootballDataArea = {
    id: number;
    name: string;
    code: string | null;
    flag: string | null;
};

export type FootballDataSeason = {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number | null;
    stages?: string[];
};

export type FootballDataCompetition = {
    id: number;
    name: string;
    code: string | null;
    type: string | null;
    emblem: string | null;
    area: FootballDataArea | null;
    currentSeason: FootballDataSeason | null;
};

type DownloadedImage = {
    buffer: Uint8Array;
    contentType: string;
    extension: string;
};

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function inferExtensionFromContentType(
    contentType: string | null,
): string {
    if (!contentType) return "png";

    if (contentType.includes("svg")) return "svg";
    if (contentType.includes("webp")) return "webp";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
        return "jpg";
    }
    if (contentType.includes("png")) return "png";

    return "png";
}

function inferExtensionFromUrl(url: string): string | null {
    const match = url
        .toLowerCase()
        .match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);

    if (!match?.[1]) {
        return null;
    }

    return match[1] === "jpeg" ? "jpg" : match[1];
}

function sanitizeStoragePath(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_-]+/gu, "_")
        .replace(/^_+|_+$/g, "");
}

async function downloadImage(
    url: string,
): Promise<DownloadedImage> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Image download failed: ${response.status} ${response.statusText} ${url}`,
        );
    }

    const buffer = new Uint8Array(
        await response.arrayBuffer(),
    );

    const contentType = response.headers.get("content-type") ??
        "application/octet-stream";

    const extension = inferExtensionFromUrl(url) ??
        inferExtensionFromContentType(contentType);

    return {
        buffer,
        contentType,
        extension,
    };
}

async function uploadImageToBucket(
    supabase: SupabaseClient,
    bucket: string,
    pathWithoutExtension: string,
    image: DownloadedImage,
): Promise<string> {
    const path = `${pathWithoutExtension}.${image.extension}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, image.buffer, {
            contentType: image.contentType,
            upsert: true,
        });

    if (error) {
        throw new Error(
            `Storage upload failed for ${bucket}/${path}: ${error.message}`,
        );
    }

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
}

export async function storeCompetitionFlag(
    supabase: SupabaseClient,
    competition: FootballDataCompetition,
): Promise<string | null> {
    const flagUrl = competition.area?.flag;

    if (!flagUrl) {
        return null;
    }

    try {
        const image = await downloadImage(flagUrl);

        const areaPath = sanitizeStoragePath(
            competition.area?.name ?? "area",
        );

        return await uploadImageToBucket(
            supabase,
            "flags",
            areaPath,
            image,
        );
    } catch (error) {
        console.warn(
            `Failed storing flag for ${competition.code}:`,
            getErrorMessage(error),
        );

        return null;
    }
}
