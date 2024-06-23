import * as yup from 'yup';

export const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  location: yup.string(),
  education: yup.array().of(
    yup.object().shape({
      institution: yup.string().required('Institution is required'),
      degree: yup.string().required('Degree is required'),
      fieldOfStudy: yup.string().required('Field of study is required'),
      startDate: yup.date().required('Start date is required'),
      endDate: yup.date()
    })
  ),
  workExperience: yup.array().of(
    yup.object().shape({
      company: yup.string().required('Company is required'),
      position: yup.string().required('Position is required'),
      startDate: yup.date().required('Start date is required'),
      endDate: yup.date(),
      description: yup.string()
    })
  ),
  achievements: yup.array().of(yup.string()),
  skills: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Skill name is required'),
      level: yup.string().oneOf(['Beginner', 'Intermediate', 'Advanced', 'Expert']).required('Skill level is required')
    })
  ),
  expertise: yup.array().of(yup.string()),
  businessIdeas: yup.array().of(yup.string()),
  industryPreferences: yup.array().of(yup.string()),
  desiredSkills: yup.array().of(yup.string()),
  workStyle: yup.string(),
  commitmentLevel: yup.string().oneOf(['Full-time', 'Part-time', 'Flexible']).required('Commitment level is required'),
  linkedInUrl: yup.string().url('Invalid LinkedIn URL'),
  githubUrl: yup.string().url('Invalid GitHub URL'),
  twitterUrl: yup.string().url('Invalid Twitter URL')
});
