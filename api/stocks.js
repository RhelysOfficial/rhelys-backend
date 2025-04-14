let stocks = { 'eau-de-parfum': 10, 'nuit': 10, 'belle': 10 };
export default (req, res) => {
  res.status(200).json(stocks);
}
