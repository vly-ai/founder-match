import { IProfile } from '../../models/Profile';

export const calculateProfileCompletion = (profile: Partial<IProfile>): number => {
  const fields = [
    'name',
    'location',
    'education',
    'workExperience',
    'achievements',
    'skills',
    'expertise',
    'businessIdeas',
    'industryPreferences',
    'desiredSkills',
    'workStyle',
    'commitmentLevel',
    'linkedInUrl',
    'githubUrl',
    'twitterUrl'
  ];

  const completedFields = fields.filter(field => {
    if (Array.isArray(profile[field])) {
      return profile[field].length > 0;
    }
    return !!profile[field];
  });

  return Math.round((completedFields.length / fields.length) * 100);
};
