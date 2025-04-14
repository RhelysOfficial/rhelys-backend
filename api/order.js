import axios from 'axios';
const XENDIT_SECRET = process.env.XENDIT_SECRET;
const XENDIT_API = 'https://api.xendit.co/v2/invoices';
let stocks = { 'eau-de-parfum': 10, 'nuit': 10, 'belle': 10 };
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { productId, title, price } = req.body;
  if (stocks[productId] <= 0) {
    return res.status(400).json({ error: 'Stok habis' });
  }
  try {
    const response = await axios.post(XENDIT_API, {
      external_id: `${productId}-${Date.now()}`,
      amount: price,
      payer_email: 'customer@rhelys.com',
      description: title,
      currency: 'IDR'
    }, {
      auth: { username: XENDIT_SECRET }
    });
    res.status(200).json({ invoiceUrl: response.data.invoice_url });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat invoice' });
  }
};
