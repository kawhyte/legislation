// src/data/demoBillsData.ts
import type { Bill, MomentumAnalysis } from '@/types';

// Static demo bill data with evergreen legislative issues
export const demoBillsData: Bill[] = [
  {
    id: 'demo-bill-1',
    identifier: 'SB 2024-001',
    title: 'Small Business Tax Relief and Innovation Incentive Act',
    introduced: '2024-01-15',
    status: 'In Committee',
    summary: 'Provides tax credits for small businesses investing in clean technology and creates innovation zones.',
    sources: [
      {
        note: 'Legislative Text',
        url: 'https://example.gov/bills/sb2024001'
      }
    ],
    jurisdiction: {
      id: 'ca',
      name: 'California',
      classification: 'state'
    },
    latest_action: 'Referred to Committee on Finance',
    latest_action_description: 'Bill referred to Finance Committee for review',
    latest_action_date: '2024-01-22',
    first_action_date: '2024-01-15',
    last_action_date: '2024-01-22',
    subject: ['Business', 'Taxation', 'Environment'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 65,
      reasons: ['Committee hearing scheduled', 'Bipartisan support indicated']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-2',
    identifier: 'HB 2024-045',
    title: 'Affordable Housing Development and Community Investment Act',
    introduced: '2024-02-01',
    status: 'Passed Committee',
    summary: 'Establishes funding mechanisms for affordable housing projects and community development.',
    sources: [
      {
        note: 'Bill Summary',
        url: 'https://example.gov/bills/hb2024045'
      }
    ],
    jurisdiction: {
      id: 'tx',
      name: 'Texas',
      classification: 'state'
    },
    latest_action: 'Passed House Committee on Housing',
    latest_action_description: 'Committee approved bill with amendments',
    latest_action_date: '2024-02-14',
    first_action_date: '2024-02-01',
    last_action_date: '2024-02-14',
    subject: ['Housing', 'Economic Development', 'Community Development'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'High',
      score: 78,
      reasons: ['Committee approval', 'Strong advocacy support', 'Media attention']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-3',
    identifier: 'AB 2024-112',
    title: 'Digital Privacy Protection for Students Act',
    introduced: '2024-01-28',
    status: 'In Committee',
    summary: 'Enhances privacy protections for student data in educational technology platforms.',
    sources: [
      {
        note: 'Full Text',
        url: 'https://example.gov/bills/ab2024112'
      }
    ],
    jurisdiction: {
      id: 'ny',
      name: 'New York',
      classification: 'state'
    },
    latest_action: 'Committee hearing scheduled',
    latest_action_description: 'Education Committee to review digital privacy provisions',
    latest_action_date: '2024-02-05',
    first_action_date: '2024-01-28',
    last_action_date: '2024-02-05',
    subject: ['Education', 'Privacy', 'Technology'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 58,
      reasons: ['Committee interest', 'Parent advocacy groups support']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-4',
    identifier: 'SB 2024-078',
    title: 'Healthcare Worker Retention and Support Act',
    introduced: '2024-01-10',
    status: 'Passed Senate',
    summary: 'Provides loan forgiveness and retention bonuses for healthcare workers in underserved areas.',
    sources: [
      {
        note: 'Senate Version',
        url: 'https://example.gov/bills/sb2024078'
      }
    ],
    jurisdiction: {
      id: 'fl',
      name: 'Florida',
      classification: 'state'
    },
    latest_action: 'Passed Senate 28-12',
    latest_action_description: 'Senate approved with bipartisan support',
    latest_action_date: '2024-02-08',
    first_action_date: '2024-01-10',
    last_action_date: '2024-02-08',
    subject: ['Healthcare', 'Workforce', 'Education'],
    house_passage_date: '',
    senate_passage_date: '2024-02-08',
    enacted_date: '',
    momentum: {
      level: 'High',
      score: 85,
      reasons: ['Senate passage', 'Healthcare industry support', 'Urgent need addressed']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-5',
    identifier: 'HB 2024-203',
    title: 'Clean Energy Workforce Development Initiative',
    introduced: '2024-02-12',
    status: 'Introduced',
    summary: 'Creates training programs and apprenticeships for renewable energy sector jobs.',
    sources: [
      {
        note: 'Bill Text',
        url: 'https://example.gov/bills/hb2024203'
      }
    ],
    jurisdiction: {
      id: 'co',
      name: 'Colorado',
      classification: 'state'
    },
    latest_action: 'Bill introduced',
    latest_action_description: 'Introduced in House, awaiting committee assignment',
    latest_action_date: '2024-02-12',
    first_action_date: '2024-02-12',
    last_action_date: '2024-02-12',
    subject: ['Environment', 'Workforce', 'Energy'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Low',
      score: 35,
      reasons: ['Recently introduced', 'Committee assignment pending']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-6',
    identifier: 'SB 2024-156',
    title: 'Mental Health Support in Schools Enhancement Act',
    introduced: '2024-01-25',
    status: 'In Committee',
    summary: 'Expands mental health resources and counseling services in public schools.',
    sources: [
      {
        note: 'Committee Report',
        url: 'https://example.gov/bills/sb2024156'
      }
    ],
    jurisdiction: {
      id: 'wa',
      name: 'Washington',
      classification: 'state'
    },
    latest_action: 'Committee amendments proposed',
    latest_action_description: 'Education Committee proposed funding amendments',
    latest_action_date: '2024-02-10',
    first_action_date: '2024-01-25',
    last_action_date: '2024-02-10',
    subject: ['Education', 'Mental Health', 'Children'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 72,
      reasons: ['Committee engagement', 'Parent and teacher support', 'Amendment discussions']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-7',
    identifier: 'AB 2024-087',
    title: 'Infrastructure Investment and Rural Broadband Expansion Act',
    introduced: '2024-01-18',
    status: 'Passed Assembly',
    summary: 'Allocates funding for rural broadband infrastructure and transportation improvements.',
    sources: [
      {
        note: 'Assembly Version',
        url: 'https://example.gov/bills/ab2024087'
      }
    ],
    jurisdiction: {
      id: 'nc',
      name: 'North Carolina',
      classification: 'state'
    },
    latest_action: 'Passed Assembly 75-45',
    latest_action_description: 'Assembly approved with rural district support',
    latest_action_date: '2024-02-06',
    first_action_date: '2024-01-18',
    last_action_date: '2024-02-06',
    subject: ['Infrastructure', 'Technology', 'Rural Development'],
    house_passage_date: '2024-02-06',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'High',
      score: 82,
      reasons: ['Assembly passage', 'Rural coalition support', 'Federal matching funds available']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-8',
    identifier: 'HB 2024-134',
    title: 'Senior Citizens Property Tax Relief Act',
    introduced: '2024-02-03',
    status: 'In Committee',
    summary: 'Provides property tax exemptions and deferrals for senior citizens on fixed incomes.',
    sources: [
      {
        note: 'Fiscal Analysis',
        url: 'https://example.gov/bills/hb2024134'
      }
    ],
    jurisdiction: {
      id: 'az',
      name: 'Arizona',
      classification: 'state'
    },
    latest_action: 'Revenue Committee review',
    latest_action_description: 'Committee reviewing fiscal impact analysis',
    latest_action_date: '2024-02-11',
    first_action_date: '2024-02-03',
    last_action_date: '2024-02-11',
    subject: ['Taxation', 'Senior Citizens', 'Housing'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 61,
      reasons: ['AARP endorsement', 'Committee fiscal review underway']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-9',
    identifier: 'SB 2024-092',
    title: 'Criminal Justice Reform and Community Safety Act',
    introduced: '2024-01-31',
    status: 'In Committee',
    summary: 'Reforms sentencing guidelines and expands community-based rehabilitation programs.',
    sources: [
      {
        note: 'Bill Analysis',
        url: 'https://example.gov/bills/sb2024092'
      }
    ],
    jurisdiction: {
      id: 'il',
      name: 'Illinois',
      classification: 'state'
    },
    latest_action: 'Public safety committee hearing',
    latest_action_description: 'Committee heard testimony from law enforcement and advocates',
    latest_action_date: '2024-02-09',
    first_action_date: '2024-01-31',
    last_action_date: '2024-02-09',
    subject: ['Criminal Justice', 'Public Safety', 'Rehabilitation'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 55,
      reasons: ['Committee hearings ongoing', 'Mixed stakeholder feedback']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-10',
    identifier: 'HB 2024-178',
    title: 'Agricultural Innovation and Sustainability Grant Program',
    introduced: '2024-02-07',
    status: 'Introduced',
    summary: 'Creates grant programs for sustainable farming practices and agricultural technology adoption.',
    sources: [
      {
        note: 'Original Text',
        url: 'https://example.gov/bills/hb2024178'
      }
    ],
    jurisdiction: {
      id: 'ia',
      name: 'Iowa',
      classification: 'state'
    },
    latest_action: 'Referred to Agriculture Committee',
    latest_action_description: 'Bill assigned to Agriculture and Natural Resources Committee',
    latest_action_date: '2024-02-07',
    first_action_date: '2024-02-07',
    last_action_date: '2024-02-07',
    subject: ['Agriculture', 'Environment', 'Economic Development'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Low',
      score: 42,
      reasons: ['Recently introduced', 'Farm bureau interest expressed']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-11',
    identifier: 'AB 2024-221',
    title: 'Veterans Employment and Training Enhancement Act',
    introduced: '2024-02-14',
    status: 'Introduced',
    summary: 'Expands job training programs and hiring incentives for military veterans.',
    sources: [
      {
        note: 'Legislative Summary',
        url: 'https://example.gov/bills/ab2024221'
      }
    ],
    jurisdiction: {
      id: 'ga',
      name: 'Georgia',
      classification: 'state'
    },
    latest_action: 'Bill introduced',
    latest_action_description: 'Introduced with bipartisan co-sponsors',
    latest_action_date: '2024-02-14',
    first_action_date: '2024-02-14',
    last_action_date: '2024-02-14',
    subject: ['Veterans', 'Employment', 'Training'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 68,
      reasons: ['Bipartisan introduction', 'Veterans groups support', 'Election year priority']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-12',
    identifier: 'SB 2024-067',
    title: 'Childcare Accessibility and Affordability Act',
    introduced: '2024-01-20',
    status: 'Passed Committee',
    summary: 'Increases funding for childcare subsidies and establishes quality standards for providers.',
    sources: [
      {
        note: 'Committee Report',
        url: 'https://example.gov/bills/sb2024067'
      }
    ],
    jurisdiction: {
      id: 'mn',
      name: 'Minnesota',
      classification: 'state'
    },
    latest_action: 'Passed Health and Human Services Committee',
    latest_action_description: 'Committee approved with amendments to funding formula',
    latest_action_date: '2024-02-12',
    first_action_date: '2024-01-20',
    last_action_date: '2024-02-12',
    subject: ['Children', 'Family', 'Education'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'High',
      score: 76,
      reasons: ['Committee passage', 'Working parent advocacy', 'Governor support indicated']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-13',
    identifier: 'HB 2024-089',
    title: 'Cybersecurity Protection for Critical Infrastructure Act',
    introduced: '2024-01-30',
    status: 'In Committee',
    summary: 'Establishes cybersecurity standards and incident reporting requirements for critical infrastructure.',
    sources: [
      {
        note: 'Technical Analysis',
        url: 'https://example.gov/bills/hb2024089'
      }
    ],
    jurisdiction: {
      id: 'va',
      name: 'Virginia',
      classification: 'state'
    },
    latest_action: 'Technology committee review',
    latest_action_description: 'Committee consulting with cybersecurity experts',
    latest_action_date: '2024-02-08',
    first_action_date: '2024-01-30',
    last_action_date: '2024-02-08',
    subject: ['Technology', 'Security', 'Infrastructure'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 63,
      reasons: ['Expert committee consultation', 'Industry stakeholder engagement']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-14',
    identifier: 'SB 2024-143',
    title: 'Renewable Energy Storage Development Incentive Act',
    introduced: '2024-02-01',
    status: 'In Committee',
    summary: 'Provides tax incentives for battery storage systems and grid stabilization technology.',
    sources: [
      {
        note: 'Environmental Impact Study',
        url: 'https://example.gov/bills/sb2024143'
      }
    ],
    jurisdiction: {
      id: 'nv',
      name: 'Nevada',
      classification: 'state'
    },
    latest_action: 'Energy committee hearing scheduled',
    latest_action_description: 'Committee to hear from utility companies and environmental groups',
    latest_action_date: '2024-02-13',
    first_action_date: '2024-02-01',
    last_action_date: '2024-02-13',
    subject: ['Energy', 'Environment', 'Technology'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 59,
      reasons: ['Committee hearing scheduled', 'Utility industry interest']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-15',
    identifier: 'AB 2024-156',
    title: 'Prescription Drug Cost Transparency and Regulation Act',
    introduced: '2024-01-26',
    status: 'Passed Assembly',
    summary: 'Requires pharmaceutical companies to justify price increases and report manufacturing costs.',
    sources: [
      {
        note: 'Assembly Floor Report',
        url: 'https://example.gov/bills/ab2024156'
      }
    ],
    jurisdiction: {
      id: 'or',
      name: 'Oregon',
      classification: 'state'
    },
    latest_action: 'Passed Assembly 35-25',
    latest_action_description: 'Assembly approved despite pharmaceutical industry opposition',
    latest_action_date: '2024-02-11',
    first_action_date: '2024-01-26',
    last_action_date: '2024-02-11',
    subject: ['Healthcare', 'Consumer Protection', 'Regulation'],
    house_passage_date: '2024-02-11',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'High',
      score: 81,
      reasons: ['Assembly passage', 'Strong public support', 'Consumer advocacy backing']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-16',
    identifier: 'HB 2024-201',
    title: 'Public Transportation Modernization and Accessibility Act',
    introduced: '2024-02-09',
    status: 'Introduced',
    summary: 'Funds public transit improvements with focus on accessibility and electric vehicle adoption.',
    sources: [
      {
        note: 'Transit Analysis',
        url: 'https://example.gov/bills/hb2024201'
      }
    ],
    jurisdiction: {
      id: 'ma',
      name: 'Massachusetts',
      classification: 'state'
    },
    latest_action: 'Referred to Transportation Committee',
    latest_action_description: 'Bill assigned to Joint Committee on Transportation',
    latest_action_date: '2024-02-09',
    first_action_date: '2024-02-09',
    last_action_date: '2024-02-09',
    subject: ['Transportation', 'Accessibility', 'Environment'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Low',
      score: 48,
      reasons: ['Recently introduced', 'Transit advocacy group support expected']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-17',
    identifier: 'SB 2024-088',
    title: 'Food Security and Local Agriculture Support Act',
    introduced: '2024-01-29',
    status: 'In Committee',
    summary: 'Supports local food systems through grants and establishes emergency food security reserves.',
    sources: [
      {
        note: 'Agriculture Committee Analysis',
        url: 'https://example.gov/bills/sb2024088'
      }
    ],
    jurisdiction: {
      id: 'vt',
      name: 'Vermont',
      classification: 'state'
    },
    latest_action: 'Committee markup session',
    latest_action_description: 'Agriculture Committee working on amendments to funding provisions',
    latest_action_date: '2024-02-10',
    first_action_date: '2024-01-29',
    last_action_date: '2024-02-10',
    subject: ['Agriculture', 'Food Security', 'Economic Development'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 66,
      reasons: ['Committee markup progress', 'Local farm support', 'Food bank endorsement']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-18',
    identifier: 'HB 2024-167',
    title: 'Digital Literacy and Computer Science Education Act',
    introduced: '2024-02-05',
    status: 'In Committee',
    summary: 'Mandates computer science curriculum and provides teacher training in digital literacy.',
    sources: [
      {
        note: 'Education Committee Report',
        url: 'https://example.gov/bills/hb2024167'
      }
    ],
    jurisdiction: {
      id: 'ut',
      name: 'Utah',
      classification: 'state'
    },
    latest_action: 'Education committee hearing',
    latest_action_description: 'Committee heard testimony from educators and tech industry',
    latest_action_date: '2024-02-12',
    first_action_date: '2024-02-05',
    last_action_date: '2024-02-12',
    subject: ['Education', 'Technology', 'Workforce'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 71,
      reasons: ['Tech industry support', 'Teacher union engagement', 'Committee hearing progress']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-19',
    identifier: 'AB 2024-234',
    title: 'Emergency Preparedness and Community Resilience Act',
    introduced: '2024-02-13',
    status: 'Introduced',
    summary: 'Establishes community emergency response teams and disaster preparedness funding.',
    sources: [
      {
        note: 'Emergency Management Analysis',
        url: 'https://example.gov/bills/ab2024234'
      }
    ],
    jurisdiction: {
      id: 'mt',
      name: 'Montana',
      classification: 'state'
    },
    latest_action: 'Bill introduced',
    latest_action_description: 'Introduced following recent wildfire season concerns',
    latest_action_date: '2024-02-13',
    first_action_date: '2024-02-13',
    last_action_date: '2024-02-13',
    subject: ['Emergency Management', 'Public Safety', 'Community Development'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Low',
      score: 52,
      reasons: ['Recent introduction', 'Seasonal relevance', 'Local government interest']
    } as MomentumAnalysis
  },
  {
    id: 'demo-bill-20',
    identifier: 'SB 2024-175',
    title: 'Water Conservation and Infrastructure Modernization Act',
    introduced: '2024-02-08',
    status: 'In Committee',
    summary: 'Invests in water-efficient infrastructure and establishes conservation incentive programs.',
    sources: [
      {
        note: 'Water Resources Study',
        url: 'https://example.gov/bills/sb2024175'
      }
    ],
    jurisdiction: {
      id: 'nm',
      name: 'New Mexico',
      classification: 'state'
    },
    latest_action: 'Natural Resources Committee review',
    latest_action_description: 'Committee reviewing drought impact assessments',
    latest_action_date: '2024-02-14',
    first_action_date: '2024-02-08',
    last_action_date: '2024-02-14',
    subject: ['Environment', 'Infrastructure', 'Water Resources'],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    momentum: {
      level: 'Medium',
      score: 64,
      reasons: ['Drought concerns driving urgency', 'Environmental group support', 'Committee engagement']
    } as MomentumAnalysis
  }
];

// Pre-written AI explanations for demo bills
export const demoExplanations: Record<string, { summary: string; impacts: string[] }> = {
  'demo-bill-1': {
    summary: "This bill aims to help small businesses by offering tax credits when they invest in clean technology like solar panels or energy-efficient equipment. It also creates special 'innovation zones' where businesses can get additional support for developing new technologies. Think of it as the government saying 'we'll help reduce your tax bill if you invest in environmentally friendly business upgrades.'",
    impacts: [
      "Small businesses could save thousands in taxes when upgrading to solar panels or efficient equipment",
      "New innovation zones might attract tech startups and create jobs in your community",
      "Local environment could improve through increased adoption of clean technology",
      "May lead to higher energy independence for small businesses and lower long-term operating costs"
    ]
  },
  'demo-bill-2': {
    summary: "This legislation tackles the housing crisis by creating new ways to fund affordable housing projects and invest in communities. It's like creating a dedicated piggy bank that local governments and developers can access to build homes that working families can actually afford, while also improving neighborhoods with better infrastructure and services.",
    impacts: [
      "More affordable rental and starter homes could become available in your area",
      "Property values might stabilize as housing supply increases to meet demand",
      "Local construction jobs could increase due to new housing development projects",
      "Community amenities like parks and transportation might improve through development investment"
    ]
  },
  'demo-bill-3': {
    summary: "This bill focuses on protecting student privacy in the digital age. With so many educational apps and online platforms collecting data about what kids learn and how they behave online, this law would set clear rules about what information schools and tech companies can collect, store, and share about students. It's like creating a digital privacy shield for your child's education.",
    impacts: [
      "Your child's learning data would be better protected from being sold to third parties",
      "Schools would need your explicit permission before using new educational technology platforms",
      "Students could have more control over their digital footprint from an early age",
      "Educational technology companies might need to redesign their data collection practices"
    ]
  },
  'demo-bill-4': {
    summary: "This bill addresses the healthcare worker shortage by offering financial incentives to medical professionals who work in areas that desperately need them. It provides loan forgiveness for medical school debt and retention bonuses for nurses, doctors, and other healthcare workers who commit to serving in underserved communities like rural areas or low-income neighborhoods.",
    impacts: [
      "Your local hospital or clinic might be able to attract and keep more qualified medical staff",
      "Wait times for medical appointments could decrease as more healthcare workers stay in the profession",
      "Healthcare workers in your community might receive financial relief from student loans",
      "Medical care quality could improve in rural and underserved areas through better staffing"
    ]
  },
  'demo-bill-5': {
    summary: "This legislation creates training programs and apprenticeships specifically for jobs in the renewable energy sector. Think of it as a career bridge program that helps people transition into growing fields like solar panel installation, wind turbine maintenance, and electric vehicle charging station setup. It's designed to prepare workers for the jobs of tomorrow while supporting the green energy transition.",
    impacts: [
      "New career opportunities could open up in the growing clean energy sector",
      "Workers in declining industries might find pathways to retrain for stable, well-paying jobs",
      "Your state could become more competitive in attracting renewable energy companies and investments",
      "Local technical colleges might offer new programs in solar, wind, and battery technology"
    ]
  },
  'demo-bill-6': {
    summary: "This bill significantly expands mental health support in public schools by adding more counselors, social workers, and mental health programs. It recognizes that students are facing unprecedented levels of stress, anxiety, and depression, and ensures that schools have the resources to provide help when kids need it most. It's like having a mental health safety net built right into the school system.",
    impacts: [
      "Your child's school could have more counselors and mental health professionals available",
      "Students might receive earlier intervention for anxiety, depression, and other mental health challenges",
      "Teachers could get training to better recognize and respond to student mental health needs",
      "School environments might become more supportive and less stressful for struggling students"
    ]
  },
  'demo-bill-7': {
    summary: "This comprehensive infrastructure bill focuses on two critical areas: bringing high-speed internet to rural communities and improving roads, bridges, and transportation systems. It's recognition that in today's economy, internet access is as essential as electricity, and that good infrastructure is the foundation for economic growth and quality of life.",
    impacts: [
      "Rural communities could finally get reliable high-speed internet for remote work and online education",
      "Local roads and bridges might be repaired or upgraded, improving daily commutes and safety",
      "Small businesses in rural areas could expand their reach through better internet connectivity",
      "Your region might attract new businesses and residents due to improved infrastructure"
    ]
  },
  'demo-bill-8': {
    summary: "This bill provides property tax relief specifically for senior citizens living on fixed incomes. It allows eligible seniors to either get exemptions from property taxes or defer them until later, recognizing that many older adults are being priced out of their longtime homes due to rising property values and taxes while living on fixed retirement incomes.",
    impacts: [
      "Senior citizens in your community might be able to afford staying in their homes longer",
      "Elderly homeowners could see significant reductions in their annual property tax bills",
      "Local property tax revenue might decrease, potentially affecting school and municipal budgets",
      "Housing turnover could slow as more seniors remain in their homes rather than downsizing"
    ]
  },
  'demo-bill-9': {
    summary: "This criminal justice reform bill takes a two-pronged approach: it revises sentencing guidelines to be more fair and consistent, while also expanding programs that help people reintegrate into society instead of just serving time in prison. The goal is to reduce recidivism by addressing the root causes of crime through education, job training, and community support.",
    impacts: [
      "Some non-violent offenders might receive shorter sentences or alternative punishments focused on rehabilitation",
      "Your community could see new programs that help former inmates find jobs and housing",
      "Crime rates might decrease over time as more people successfully reintegrate after serving time",
      "Tax savings could result from fewer people in expensive prison facilities"
    ]
  },
  'demo-bill-10': {
    summary: "This agricultural bill creates grant programs to help farmers adopt sustainable practices and new technologies. It's like providing financial assistance for farmers to transition to methods that are better for the environment while maintaining profitable operations. The grants could fund things like precision agriculture equipment, soil conservation practices, or renewable energy systems for farms.",
    impacts: [
      "Local farmers could get financial help transitioning to more sustainable and profitable farming methods",
      "Food prices might stabilize as farmers become more efficient and reduce crop losses",
      "Environmental quality in agricultural areas could improve through reduced chemical runoff and better soil management",
      "Your region might attract agricultural technology companies and research investments"
    ]
  },
  'demo-bill-11': {
    summary: "This legislation expands job training and creates hiring incentives specifically for military veterans transitioning to civilian careers. It recognizes that veterans have valuable skills but often need help translating their military experience into civilian job qualifications. The bill also provides tax benefits to companies that hire veterans.",
    impacts: [
      "Veterans in your community could have better access to job training and placement services",
      "Local businesses might receive tax incentives for hiring qualified veteran employees",
      "The veteran unemployment rate in your area could decrease through targeted support programs",
      "Your community could benefit from the discipline, leadership, and technical skills that veterans bring to the workforce"
    ]
  },
  'demo-bill-12': {
    summary: "This childcare bill addresses the crisis many working parents face by increasing funding for childcare subsidies and establishing quality standards for providers. It's designed to make childcare more affordable for families while ensuring that children receive quality care and early education. The bill recognizes that accessible childcare is essential for parents to participate in the workforce.",
    impacts: [
      "Working families could pay less for quality childcare through expanded subsidies",
      "More parents, especially mothers, might be able to enter or stay in the workforce",
      "Childcare providers could receive support to improve their facilities and training",
      "Children could benefit from higher quality early childhood education and care standards"
    ]
  },
  'demo-bill-13': {
    summary: "This cybersecurity bill establishes mandatory security standards and incident reporting for critical infrastructure like power grids, water systems, and transportation networks. It's like creating a digital immune system for the essential services we all depend on, requiring companies to have strong defenses and to quickly report when they've been attacked so authorities can respond.",
    impacts: [
      "Essential services like electricity and water could be better protected from cyber attacks",
      "Your personal information held by utilities and infrastructure companies might be more secure",
      "Government agencies could respond faster to cyber threats affecting critical systems",
      "Businesses might need to invest more in cybersecurity, potentially creating new job opportunities in the tech sector"
    ]
  },
  'demo-bill-14': {
    summary: "This renewable energy bill provides tax incentives for battery storage systems and grid stabilization technology. It's recognition that renewable energy like solar and wind need storage solutions to be reliable, and that the electrical grid needs upgrades to handle these new energy sources. The incentives encourage private investment in these critical technologies.",
    impacts: [
      "Your electric utility could become more reliable by storing renewable energy for use when the sun isn't shining or wind isn't blowing",
      "Energy costs might decrease over time as storage makes renewable energy more practical and cost-effective",
      "New jobs could be created in battery manufacturing, installation, and maintenance",
      "Your state could become a leader in clean energy technology, attracting investment and innovation"
    ]
  },
  'demo-bill-15': {
    summary: "This prescription drug bill requires pharmaceutical companies to justify price increases and report their manufacturing costs. It's designed to bring transparency to drug pricing and help regulators understand why medications cost what they do. The goal is to put public pressure on companies to keep prices reasonable and help consumers understand what they're paying for.",
    impacts: [
      "Prescription drug prices might increase more slowly due to public scrutiny of pricing decisions",
      "You could have access to more information about why your medications cost what they do",
      "Insurance companies and government health programs might have better data to negotiate drug prices",
      "Pharmaceutical companies might face more pressure to justify extremely high prices for life-saving medications"
    ]
  },
  'demo-bill-16': {
    summary: "This public transportation bill funds improvements to buses, trains, and other transit systems with a special focus on making them accessible to people with disabilities and transitioning to electric vehicles. It's about modernizing public transportation to be cleaner, more reliable, and usable by everyone while reducing traffic congestion and air pollution.",
    impacts: [
      "Public transit in your area could become more reliable, cleaner, and accessible to people with disabilities",
      "Air quality might improve as buses and trains switch from diesel to electric power",
      "Traffic congestion could decrease as improved public transit gives people alternatives to driving",
      "Property values near transit lines might increase due to improved transportation access"
    ]
  },
  'demo-bill-17': {
    summary: "This food security bill supports local food systems through grants to farmers and food distributors while establishing emergency food reserves. It's designed to make communities more self-sufficient in food production and better prepared for disruptions like natural disasters or supply chain problems. The bill promotes farm-to-table systems and local food networks.",
    impacts: [
      "Your community could have better access to fresh, locally-grown food through farmer's markets and local stores",
      "Food prices might be more stable during supply chain disruptions due to local production and emergency reserves",
      "Local farmers could receive grants to expand production and direct-to-consumer sales",
      "Food security for vulnerable populations could improve through strengthened local food networks and emergency planning"
    ]
  },
  'demo-bill-18': {
    summary: "This digital literacy bill makes computer science curriculum mandatory in schools and provides training for teachers to effectively teach technology skills. It recognizes that digital literacy is now as fundamental as reading and writing, and ensures that all students graduate with the technical skills needed for modern jobs.",
    impacts: [
      "Your child could graduate with strong coding, digital problem-solving, and technology skills",
      "Teachers could receive training in modern technology, improving overall classroom instruction",
      "Students might be better prepared for college and careers in an increasingly digital economy",
      "Your local job market could become more competitive as graduates have stronger technical skills"
    ]
  },
  'demo-bill-19': {
    summary: "This emergency preparedness bill establishes community emergency response teams and provides funding for disaster preparedness. It's about building local capacity to respond to emergencies like wildfires, floods, or severe storms by training community volunteers and ensuring that neighborhoods have the resources they need when disaster strikes.",
    impacts: [
      "Your community could be better prepared for natural disasters with trained local response teams",
      "Emergency shelters and supply caches might be established in your area for faster disaster response",
      "Residents could receive training in basic emergency response, CPR, and disaster preparedness",
      "Recovery time after disasters might be shorter due to better community organization and preparedness"
    ]
  },
  'demo-bill-20': {
    summary: "This water conservation bill invests in water-efficient infrastructure and creates incentive programs for conservation. It's designed to help communities adapt to changing water availability due to drought and climate change by upgrading water systems, promoting efficient use, and providing rebates for water-saving technology.",
    impacts: [
      "Your water bills might decrease through efficiency improvements and conservation rebates",
      "Water restrictions during droughts could be less severe due to improved conservation and infrastructure",
      "Local water systems could become more reliable and resilient to climate changes",
      "Homeowners and businesses might receive incentives for installing water-efficient appliances and landscaping"
    ]
  }
};