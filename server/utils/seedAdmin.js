import User from '../models/User.js';

/**
 * Ensures official administrator accounts exist and possess verified admin role
 */
export const seedAdmin = async () => {
  try {
    // 1. Ensure official MatruCare AI admin account exists
    const officialAdminEmail = 'matrucareai@gmail.com';
    const officialAdmin = await User.findOne({ email: officialAdminEmail });

    const defaultSecret = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin2026';

    if (!officialAdmin) {
      await User.create({
        fullName: 'MatruCare AI Admin',
        email: officialAdminEmail,
        password: defaultSecret,
        isVerified: true,
        role: 'admin',
      });
      console.log(`[Seed Admin] Initialized official admin account: ${officialAdminEmail}`);
    } else {
      let needsSave = false;
      if (!officialAdmin.isVerified) {
        officialAdmin.isVerified = true;
        needsSave = true;
      }
      if (officialAdmin.role !== 'admin') {
        officialAdmin.role = 'admin';
        needsSave = true;
      }

      // Ensure password is synchronized with default admin password
      const isMatch = await officialAdmin.matchPassword(defaultSecret);
      if (!isMatch) {
        officialAdmin.password = defaultSecret;
        needsSave = true;
      }

      if (needsSave) {
        await officialAdmin.save();
        console.log(`[Seed Admin] Updated ${officialAdminEmail} with admin privileges & verified password`);
      }
    }

    // 2. Ensure candidate developer email has admin privileges if exists
    const candidateEmail = 'maitijoydip888@gmail.com';
    const candidateUser = await User.findOne({ email: candidateEmail });
    if (candidateUser && candidateUser.role !== 'admin') {
      candidateUser.role = 'admin';
      candidateUser.isVerified = true;
      await candidateUser.save();
      console.log(`[Seed Admin] Granted admin role to developer account: ${candidateEmail}`);
    }
  } catch (error) {
    console.error('[Seed Admin Error]:', error.message);
  }
};

