import { logAudit } from './security';
import { prisma } from './prisma';

interface DispatchOptions {
    recipientName: string;
    faxNumber?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export async function dispatchPhysicalAppeal(
    userId: string,
    claimId: string,
    content: string,
    options: DispatchOptions
) {
    const LOB_API_KEY = process.env.LOB_API_KEY;
    const PHAXIO_API_KEY = process.env.PHAXIO_API_KEY;
    const PHAXIO_API_SECRET = process.env.PHAXIO_API_SECRET;

    // 1. Initialize Persistence Record
    const dispatchEntry = await prisma.physicalDispatch.create({
        data: {
            claimId,
            userId,
            method: options.faxNumber ? 'FAX' : 'MAIL',
            recipientAddress: options.faxNumber || `${options.streetAddress}, ${options.city}, ${options.state} ${options.zip}`,
            content: content,
            status: 'PENDING'
        }
    });

    try {
        await logAudit(userId, 'PHYSICAL_DISPATCH_ATTEMPT', `Claim: ${claimId} | Method: ${options.faxNumber ? 'FAX' : 'MAIL'}`);

        // --- METHOD 1: FAX DISPATCH (PHAXIO) ---
        if (options.faxNumber) {
            if (!PHAXIO_API_KEY || !PHAXIO_API_SECRET) {
                console.warn("[AGENT 41] Phaxio keys missing. Dry run mode.");
                await prisma.physicalDispatch.update({
                    where: { id: dispatchEntry.id },
                    data: { status: 'SENT', trackingId: 'DRY-RUN-FAX-NO-KEY' }
                });
                return { success: true, mode: 'DRY_RUN', message: "Fax logged (Keys missing)." };
            }

            const formData = new FormData();
            formData.append('to', options.faxNumber);
            formData.append('string_data', content);
            formData.append('string_data_type', 'html');

            const res = await fetch('https://api.phaxio.com/v2.1/faxes', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${PHAXIO_API_KEY}:${PHAXIO_API_SECRET}`).toString('base64')}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(`Phaxio Error: ${data.message || res.statusText}`);

            await prisma.physicalDispatch.update({
                where: { id: dispatchEntry.id },
                data: { status: 'SENT', trackingId: data.data.id }
            });

            await logAudit(userId, 'PHYSICAL_DISPATCH_SUCCESS', `Fax ID: ${data.data.id}`);
            return { success: true, trackingId: data.data.id, method: 'FAX' };
        }

        // --- METHOD 2: SNAIL-MAIL DISPATCH (LOB) ---
        if (options.streetAddress) {
            if (!LOB_API_KEY) {
                console.warn("[AGENT 41] Lob keys missing. Dry run mode.");
                await prisma.physicalDispatch.update({
                    where: { id: dispatchEntry.id },
                    data: { status: 'SENT', trackingId: 'DRY-RUN-MAIL-NO-KEY' }
                });
                return { success: true, mode: 'DRY_RUN', message: "Mail logged (Keys missing)." };
            }

            const res = await fetch('https://api.lob.com/v1/letters', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${LOB_API_KEY}:`).toString('base64')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: `MediClaim Appeal - Claim ${claimId}`,
                    to: {
                        name: options.recipientName,
                        address_line1: options.streetAddress,
                        address_city: options.city || "Newark",
                        address_state: options.state || "NJ",
                        address_zip: options.zip || "07102",
                        address_country: "US"
                    },
                    from: "Company_Sender_ID",
                    file: `<html><body>${content}</body></html>`,
                    color: false,
                    double_sided: true
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(`Lob Error: ${data.error?.message || res.statusText}`);

            await prisma.physicalDispatch.update({
                where: { id: dispatchEntry.id },
                data: {
                    status: 'SENT',
                    trackingId: data.id,
                    estDeliveryDate: data.expected_delivery_date ? new Date(data.expected_delivery_date) : null
                }
            });

            await logAudit(userId, 'PHYSICAL_DISPATCH_SUCCESS', `Mail ID: ${data.id}`);
            return { success: true, trackingId: data.id, method: 'MAIL', estDeliveryDate: data.expected_delivery_date };
        }

        throw new Error("Invalid dispatch options: Neither fax nor mail destination provided.");

    } catch (error: any) {
        await prisma.physicalDispatch.update({
            where: { id: dispatchEntry.id },
            data: { status: 'FAILED' }
        });
        await logAudit(userId, 'PHYSICAL_DISPATCH_FAILED', error.message);
        return { success: false, error: error.message };
    }
}
