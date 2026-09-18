// ============================================
// EMAIL HELPER untuk E-Force
// Menggunakan EmailJS (client-side)
// ============================================

// ⚠️ GANTI 3 VARIABEL INI DENGAN MILIK ANDA (dari dashboard EmailJS)
const EMAILJS_PUBLIC_KEY = 'AYo9frQiraJTIa3et';
const EMAILJS_SERVICE_ID = 'template_whfs6le';
const EMAILJS_TEMPLATE_ID = 'template_whfs6le';

function initEmailJS() {
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS belum dimuat. Tambahkan script EmailJS di <head>.');
        return false;
    }
    if (EMAILJS_PUBLIC_KEY === 'GANTI_DENGAN_PUBLIC_KEY_ANDA') {
        console.warn('EmailJS belum dikonfigurasi. Edit emailHelper.js.');
        return false;
    }
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    return true;
}

/**
 * Kirim notifikasi email ke semua user dengan role tertentu.
 */
async function sendEmailNotif(toRole, pengajuan, status, catatan, supabaseClient) {
    if (!initEmailJS()) {
        console.warn('Email tidak terkirim karena EmailJS belum dikonfigurasi.');
        return;
    }

    try {
        const { data: receivers, error } = await supabaseClient
            .from('users')
            .select('email, nama_lengkap')
            .eq('role', toRole);

        if (error || !receivers || receivers.length === 0) {
            console.warn('Tidak ada penerima email dengan role:', toRole);
            return;
        }

        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
        const linkDetail = `${baseUrl}/detail.html?id=${pengajuan.id}`;

        const results = await Promise.all(receivers.map(receiver => 
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                to_email: receiver.email,
                to_name: receiver.nama_lengkap,
                nama_obat: pengajuan.nama_obat,
                pengaju: pengajuan.pengaju?.nama_lengkap || pengajuan.pengaju?.email || 'Admin KSM',
                status: status,
                catatan: catatan || '-',
                link_detail: linkDetail
            })
        ));

        console.log('✅ Email terkirim ke', receivers.length, 'penerima role', toRole);
        return results;

    } catch (err) {
        console.error('❌ Gagal kirim email:', err);
    }
}
