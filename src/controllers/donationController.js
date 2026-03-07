import donationRepository from '../repositories/donationRepository.js';

const donationController = {

  async getDonations(req, res) {
    try {
      const { search, status, minAmount, maxAmount } = req.query
      const donations = await donationRepository.getDonations({
        search,
        status,
        minAmount,
        maxAmount
      })
      res.json(donations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getDonationDetail(req, res) {
    try {
      const id = req.params.id;

      const donation = await donationRepository.getById(id);

      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }

      res.json(donation);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

//   async createDonation(req, res) {
//     try {
//       const { donorName, amount } = req.body;

//       const donation = await donationRepository.create({
//         donorName,
//         amount
//       });

//       res.status(201).json(donation);

//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }

};

export default donationController;