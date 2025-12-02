export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    userName: string;
    userEmail: string;
    userClerkId: string; // Used for Student ID or similar
    amount: number;
    periodStart: string;
    periodEnd: string;
}

export function getInvoiceHtml(data: InvoiceData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Vats Library</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #6366f1; /* Indigo */
            --secondary-color: #4338ca; /* Darker Indigo */
            --accent-color: #f59e0b; /* Amber */
            --text-dark: #1e293b;
            --text-light: #64748b;
            --bg-light: #f8fafc;
            --white: #ffffff;
        }

        body {
            font-family: 'Outfit', sans-serif;
            color: var(--text-dark);
            background-color: #e2e8f0;
            padding: 20px;
            margin: 0;
            -webkit-font-smoothing: antialiased;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--white);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-radius: 16px;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: var(--white);
            padding: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 8px;
            backdrop-filter: blur(5px);
        }

        .logo img {
            max-height: 50px;
            display: block;
        }

        .invoice-title {
            text-align: right;
        }

        .invoice-title h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: -1px;
            opacity: 0.9;
        }

        .invoice-meta {
            margin-top: 5px;
            font-size: 14px;
            opacity: 0.8;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            background-color: rgba(255, 255, 255, 0.2);
            color: var(--white);
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .content-body {
            padding: 30px;
        }

        .billing-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .bill-section h3 {
            color: var(--text-light);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .bill-section p {
            margin: 5px 0;
            font-size: 16px;
            color: var(--text-dark);
            line-height: 1.6;
        }

        .bill-section strong {
            font-size: 18px;
            color: var(--primary-color);
            display: block;
            margin-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 40px;
        }

        th {
            background-color: var(--bg-light);
            color: var(--text-light);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
            padding: 15px 20px;
            text-align: left;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }

        td {
            padding: 20px;
            border-bottom: 1px solid #f1f5f9;
            color: var(--text-dark);
        }

        tr:last-child td {
            border-bottom: none;
        }

        .item-desc {
            font-weight: 600;
            color: var(--text-dark);
        }

        .total-section {
            background-color: var(--bg-light);
            padding: 30px;
            border-radius: 12px;
            margin-left: auto;
            width: 50%;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            color: var(--text-light);
        }

        .total-row.final {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #cbd5e1;
            color: var(--text-dark);
            font-weight: 700;
            font-size: 24px;
        }

        .total-row.final span:last-child {
            color: var(--primary-color);
        }

        .footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px dashed #cbd5e1;
            color: var(--text-light);
            font-size: 14px;
        }
        
        .accent-bar {
            height: 8px;
            background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
            width: 100%;
        }

        @media (max-width: 600px) {
            body {
                padding: 20px;
            }
            
            .invoice-container {
                border-radius: 0;
            }

            .header {
                flex-direction: column;
                text-align: center;
                gap: 20px;
                padding: 30px 20px;
            }

            .invoice-title {
                text-align: center;
            }

            .invoice-title h1 {
                font-size: 36px;
            }

            .content-body {
                padding: 20px;
            }

            .billing-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }

            .total-section {
                width: 100%;
                padding: 20px;
            }

            th, td {
                padding: 10px;
                font-size: 14px;
            }
            
            .logo img {
                margin: 0 auto;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="accent-bar"></div>
        <div class="header">
            <div class="logo">
                <!-- Assuming logo is accessible via public URL or base64. For PDF, base64 or absolute path is safer, but public URL might work if server is running. -->
                <!-- We will use text fallback if image fails, or user can ensure logo.jpg is in public -->
                <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.jpg" alt="Vats Library Logo" onerror="this.style.display='none'">
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-meta">#${data.invoiceNumber}</div>
                <div class="invoice-meta">${data.date}</div>
                <div class="status-badge">Paid</div>
            </div>
        </div>

        <div class="content-body">
            <div class="billing-grid">
                <div class="bill-section">
                    <h3>From</h3>
                    <p><strong>Vats Library</strong></p>
                    <p>442 , kamalpur brahman chopal</p>
                    <p>+91 82952 95283</p>
                    <p>admin@vatslibrary.com</p>
                </div>
                <div class="bill-section">
                    <h3>Bill To</h3>
                    <p><strong>${data.userName}</strong></p>
                    <p>Student ID: ${data.userClerkId.substring(0, 8)}...</p>
                    <p>${data.userEmail}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="border-radius: 8px 0 0 8px;">Description</th>
                        <th style="text-align: center;">Period</th>
                        <th style="text-align: right; border-radius: 0 8px 8px 0;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="item-desc">Library Membership - Monthly Plan</td>
                        <td style="text-align: center;">${data.periodStart} - ${data.periodEnd}</td>
                        <td style="text-align: right;">₹${data.amount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹${data.amount.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax (0%)</span>
                    <span>₹0.00</span>
                </div>
                <div class="total-row final">
                    <span>Total</span>
                    <span>₹${data.amount.toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for choosing Vats Library!</p>
                <p>For any queries, please contact support@vatslibrary.com</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}
