import User from '../models/User.js';

/**
 * Ensures official administrator accounts exist and possess verified admin role
 */
export const seedAdmin = async () => {
  try {
    const officialAdminEmail = 'matrucareai@gmail.com';
    const defaultSecret = process.env.ADMIN_DEFAULT_PASSWORD;

    if (!defaultSecret) {
      return;
    }

    const officialAdmin = await User.findOne({ email: officialAdminEmail });

    if (!officialAdmin) {
      await User.create({
        fullName: 'HackSphere Admin',
        email: officialAdminEmail,
        password: defaultSecret,
        isVerified: true,
        role: 'admin',
      });
      console.log(`[Seed Admin] Initialized official admin account: ${officialAdminEmail}`);
    } else {
      let needsSave = false;
      if (officialAdmin.fullName === 'MatruCare AI Admin') {
        officialAdmin.fullName = 'HackSphere Admin';
        needsSave = true;
      }
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

    // 2. Ensure Joydip's account is a standard participant (user role)
    const candidateEmail = 'maitijoydip888@gmail.com';
    const candidateUser = await User.findOne({ email: candidateEmail });
    if (candidateUser && candidateUser.role !== 'user') {
      candidateUser.role = 'user';
      await candidateUser.save();
      console.log(`[Seed Admin] Reset developer account ${candidateEmail} to standard participant role`);
    }
  } catch (error) {
    console.error('[Seed Admin Error]:', error.message);
  }
};

