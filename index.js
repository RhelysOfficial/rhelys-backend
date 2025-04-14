const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const XENDIT_SECRET = process.env.XENDIT_SECRET || 'YOUR_XENDIT_SECRET_KEY';
const XENDIT_API = 'https://api.xendit.co/v2/invoices';
const WA_NUMBER = '6283148035568';
const WA_API = 'https://api.whatsapp.com/send';

// Stok asli (ubah sesuai kebutuhan)
let stocks = { 'eau-de-parfum': 10, 'nuit': 10, 'belle': 10 };

// Endpoint untuk stok
app.get('/stocks', (req, res) => {
  res.json(stocks);
});

// Endpoint untuk buat pesanan
app.post('/order', async (req, res) => {
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
    res.json({ invoiceUrl: response.data.invoice_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membuat invoice' });
  }
});

// Webhook untuk pembayaran sukses
app.post('/webhook', async (req, res) => {
  const { event, data } = req.body;
  if (event === 'invoice.paid') {
    const { external_id, amount, paid_at } = data;
    const productId = external_id.split('-')[0];
    if (stocks[productId] > 0) {
      stocks[productId]--;
      const message = `Pembayaran Sukses:%0AProduk: ${productId}%0AHarga: Rp ${amount.toLocaleString('id-ID')}%0AWaktu: ${new Date(paid_at).toLocaleString('id-ID')}%0AStok Tersisa: ${stocks[productId]}`;
      await axios.get(`${WA_API}?phone=${WA_NUMBER}&text=${message}`);
    }
  }
  res.status(200).send('OK');
});

app.listen(process.env.PORT || 3000, () => console.log('Running'));