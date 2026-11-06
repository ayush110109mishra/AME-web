// Mock data configuration for local development testing
// When USE_MOCK_DATA is true, AnnouncementsSection renders sample cards.
// When USE_MOCK_DATA is false, it renders the clean production empty state.
export const USE_MOCK_DATA = false;

export const MOCK_ANNOUNCEMENTS = [
  {
    _id: 'ann_mock_001',
    title: 'CAD & 3D Modeling Championship 2026',
    description:
      'Registration opens this Monday for SolidWorks and Fusion 360 design sprint. All years eligible.',
    category: 'Competition',
    targetYear: 0, // 0 denotes all years
    createdAt: '2026-11-05T10:00:00.000Z',
  },
  {
    _id: 'ann_mock_002',
    title: 'Guest Lecture: Computational Fluid Dynamics (CFD)',
    description:
      'Distinguished seminar on supersonic airflow simulations in modern turbine engines. Lab credits awarded.',
    category: 'Workshop',
    targetYear: 3, // 3rd year students
    createdAt: '2026-11-04T14:30:00.000Z',
  },
];
