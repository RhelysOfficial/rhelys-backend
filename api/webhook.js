import axios from 'axios';
const WA_NUMBER = '6283148035568';
const WA_API = 'https://api.whatsapp.com/send';
let stocks = { 'eau-de-parfum': 10, 'nuit': 10, 'belle': 10 };
export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
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
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
