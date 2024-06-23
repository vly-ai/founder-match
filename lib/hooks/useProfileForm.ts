import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { profileSchema } from '../validation/profileSchema';
import { IProfile } from '../../models/Profile';
import axios from 'axios';

export const useProfileForm = (userId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<IProfile>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      education: [],
      workExperience: [],
      achievements: [],
      skills: [],
      expertise: [],
      businessIdeas: [],
      industryPreferences: [],
      desiredSkills: []
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/profile/${userId}`);
        form.reset(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const onSubmit = async (data: IProfile) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/profile/${userId}`, data);
      form.reset(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  return { form, loading, error, onSubmit };
};
