import HackathonEvent from '../models/HackathonEvent.js';
import HackathonRegistration from '../models/HackathonRegistration.js';
import { recordAuditLog } from '../utils/auditLogger.js';

/**
 * Seed default hackathon event and curated problem statements if DB is empty
 */
export const seedDefaultEventIfEmpty = async () => {
  try {
    const count = await HackathonEvent.countDocuments();
    if (count > 0) return;

    console.log('[HackathonEvent] Seeding default HackSphere Hackathon 2026 with Problem Statements...');

    await HackathonEvent.create({
      title: 'HackSphere National Innovation Hackathon 2026',
      slug: 'hacksphere-national-hackathon-2026',
      tagline: 'Pioneering AI & IoT Innovations in Healthcare, Web3, Telemetry & Intelligent Systems',
      description:
        'HackSphere National Innovation Hackathon 2026 invites student innovators, researchers, and engineers across India to design production-ready, scalable solutions solving high-impact challenges in maternal healthcare, remote telemetry, and preventative diagnostic intelligence.',
      prizePool: '₹5,00,000',
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-17T18:00:00Z'),
      registrationDeadline: new Date('2026-06-10T23:59:59Z'),
      status: 'Active',
      domains: [
        'AI/ML',
        'Healthcare Tech',
        'IoT & Robotics',
        'Web Dev',
        'Cyber Security',
        'Blockchain & Web3',
        'Cloud & DevOps',
      ],
      problemStatements: [
        {
          psId: 'MCAI-PS-01',
          title: 'Predictive Maternal Health Analytics & High-Risk Pregnancy Early Warning Engine',
          category: 'AI/ML',
          difficulty: 'Advanced',
          description:
            'Build an ML model trained on maternal physiological vitals, clinical history, and demographic indicators to predict preeclampsia, gestational diabetes, and fetal distress with explainable risk scores.',
          expectedOutcomes: [
            'Trained ML model pipeline (Target AUC > 0.88)',
            'Interactive doctor risk diagnostic dashboard',
            'REST API scoring service with real-time inference',
          ],
          starterKitUrl: 'https://github.com/matrucare-ai/maternal-risk-dataset-starter',
        },
        {
          psId: 'MCAI-PS-02',
          title: 'IoT-Connected Smart Wearable Node for Real-Time Maternal & Fetal Telemetry',
          category: 'IoT & Robotics',
          difficulty: 'Intermediate',
          description:
            'Design an ultra-low-power edge telemetry firmware and simulator that continuously captures maternal SpO2, heart rate, and uterine contraction patterns, auto-dispatching SOS alerts via MQTT.',
          expectedOutcomes: [
            'MQTT telemetry simulator or ESP32 embedded sketch',
            'Emergency trigger webhook with GPS geo-tagging',
            'Live vitals graph & telemetry visualization UI',
          ],
          starterKitUrl: 'https://github.com/matrucare-ai/iot-telemetry-starter',
        },
        {
          psId: 'MCAI-PS-03',
          title: 'Accessible Multilingual Rural Mother-Care Portal & Emergency ASHA Dispatcher',
          category: 'Healthcare Tech',
          difficulty: 'Beginner',
          description:
            'Create an offline-first, voice-assisted Progressive Web App (PWA) in regional Indian languages that guides mothers through trimester milestones, nutrition tracking, and 1-tap local ASHA worker SOS.',
          expectedOutcomes: [
            'PWA supporting offline ServiceWorker caching',
            'Voice or regional UI toggle (Hindi, Bengali, Tamil, Telugu)',
            'Automated ASHA alert routing service with SMS integration',
          ],
          starterKitUrl: 'https://github.com/matrucare-ai/rural-health-pwa-starter',
        },
        {
          psId: 'MCAI-PS-04',
          title: 'Tamper-Proof Decentralized Health Records (EHR) & Immunization Audit Trail',
          category: 'Blockchain & Web3',
          difficulty: 'Advanced',
          description:
            'Implement a zero-knowledge or cryptographic audit log smart contract securing maternal immunization records, prenatal lab tests, and hospital discharge summaries with patient-controlled access.',
          expectedOutcomes: [
            'Solidity or smart contract for verifiable immutability',
            'Client-side consent and medical record viewer UI',
            'Fast cryptographic proof-of-authenticity verifier',
          ],
          starterKitUrl: 'https://github.com/matrucare-ai/decentralized-ehr-starter',
        },
      ],
    });

    console.log('[HackathonEvent] Successfully seeded default event and 4 problem statements.');
  } catch (error) {
    console.error('[HackathonEvent Seed Error]:', error);
  }
};

/**
 * @desc    Get all active/published hackathon events
 * @route   GET /api/events
 * @access  Public
 */
export const getPublicEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'Draft' };
    }

    const events = await HackathonEvent.find(filter)
      .sort({ startDate: 1 })
      .lean();

    // Map registration counts to each event
    const eventsWithCounts = await Promise.all(
      events.map(async (ev) => {
        const registrationCount = await HackathonRegistration.countDocuments({
          $or: [{ hackathonId: ev._id }, { domain: { $in: ev.domains } }],
        });
        return {
          ...ev,
          problemStatementCount: ev.problemStatements?.length || 0,
          registrationCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: eventsWithCounts.length,
      events: eventsWithCounts,
    });
  } catch (error) {
    console.error('[Get Public Events Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch hackathons',
    });
  }
};

/**
 * @desc    Get single hackathon by slug or ID with full problem statements
 * @route   GET /api/events/:slugOrId
 * @access  Public
 */
export const getEventBySlugOrId = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let event = null;

    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      event = await HackathonEvent.findById(slugOrId).lean();
    }
    if (!event) {
      event = await HackathonEvent.findOne({ slug: slugOrId }).lean();
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon event not found',
      });
    }

    const registrationCount = await HackathonRegistration.countDocuments({
      $or: [{ hackathonId: event._id }, { domain: { $in: event.domains } }],
    });

    return res.status(200).json({
      success: true,
      event: {
        ...event,
        registrationCount,
        problemStatementCount: event.problemStatements?.length || 0,
      },
    });
  } catch (error) {
    console.error('[Get Event By Slug Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch hackathon event details',
    });
  }
};

/**
 * @desc    Get all problem statements across hackathons with optional filters
 * @route   GET /api/events/problems/all
 * @access  Public
 */
export const getAllProblemStatements = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    const events = await HackathonEvent.find({ status: { $ne: 'Draft' } }).lean();

    let allProblems = [];
    events.forEach((ev) => {
      (ev.problemStatements || []).forEach((ps) => {
        allProblems.push({
          ...ps,
          hackathonId: ev._id,
          hackathonTitle: ev.title,
          hackathonSlug: ev.slug,
          deadline: ev.registrationDeadline,
        });
      });
    });

    if (category && category !== 'All') {
      allProblems = allProblems.filter((p) => p.category === category);
    }

    if (difficulty && difficulty !== 'All') {
      allProblems = allProblems.filter((p) => p.difficulty === difficulty);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      allProblems = allProblems.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.psId.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: allProblems.length,
      problems: allProblems,
    });
  } catch (error) {
    console.error('[Get All Problem Statements Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch problem statements',
    });
  }
};

/**
 * @desc    Admin: Create new hackathon
 * @route   POST /api/events
 * @access  Private / Admin
 */
export const createHackathonEvent = async (req, res) => {
  try {
    const {
      title,
      tagline,
      description,
      prizePool,
      startDate,
      endDate,
      registrationDeadline,
      domains,
      bannerUrl,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Hackathon title is required',
      });
    }

    const event = await HackathonEvent.create({
      title,
      tagline,
      description,
      prizePool,
      startDate,
      endDate,
      registrationDeadline,
      domains: Array.isArray(domains) && domains.length > 0 ? domains : undefined,
      bannerUrl,
      status: status || 'Active',
      createdBy: req.user._id,
      problemStatements: [],
    });

    await recordAuditLog({
      req,
      category: 'problems',
      action: 'EVENT_CREATED',
      severity: 'info',
      target: { type: 'event', id: event._id, label: event.title },
      summary: `Created hackathon event "${event.title}" (Status: ${event.status})`,
    });

    return res.status(201).json({
      success: true,
      message: 'Hackathon created successfully',
      event,
    });
  } catch (error) {
    console.error('[Create Hackathon Event Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create hackathon event',
    });
  }
};

/**
 * @desc    Admin: Update hackathon details
 * @route   PUT /api/events/:id
 * @access  Private / Admin
 */
export const updateHackathonEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await HackathonEvent.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon event not found',
      });
    }

    await recordAuditLog({
      req,
      category: 'problems',
      action: 'EVENT_UPDATED',
      severity: 'info',
      target: { type: 'event', id: event._id, label: event.title },
      summary: `Updated hackathon event details for "${event.title}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Hackathon event updated successfully',
      event,
    });
  } catch (error) {
    console.error('[Update Hackathon Event Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update hackathon event',
    });
  }
};

/**
 * @desc    Admin: Delete hackathon event
 * @route   DELETE /api/events/:id
 * @access  Private / Admin
 */
export const deleteHackathonEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await HackathonEvent.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon event not found',
      });
    }

    await recordAuditLog({
      req,
      category: 'problems',
      action: 'EVENT_DELETED',
      severity: 'critical',
      target: { type: 'event', id: event._id, label: event.title },
      summary: `Deleted hackathon event "${event.title}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Hackathon event deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Hackathon Event Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete hackathon event',
    });
  }
};

/**
 * @desc    Admin: Add problem statement to a hackathon
 * @route   POST /api/events/:id/problems
 * @access  Private / Admin
 */
export const addProblemStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { psId, title, category, difficulty, description, expectedOutcomes, starterKitUrl } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Problem statement title and description are required',
      });
    }

    const event = await HackathonEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon event not found',
      });
    }

    // Auto-generate PS ID if omitted
    const nextPsId =
      psId || `PS-${(event.problemStatements.length + 1).toString().padStart(2, '0')}`;

    const newProblem = {
      psId: nextPsId.toUpperCase(),
      title,
      category: category || 'AI/ML',
      difficulty: difficulty || 'Intermediate',
      description,
      expectedOutcomes: Array.isArray(expectedOutcomes)
        ? expectedOutcomes
        : typeof expectedOutcomes === 'string'
        ? expectedOutcomes.split('\n').filter(Boolean)
        : [],
      starterKitUrl: starterKitUrl || '',
    };

    event.problemStatements.push(newProblem);
    await event.save();

    const createdProblem = event.problemStatements[event.problemStatements.length - 1];

    await recordAuditLog({
      req,
      category: 'problems',
      action: 'PROBLEM_CREATED',
      severity: 'info',
      target: {
        type: 'problem',
        id: createdProblem._id,
        label: `${createdProblem.psId}: ${createdProblem.title}`,
      },
      summary: `Added problem statement ${createdProblem.psId} ("${createdProblem.title}") to "${event.title}"`,
      changes: {
        category: createdProblem.category,
        difficulty: createdProblem.difficulty,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Problem statement added successfully',
      problemStatement: createdProblem,
      event,
    });
  } catch (error) {
    console.error('[Add Problem Statement Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add problem statement',
    });
  }
};

/**
 * @desc    Admin: Update problem statement
 * @route   PUT /api/events/:id/problems/:problemId
 * @access  Private / Admin
 */
export const updateProblemStatement = async (req, res) => {
  try {
    const { id, problemId } = req.params;
    const event = await HackathonEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon event not found',
      });
    }

    const problem = event.problemStatements.id(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem statement not found in this hackathon',
      });
    }

    const { psId, title, category, difficulty, description, expectedOutcomes, starterKitUrl } =
      req.body;

    if (psId) problem.psId = psId.toUpperCase();
    if (title) problem.title = title;
    if (category) problem.category = category;
    if (difficulty) problem.difficulty = difficulty;
    if (description) problem.description = description;
    if (starterKitUrl !== undefined) problem.starterKitUrl = starterKitUrl;
    if (expectedOutcomes !== undefined) {
      problem.expectedOutcomes = Array.isArray(expectedOutcomes)
        ? expectedOutcomes
        : typeof expectedOutcomes === 'string'
        ? expectedOutcomes.split('\n').filter(Boolean)
        : [];
    }

    await event.save();

    await recordAuditLog({
      req,
      category: 'problems',
      action: 'PROBLEM_UPDATED',
      severity: 'info',
      target: {
        type: 'problem',
        id: problem._id,
        label: `${problem.psId}: ${problem.title}`,
      },
      summary: `Updated problem statement ${problem.psId} ("${problem.title}")`,
      changes: {
        category: problem.category,
        difficulty: problem.difficulty,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Problem statement updated successfully',
      problemStatement: problem,
      event,
    });
  } catch (error) {
    console.error('[Update Problem Statement Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update problem statement',
    });
  }
};

/**
 * @desc    Admin: Delete problem statement
 * @route   DELETE /api/events/:id/problems/:problemId
 * @access  Private / Admin
 */
export const deleteProblemStatement = async (req, res) => {
  try {
    const { id, problemId } = req.params;
    const event = await HackathonEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon event not found',
      });
    }

    const removedProblem = event.problemStatements.find(
      (ps) => ps._id.toString() === problemId
    );
    event.problemStatements = event.problemStatements.filter(
      (ps) => ps._id.toString() !== problemId
    );
    await event.save();

    await recordAuditLog({
      req,
      category: 'problems',
      action: 'PROBLEM_DELETED',
      severity: 'warning',
      target: {
        type: 'problem',
        id: problemId,
        label: removedProblem
          ? `${removedProblem.psId}: ${removedProblem.title}`
          : problemId,
      },
      summary: removedProblem
        ? `Deleted problem statement ${removedProblem.psId} ("${removedProblem.title}")`
        : `Deleted problem statement ${problemId}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Problem statement deleted successfully',
      event,
    });
  } catch (error) {
    console.error('[Delete Problem Statement Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete problem statement',
    });
  }
};

