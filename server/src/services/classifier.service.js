/**
 * Email Classifier Service
 *
 * Two-stage classification:
 * 1. Is this email about MY job application? (not just any job-related email)
 * 2. What status does it represent?
 *
 * Key distinction:
 *  ✅ "Thank you for applying to Coding Ninjas" → IS an application email
 *  ❌ "New jobs matching your profile on Naukri" → is NOT an application email
 *  ❌ "Your Unstop weekly digest" → NOT an application email
 */

// ── ATS platforms that send on behalf of companies ───────────────────────────
const ATS_DOMAINS = new Set([
  'darwinbox.in','darwinbox.com',
  'greenhouse.io','greenhouse.com',
  'lever.co',
  'workday.com','myworkday.com',
  'ashbyhq.com',
  'icims.com',
  'taleo.net','taleo.com',
  'jobvite.com',
  'smartrecruiters.com',
  'breezyhr.com',
  'recruitee.com',
  'bamboohr.com',
  'jazz.co','jazzhr.com',
  'successfactors.com',
  'keka.com',
  'zohorecruit.com',
  'freshteam.com',
  'imocha.io',
  'hackerearth.com',
  'hackerrank.com',
  'codility.com',
  'mettl.com',
  'mercer.com',
  'hirevue.com',
  'myamcat.com',
]);

// ── Job PORTAL domains — these send newsletters AND application emails ────────
// We need content inspection to distinguish which type
const JOB_PORTAL_DOMAINS = new Set([
  'naukri.com','naukri.com',
  'unstop.com',
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'foundit.in',
  'shine.com',
  'monster.com',
  'iimjobs.com',
  'hirist.com',
  'instahyre.com',
  'cutshort.io',
  'angellist.com','wellfound.com',
  'internshala.com',
  'placementindia.com',
  'freshersworld.com',
  'apna.co',
]);

const GENERIC_DOMAINS = new Set([
  'gmail.com','yahoo.com','outlook.com','hotmail.com',
  'protonmail.com','icloud.com','live.com','msn.com',
  'rediffmail.com','ymail.com',
]);

// ── Stage 1: Is this MY application? ─────────────────────────────────────────
// These patterns mean the EMAIL IS ABOUT THE USER'S OWN APPLICATION
const APPLICATION_CONFIRMATION_PATTERNS = [
  // Received / submitted
  /application\s+(has been\s+)?(successfully\s+)?(received|submitted|recorded)/i,
  /successfully\s+(received|submitted)\s+your\s+application/i,
  /we\s+(have\s+)?(received|got)\s+your\s+application/i,
  /your\s+application\s+(has been|was)\s+(received|submitted|recorded)/i,
  /application\s+(received|confirmation|acknowledgement)/i,
  /we\s+acknowledge\s+(the\s+)?receipt/i,
  // Thank you for applying / interest
  /thank\s+you\s+for\s+(your\s+)?(applying|applying to|interest in|submitting)/i,
  /thanks\s+for\s+(applying|your\s+application|your\s+interest)/i,
  /thank\s+you\s+for\s+your\s+interest\s+in\s+the/i,
  /interest\s+in\s+the\s+.{2,60}\s+position/i,
  /applied\s+for\s+the/i,
  /application\s+for\s+the\s+.{3,80}\s+(position|role|opening)/i,
  // Status updates on MY application
  /we\s+are\s+(currently\s+)?reviewing\s+your\s+(application|profile|resume)/i,
  /your\s+(application|profile|resume)\s+is\s+(under|being)\s+review/i,
  /will\s+be\s+in\s+touch\s+with\s+(shortlisted|selected)\s+candidates/i,
  /shortlisted\s+candidates/i,
  /move\s+(you|your\s+application)\s+forward/i,
  /proceed\s+to\s+(the\s+)?next\s+(round|step|stage)/i,
  /invite\s+you\s+(for|to)\s+(an?\s+)?interview/i,
  /schedule\s+(an?\s+|your\s+)?interview/i,
  /regret\s+to\s+(inform|let\s+you\s+know)/i,
  /not\s+(moving|proceeding)\s+forward\s+with\s+your\s+application/i,
  /offer\s+(letter|of\s+employment)/i,
  /pleased\s+to\s+offer\s+you/i,
  /congratulations.{0,60}(selected|offer|position|joining)/i,
  // Assessment sent to me
  /complete\s+(the\s+|a\s+|this\s+)?(assessment|test|challenge|assignment)/i,
  /assessment\s+link/i,
  /test\s+link/i,
  /coding\s+(assessment|challenge|test)\s+for/i,
  // Action needed on my application
  /kindly\s+(confirm|respond|fill|complete|submit)/i,
  /action\s+required.{0,60}application/i,
];

// ── Stage 1b: Patterns that DISQUALIFY an email (job portal noise) ────────────
const NOISE_PATTERNS = [
  /jobs?\s+(matching|based on)\s+your\s+profile/i,
  /\d+\s+new\s+jobs?\s+(for you|matching)/i,
  /recommended\s+jobs?\s+for\s+you/i,
  /top\s+jobs?\s+(for you|this week)/i,
  /weekly\s+(job\s+)?digest/i,
  /job\s+alert/i,
  /similar\s+jobs/i,
  /explore\s+more\s+jobs/i,
  /companies?\s+are\s+hiring/i,
  /get\s+hired\s+at/i,
  /apply\s+now/i,             // marketing CTAs
  /view\s+all\s+jobs/i,
  /newsletter/i,
  /unsubscribe/i,
  /\d+\s+companies?\s+visited\s+your\s+profile/i,
  /profile\s+views/i,
  /people\s+are\s+looking\s+at\s+your\s+profile/i,
  /update\s+your\s+profile/i,
  /complete\s+your\s+profile/i,
  /who\s+viewed\s+your\s+profile/i,
];

// ── Stage 2: Status classification ───────────────────────────────────────────
const STATUS_RULES = {
  Offer: {
    weight: 5,
    patterns: [
      /offer\s+(letter|of\s+employment|of\s+contract|extended)/i,
      /congratulations.{0,60}(offer|selected|joining)/i,
      /pleased\s+to\s+(offer|extend\s+an?\s+offer)/i,
      /formal\s+offer/i,
      /compensation\s+(package|details)/i,
      /date\s+of\s+joining|joining\s+date/i,
      /welcome\s+(aboard|to\s+the\s+team)/i,
      /onboarding/i,
    ],
  },
  Rejected: {
    weight: 4,
    patterns: [
      /regret\s+to\s+(inform|let\s+you\s+know|advise)/i,
      /unfortunately[^.]{0,80}(not\s+(be\s+)?moving|won't\s+be|not\s+selected|unable)/i,
      /not\s+(moving|proceeding|advancing)\s+forward/i,
      /will\s+not\s+be\s+(moving|proceeding)/i,
      /won't\s+be\s+(moving|proceeding)/i,
      /not\s+selected\s+(for|to)/i,
      /not\s+a\s+(good\s+)?(match|fit)/i,
      /position\s+has\s+been\s+filled/i,
      /application\s+(was\s+not|has\s+not\s+been)\s+(successful|shortlisted)/i,
      /not\s+shortlisted/i,
      /decided\s+to\s+move\s+forward\s+with\s+other\s+candidates/i,
    ],
  },
  Interview: {
    weight: 4,
    patterns: [
      /invite\s+you\s+(for|to)\s+(an?\s+)?interview/i,
      /schedule\s+(an?\s+|your\s+)?interview/i,
      /interview\s+(scheduled|invitation|round|call)/i,
      /technical\s+(round|interview|screen)/i,
      /hr\s+(round|interview|call)/i,
      /final\s+(round|interview)/i,
      /phone\s+(screen|interview)/i,
      /video\s+(call|interview)/i,
      /hiring\s+manager/i,
      /panel\s+interview/i,
    ],
  },
  'OA / Assessment': {
    weight: 3,
    patterns: [
      /coding\s+(assessment|challenge|test)/i,
      /online\s+assessment/i,
      /technical\s+(assessment|test|evaluation)/i,
      /hackerrank|hackerearth|codility|mettl|imocha|codesignal/i,
      /test\s+link|assessment\s+link/i,
      /take[\s-]?home\s+(assignment|test|project)/i,
      /complete\s+(the\s+|a\s+|this\s+)?(assessment|test|challenge)/i,
      /aptitude\s+test/i,
    ],
  },
  'Next Step': {
    weight: 3,
    patterns: [
      /next\s+(steps?|round|stage|phase)/i,
      /move\s+(you\s+)?forward/i,
      /shortlisted\s+(for|candidates)/i,
      /you\s+(have\s+been|are)\s+shortlisted/i,
      /proceed\s+to\s+(the\s+)?next/i,
      /advance\s+your\s+application/i,
      /pleased\s+to\s+(invite|inform)/i,
      /selected\s+(for|to\s+proceed)/i,
    ],
  },
  'Under Review': {
    weight: 2,
    patterns: [
      /currently\s+reviewing/i,
      /under\s+(active\s+)?review/i,
      /being\s+reviewed/i,
      /in\s+(the\s+)?review\s+process/i,
      /will\s+be\s+in\s+touch\s+with\s+shortlisted/i,
      /keep\s+your\s+(application|resume)\s+on\s+file/i,
    ],
  },
  'Follow-up Needed': {
    weight: 2,
    patterns: [
      /action\s+required/i,
      /please\s+(complete|submit|fill|respond|confirm|provide)/i,
      /complete\s+(the\s+|this\s+)?form/i,
      /submit\s+(your\s+)?documents/i,
      /awaiting\s+your\s+response/i,
      /kindly\s+(confirm|respond|submit)/i,
      /respond\s+by/i,
    ],
  },
  Applied: {
    weight: 1,
    patterns: [
      // catch-all — if it's a confirmed application email but no other status matched
      /application\s+(received|submitted|confirmation)/i,
      /thank\s+you\s+for\s+(applying|your\s+interest)/i,
      /successfully\s+(received|submitted)/i,
      /we\s+have\s+received\s+your\s+application/i,
    ],
  },
};

// ── Company extraction ────────────────────────────────────────────────────────
const COMPANY_IN_SUBJECT = [
  /\bat\s+([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)(?:\s*[-–|,.]|\s*$)/,
  /application\s+(?:received\s+)?for\s+.{1,60}\s+at\s+([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)(?:\s*[-–|,.]|\s*$)/i,
  /application\s+to\s+([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)(?:\s*[-–|,.]|\s*$)/i,
  /^([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)\s*[-–|]\s*(application|hiring|recruitment)/i,
];

const COMPANY_IN_BODY = [
  /(?:position|role|job)\s+at\s+([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)[\s.,]/,
  /joining\s+([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)[\s.,]/,
  /(?:hr\s+team|talent\s+team)[,\s]+(?:at\s+)?([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)[\s.,\n]/i,
  /regards[,\s\n]+[A-Za-z\s,.\n]{0,60}?\n([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)[\s\n.,]/,
  /team\s+at\s+([A-Z][A-Za-z0-9\s&.,'-]{1,40}?)[\s.,]/,
];

// ── Role extraction ───────────────────────────────────────────────────────────
const ROLE_PATTERNS = [
  /application\s+(?:received\s+)?for\s+(?:the\s+)?["']?([A-Za-z0-9\s\/\-+.#()]{2,60}?)["']?\s+(?:at|position|\()/i,
  /interest\s+in\s+the\s+["']?([A-Za-z0-9\s\/\-+.#()]{2,60}?)["']?\s+(?:position|role|opening)/i,
  /applying\s+for\s+(?:the\s+)?["']?([A-Za-z0-9\s\/\-+.#()]{2,60}?)["']?\s+(?:position|role|at)/i,
  /\b(SDE[\s-]?\d?|SSE|MTS|SWE[\s-]?\d?|software\s+engineer|frontend\s+developer|backend\s+developer|full[\s-]?stack\s+developer|data\s+scientist|data\s+analyst|product\s+manager|ml\s+engineer|devops\s+engineer)\b/i,
];

// ── Main classifier ───────────────────────────────────────────────────────────
const classifyEmail = (emailData) => {
  const { subject = '', snippet = '', body = '', from = '' } = emailData;
  const fullText = `${subject} ${snippet} ${body}`;

  const senderDomain = extractDomain(from);
  const isATS = ATS_DOMAINS.has(senderDomain);
  const isPortal = JOB_PORTAL_DOMAINS.has(senderDomain);

  // ── Step 1: Disqualify noise emails from job portals ─────────────────────
  if (isPortal) {
    const noiseScore = NOISE_PATTERNS.filter((p) => p.test(fullText)).length;
    const appScore = APPLICATION_CONFIRMATION_PATTERNS.filter((p) => p.test(fullText)).length;
    // If more noise signals than application signals → not a personal application email
    if (noiseScore > 0 && appScore === 0) {
      return notJobRelated();
    }
    if (noiseScore >= 2 && appScore <= 1) {
      return notJobRelated();
    }
  }

  // ── Step 2: Is this a personal application email? ────────────────────────
  const appSignals = APPLICATION_CONFIRMATION_PATTERNS.filter((p) => p.test(fullText)).length;
  const isApplicationEmail = isATS || appSignals >= 1;

  if (!isApplicationEmail) return notJobRelated();

  // ── Step 3: Classify status ───────────────────────────────────────────────
  const scores = {};
  const matchedKeywords = [];

  for (const [status, rule] of Object.entries(STATUS_RULES)) {
    let score = 0;
    for (const pattern of rule.patterns) {
      const match = pattern.exec(fullText);
      if (match) {
        score += rule.weight;
        matchedKeywords.push(match[0].trim().slice(0, 40));
      }
    }
    if (score > 0) scores[status] = score;
  }

  let detectedCategory = 'Applied';
  let maxScore = 0;
  for (const [status, score] of Object.entries(scores)) {
    if (score > maxScore) { maxScore = score; detectedCategory = status; }
  }

  // ── Step 4: Extract company & role ───────────────────────────────────────
  const extractedCompany = extractCompany(subject, body, from, senderDomain, isATS || isPortal);
  const extractedRole = extractRole(subject, body);
  const extractedActionItems = extractActionItems(fullText);

  return {
    detectedCategory,
    confidenceScore: parseFloat(Math.min(maxScore / 6, 1).toFixed(2)),
    matchedKeywords: [...new Set(matchedKeywords)].slice(0, 8),
    extractedCompany,
    extractedRole,
    extractedStatus: detectedCategory,
    extractedActionItems,
    isJobRelated: true,
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const notJobRelated = () => ({
  detectedCategory: 'Unknown', confidenceScore: 0,
  matchedKeywords: [], extractedCompany: '', extractedRole: '',
  extractedStatus: '', extractedActionItems: [], isJobRelated: false,
});

const extractDomain = (from) => {
  const m = from.match(/@([a-zA-Z0-9.-]+)/);
  return m ? m[1].toLowerCase() : '';
};

const INVALID_COMPANY_WORDS = new Set([
  'the','your','our','this','that','with','from','dear','team','hr team',
  'talent','regards','sincerely','noreply','no-reply','info','careers',
  'jobs','hiring','application','position','role','sir','madam','hi','hello',
]);

const isValidCompany = (name) => {
  if (!name || name.length < 2 || name.length > 50) return false;
  return !INVALID_COMPANY_WORDS.has(name.toLowerCase().trim());
};

const extractCompany = (subject, body, from, senderDomain, isThirdParty) => {
  // From display name (e.g. "Coding Ninjas <noreply@darwinbox.in>")
  const displayMatch = from.match(/^([^<@\n]+?)\s*</);
  if (displayMatch) {
    const name = displayMatch[1].trim().replace(/['"]/g, '');
    if (isValidCompany(name) &&
        !name.toLowerCase().includes('noreply') &&
        !name.toLowerCase().includes('no-reply') &&
        !name.toLowerCase().includes('notification') &&
        !name.toLowerCase().includes('team')) {
      return name;
    }
  }

  // Subject patterns
  for (const p of COMPANY_IN_SUBJECT) {
    const m = p.exec(subject);
    const candidate = m && (m[1] || m[2] || '');
    if (candidate && isValidCompany(candidate.trim())) return candidate.trim();
  }

  // Body patterns
  for (const p of COMPANY_IN_BODY) {
    const m = p.exec(body);
    const candidate = m && (m[1] || m[2] || '');
    if (candidate && isValidCompany(candidate.trim())) return candidate.trim();
  }

  // Fall back to sender domain if it's a real company (not ATS/portal/generic)
  if (!isThirdParty && !GENERIC_DOMAINS.has(senderDomain) && senderDomain) {
    const parts = senderDomain.split('.');
    const name = parts[parts.length - 2] || parts[0];
    if (name && name.length > 1) return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return '';
};

const extractRole = (subject, body) => {
  for (const p of ROLE_PATTERNS) {
    const m = p.exec(`${subject} ${body}`);
    const role = m && (m[1] || m[0] || '').trim().replace(/\s+/g, ' ').replace(/[()]/g, '');
    if (role && role.length >= 2 && role.length <= 80) return role;
  }
  return '';
};

const extractActionItems = (text) => {
  const patterns = [
    /please\s+(complete|submit|fill|respond|confirm|schedule)[^.]{0,100}/gi,
    /kindly\s+(complete|submit|fill|respond|confirm)[^.]{0,100}/gi,
    /action\s+required[^.]{0,100}/gi,
  ];
  const actions = [];
  for (const p of patterns) {
    for (const m of text.matchAll(p)) actions.push(m[0].trim());
  }
  return [...new Set(actions)].slice(0, 5);
};

module.exports = { classifyEmail };