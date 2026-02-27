// Switch this import to swap between AWS (MySQL) and Supabase (Postgres)
import provider from './providers/mysqlProvider.js'; 
// import provider from './providers/postgresProvider.js';

const userRepository = {
  createUser: (userData) => provider.createUser(userData),
  findByUid: (uid) => provider.findByUid(uid),
  getAll: () => provider.getAll(),
};

export default userRepository;