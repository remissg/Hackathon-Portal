import mongoose from 'mongoose';

const problemStatementSchema = new mongoose.Schema(
  {
    psId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Problem statement title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category / Track is required'],
      trim: true,
      default: 'AI/ML',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    expectedOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    starterKitUrl: {
      type: String,
      trim: true,
      default: '',
    },
    submissionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const timelinePhaseSchema = new mongoose.Schema(
  {
    phase: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'Active', 'Upcoming'],
      default: 'Upcoming',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const hackathonEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Hackathon title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    prizePool: {
      type: String,
      trim: true,
      default: '₹5,00,000',
    },
    startDate: {
      type: Date,
      default: () => new Date('2026-06-15'),
    },
    endDate: {
      type: Date,
      default: () => new Date('2026-06-17'),
    },
    registrationDeadline: {
      type: Date,
      default: () => new Date('2026-06-10'),
    },
    status: {
      type: String,
      enum: ['Draft', 'Upcoming', 'Active', 'Completed'],
      default: 'Active',
    },
    domains: {
      type: [String],
      default: [
        'AI/ML',
        'Healthcare Tech',
        'IoT & Robotics',
        'Web Dev',
        'Cyber Security',
        'Blockchain & Web3',
        'Cloud & DevOps',
        'Open Innovation',
      ],
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    timeline: [timelinePhaseSchema],
    problemStatements: [problemStatementSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Slug auto-generation
hackathonEventSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const HackathonEvent = mongoose.model('HackathonEvent', hackathonEventSchema);

export default HackathonEvent;

