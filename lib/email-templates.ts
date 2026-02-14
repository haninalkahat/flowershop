
export const getOrderStatusEmail = (locale: string, orderId: string, status: string, name: string) => {
    const isTr = locale === 'tr';
    const isAr = locale === 'ar';

    // Status translations
    const statusMap: Record<string, { en: string; tr: string; ar: string }> = {
        'AWAITING_PAYMENT': { en: 'Awaiting Payment', tr: 'Ödeme Bekleniyor', ar: 'بانتظار الدفع' },
        'PAID': { en: 'Paid', tr: 'Ödendi', ar: 'تم الدفع' },
        'PREPARING': { en: 'Preparing', tr: 'Hazırlanıyor', ar: 'قيد التحضير' },
        'DELIVERED': { en: 'Delivered', tr: 'Teslim Edildi', ar: 'تم التسليم' },
        'REJECTED': { en: 'Rejected', tr: 'Reddedildi', ar: 'مرفوض' },
        'CANCELED': { en: 'Canceled', tr: 'İptal Edildi', ar: 'ملغى' },
    };

    const localizedStatus = statusMap[status]?.[locale as 'en' | 'tr' | 'ar'] || status;

    const subjects = {
        en: `Order Update: Your order #${orderId.slice(0, 8)} is now ${localizedStatus}`,
        tr: `Sipariş Güncellemesi: #${orderId.slice(0, 8)} nolu siparişiniz artık ${localizedStatus}`,
        ar: `تحديث الطلب: طلبك #${orderId.slice(0, 8)} أصبح الآن ${localizedStatus}`
    };

    const titles = {
        en: 'Order Status Update',
        tr: 'Sipariş Durumu Güncellemesi',
        ar: 'تحديث حالة الطلب'
    };

    const greetings = {
        en: `Hello ${name},`,
        tr: `Merhaba ${name},`,
        ar: `مرحباً ${name}،`
    };

    const messages = {
        en: `Your order #${orderId.slice(0, 8)} status has been updated to: <strong>${localizedStatus}</strong>.`,
        tr: `#${orderId.slice(0, 8)} numaralı siparişinizin durumu güncellendi: <strong>${localizedStatus}</strong>.`,
        ar: `تم تحديث حالة طلبك #${orderId.slice(0, 8)} إلى: <strong>${localizedStatus}</strong>.`
    };

    const buttons = {
        en: 'View Order Details',
        tr: 'Sipariş Detaylarını Görüntüle',
        ar: 'عرض تفاصيل الطلب'
    };

    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${locale}/profile?tab=orders`;

    const direction = isAr ? 'rtl' : 'ltr';
    const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

    const subject = subjects[locale as 'en' | 'tr' | 'ar'] || subjects.en;

    const html = `
<!DOCTYPE html>
<html lang="${locale}" dir="${direction}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titles[locale as keyof typeof titles]}</title>
    <style>
        body { font-family: ${fontFamily}; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #db2777; text-decoration: none; }
        .content { color: #374151; line-height: 1.6; font-size: 16px; }
        .status-box { background-color: #fdf2f8; border: 1px solid #fbcfe8; color: #db2777; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; font-weight: bold; }
        .button { display: inline-block; background-color: #db2777; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="logo">Flowershop</a>
        </div>
        <div class="content">
            <p>${greetings[locale as keyof typeof greetings]}</p>
            <p>${messages[locale as keyof typeof messages]}</p>
            
            <div class="status-box">
                ${localizedStatus}
            </div>

            <p style="text-align: center;">
                <a href="${link}" class="button">${buttons[locale as keyof typeof buttons]}</a>
            </p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Flowershop. All rights reserved.
        </div>
    </div>
</body>
</html>
    `;

    return { subject, html };
};
