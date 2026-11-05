import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Team member email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address for team member'],
    },
  },
  { _id: false }
);

const hackathonRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One hackathon registration per user
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'Other'],
      default: 'B.Tech',
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AIDS', 'AIML', 'Other'],
      default: 'CSE',
    },
    yearOfStudy: {
      type: String,
      required: [true, 'Year of study is required'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      default: '3rd Year',
    },
    domain: {
      type: String,
      required: [true, 'Domain / Track is required'],
      enum: [
        'AI/ML',
        'Web Dev',
        'IoT & Robotics',
        'Cyber Security',
        'Blockchain & Web3',
        'Healthcare Tech',
        'Cloud & DevOps',
      ],
      default: 'AI/ML',
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [5, 'Project name must be at least 5 characters long'],
    },
    pptLink: {
      type: String,
      required: [true, 'Presentation (PPT) link is required'],
      trim: true,
    },
    prototypeLink: {
      type: String,
      required: [true, 'Prototype/Code repository link is required'],
      trim: true,
    },
    demoVideoLink: {
      type: String,
      trim: true,
      default: '',
    },
    teamSize: {
      type: Number,
      required: [true, 'Team size is required'],
      min: 1,
      max: 5,
      default: 1,
    },
    teamMembers: [teamMemberSchema],
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Shortlisted', 'Finalist'],
      default: 'Submitted',
    },
  },
  {
    timestamps: true,
  }
);

const HackathonRegistration = mongoose.model(
  'HackathonRegistration',
  hackathonRegistrationSchema
);

export default HackathonRegistration;
