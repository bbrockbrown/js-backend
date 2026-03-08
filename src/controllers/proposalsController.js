import proposalRepository from '../repositories/proposalRepository.js';

const parseSort = (value) => (value === 'oldest' ? 'oldest' : 'newest');

const proposalsController = {
  async getProposals(req, res) {
    try {
      const filters = {
        search: req.query.search?.trim() || '',
        category: req.query.category?.trim() || '',
        status: req.query.status?.trim() || '',
        tag: req.query.tag?.trim() || '',
        sort: parseSort(req.query.sort),
      };

      const items = await proposalRepository.getAll(filters);

      return res.status(200).json({
        items,
        pagination: {
          page: 1,
          limit: items.length,
          totalItems: items.length,
          totalPages: 1,
        },
      });
    } catch (error) {
      console.error('Get proposals error:', error);
      return res.status(500).json({
        error:
          process.env.NODE_ENV === 'production'
            ? 'Failed to load proposals'
            : error.message,
      });
    }
  },

  async getProposalById(req, res) {
    try {
      const proposalId = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(proposalId) || proposalId <= 0) {
        return res.status(400).json({ error: 'Invalid proposal id' });
      }

      const proposal = await proposalRepository.getById(proposalId);
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      return res.status(200).json(proposal);
    } catch (error) {
      console.error('Get proposal by id error:', error);
      return res.status(500).json({
        error:
          process.env.NODE_ENV === 'production'
            ? 'Failed to load proposal'
            : error.message,
      });
    }
  },

  async getProposalTags(_req, res) {
    try {
      const tags = await proposalRepository.getAllTags();
      return res.status(200).json({ tags });
    } catch (error) {
      console.error('Get proposal tags error:', error);
      return res.status(500).json({
        error:
          process.env.NODE_ENV === 'production'
            ? 'Failed to load tags'
            : error.message,
      });
    }
  },
};

export default proposalsController;
