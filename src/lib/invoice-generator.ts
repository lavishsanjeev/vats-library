import puppeteer from 'puppeteer';

export async function generateInvoicePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        // Set content and wait for network idle to ensure fonts/images load
        await page.setContent(html, {
            waitUntil: 'networkidle0',
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10px',
                right: '10px',
                bottom: '10px',
                left: '10px',
            },
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}
