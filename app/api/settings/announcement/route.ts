import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.setting.findMany({
            where: {
                key: {
                    in: [
                        'announcement_enabled',
                        'announcement_text_tr',
                        'announcement_text_en',
                        'announcement_text_ar',
                        'announcement_bg_color',
                        'announcement_text_color'
                    ]
                }
            }
        });

        const config = {
            enabled: settings.find(s => s.key === 'announcement_enabled')?.value === 'true',
            textTr: settings.find(s => s.key === 'announcement_text_tr')?.value || '',
            textEn: settings.find(s => s.key === 'announcement_text_en')?.value || '',
            textAr: settings.find(s => s.key === 'announcement_text_ar')?.value || '',
            bgColor: settings.find(s => s.key === 'announcement_bg_color')?.value || '#FFC0CB',
            textColor: settings.find(s => s.key === 'announcement_text_color')?.value || '#831843',
        };

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { enabled, textTr, textEn, textAr, bgColor, textColor } = body;

        // Upsert settings
        await prisma.$transaction([
            prisma.setting.upsert({
                where: { key: 'announcement_enabled' },
                update: { value: String(enabled) },
                create: { key: 'announcement_enabled', value: String(enabled) }
            }),
            prisma.setting.upsert({
                where: { key: 'announcement_text_tr' },
                update: { value: textTr || '' },
                create: { key: 'announcement_text_tr', value: textTr || '' }
            }),
            prisma.setting.upsert({
                where: { key: 'announcement_text_en' },
                update: { value: textEn || '' },
                create: { key: 'announcement_text_en', value: textEn || '' }
            }),
            prisma.setting.upsert({
                where: { key: 'announcement_text_ar' },
                update: { value: textAr || '' },
                create: { key: 'announcement_text_ar', value: textAr || '' }
            }),
            prisma.setting.upsert({
                where: { key: 'announcement_bg_color' },
                update: { value: bgColor || '#FFC0CB' },
                create: { key: 'announcement_bg_color', value: bgColor || '#FFC0CB' }
            }),
            prisma.setting.upsert({
                where: { key: 'announcement_text_color' },
                update: { value: textColor || '#831843' },
                create: { key: 'announcement_text_color', value: textColor || '#831843' }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
