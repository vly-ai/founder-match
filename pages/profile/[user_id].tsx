import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { WithContext as ReactTags } from 'react-tag-input';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import { IProfile } from '../../models/Profile';
import { profileSchema } from '../../lib/validation/profileSchema';
import { useProfileForm } from '../../lib/hooks/useProfileForm';
import { calculateProfileCompletion } from '../../lib/utils/profileCompletion';

import { Input } from '../../components/input';
import { Textarea } from '../../components/textarea';
import { Select } from '../../components/select';
import { Button } from '../../components/button';
import { Fieldset, Label } from '../../components/fieldset';
import { Avatar } from '../../components/avatar';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '../../components/description-list';
import { Badge } from '../../components/badge';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '../../components/dialog';
import { Text } from '../../components/text';
import { Heading } from '../../components/heading';
import { Divider } from '../../components/divider';
import { Link } from '../../components/link';

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const { form, loading, error, onSubmit } = useProfileForm(user_id as string);
  const { control, handleSubmit, watch, setValue } = form;

  const watchedFields = watch();

  useEffect(() => {
    const percentage = calculateProfileCompletion(watchedFields);
    setCompletionPercentage(percentage);
  }, [watchedFields]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post(`/api/profile/${user_id}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setProfileImage(response.data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text color='red'>Error: {error}</Text>;

  return (
    <div className='container mx-auto px-4 py-8'>
      <Head>
        <title>Profile | Founder Match</title>
        <meta name='description' content='Edit your founder profile' />
      </Head>

      <Heading level={1} className='mb-6'>Edit Profile</Heading>
      <Text className='mb-2'>Profile Completion: {completionPercentage}%</Text>
      <div className='w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700'>
        <div className='bg-blue-600 h-2.5 rounded-full' style={{ width: `${completionPercentage}%` }}></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        <Fieldset>
          <Label htmlFor='name'>Name</Label>
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input {...field} id='name' />
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Fieldset>
          <Label>Profile Picture</Label>
          <div {...getRootProps()} className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
            <div className='space-y-1 text-center'>
              <input {...getInputProps()} />
              {profileImage ? (
                <Avatar src={profileImage} alt='Profile' size='xl' />
              ) : (
                <svg className='mx-auto h-12 w-12 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48' aria-hidden='true'>
                  <path d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              )}
              <Text className='text-sm text-gray-600'>Drag 'n' drop a profile picture here, or click to select one</Text>
            </div>
          </div>
        </Fieldset>

        <Fieldset>
          <Label htmlFor='location'>Location</Label>
          <Controller
            name='location'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input {...field} id='location' />
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Divider />

        <Heading level={2}>Education</Heading>
        {watchedFields.education?.map((_, index) => (
          <DescriptionList key={index}>
            <Controller
              name={`education.${index}.institution`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Institution</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} placeholder='Institution' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`education.${index}.degree`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Degree</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} placeholder='Degree' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`education.${index}.fieldOfStudy`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Field of Study</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} placeholder='Field of Study' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`education.${index}.startDate`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Start Date</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} type='date' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`education.${index}.endDate`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>End Date</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} type='date' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Button
              color='red'
              onClick={() => {
                const education = watchedFields.education?.filter((_, i) => i !== index);
                setValue('education', education);
              }}
            >
              Remove
            </Button>
          </DescriptionList>
        ))}
        <Button
          onClick={() => {
            const education = [...(watchedFields.education || []), { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }];
            setValue('education', education);
          }}
        >
          Add Education
        </Button>

        <Divider />

        <Heading level={2}>Work Experience</Heading>
        {watchedFields.workExperience?.map((_, index) => (
          <DescriptionList key={index}>
            <Controller
              name={`workExperience.${index}.company`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Company</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} placeholder='Company' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`workExperience.${index}.position`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Position</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} placeholder='Position' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`workExperience.${index}.startDate`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Start Date</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} type='date' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`workExperience.${index}.endDate`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>End Date</DescriptionTerm>
                  <DescriptionDetails>
                    <Input {...field} type='date' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Controller
              name={`workExperience.${index}.description`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <DescriptionTerm>Description</DescriptionTerm>
                  <DescriptionDetails>
                    <Textarea {...field} placeholder='Description' />
                    {error && <Text color='red'>{error.message}</Text>}
                  </DescriptionDetails>
                </>
              )}
            />
            <Button
              color='red'
              onClick={() => {
                const workExperience = watchedFields.workExperience?.filter((_, i) => i !== index);
                setValue('workExperience', workExperience);
              }}
            >
              Remove
            </Button>
          </DescriptionList>
        ))}
        <Button
          onClick={() => {
            const workExperience = [...(watchedFields.workExperience || []), { company: '', position: '', startDate: '', endDate: '', description: '' }];
            setValue('workExperience', workExperience);
          }}
        >
          Add Work Experience
        </Button>

        <Divider />

        <Heading level={2}>Skills</Heading>
        <Controller
          name='skills'
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <ReactTags
                tags={value?.map((skill: { name: string; level: string }) => ({ id: skill.name, text: `${skill.name} (${skill.level})` })) || []}
                handleDelete={(i) => {
                  const newSkills = [...value];
                  newSkills.splice(i, 1);
                  onChange(newSkills);
                }}
                handleAddition={(tag) => {
                  const [name, level] = tag.text.split('(');
                  onChange([...value, { name: name.trim(), level: level.replace(')', '').trim() }]);
                }}
                placeholder='Add skills (e.g., JavaScript (Advanced))'
                classNames={{
                  tags: 'flex flex-wrap gap-2',
                  tagInput: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
                  tag: 'bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded',
                  remove: 'ml-2 text-blue-800 hover:text-blue-900'
                }}
              />
              {error && <Text color='red'>{error.message}</Text>}
            </>
          )}
        />

        <Heading level={2}>Expertise</Heading>
        <Controller
          name='expertise'
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <ReactTags
                tags={value?.map((expertise: string) => ({ id: expertise, text: expertise })) || []}
                handleDelete={(i) => {
                  const newExpertise = [...value];
                  newExpertise.splice(i, 1);
                  onChange(newExpertise);
                }}
                handleAddition={(tag) => {
                  onChange([...value, tag.text]);
                }}
                placeholder='Add areas of expertise'
                classNames={{
                  tags: 'flex flex-wrap gap-2',
                  tagInput: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
                  tag: 'bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded',
                  remove: 'ml-2 text-green-800 hover:text-green-900'
                }}
              />
              {error && <Text color='red'>{error.message}</Text>}
            </>
          )}
        />

        <Heading level={2}>Business Ideas</Heading>
        <Controller
          name='businessIdeas'
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <ReactTags
                tags={value?.map((idea: string) => ({ id: idea, text: idea })) || []}
                handleDelete={(i) => {
                  const newIdeas = [...value];
                  newIdeas.splice(i, 1);
                  onChange(newIdeas);
                }}
                handleAddition={(tag) => {
                  onChange([...value, tag.text]);
                }}
                placeholder='Add business ideas'
                classNames={{
                  tags: 'flex flex-wrap gap-2',
                  tagInput: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
                  tag: 'bg-yellow-100 text-yellow-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded',
                  remove: 'ml-2 text-yellow-800 hover:text-yellow-900'
                }}
              />
              {error && <Text color='red'>{error.message}</Text>}
            </>
          )}
        />

        <Heading level={2}>Industry Preferences</Heading>
        <Controller
          name='industryPreferences'
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <ReactTags
                tags={value?.map((industry: string) => ({ id: industry, text: industry })) || []}
                handleDelete={(i) => {
                  const newIndustries = [...value];
                  newIndustries.splice(i, 1);
                  onChange(newIndustries);
                }}
                handleAddition={(tag) => {
                  onChange([...value, tag.text]);
                }}
                placeholder='Add industry preferences'
                classNames={{
                  tags: 'flex flex-wrap gap-2',
                  tagInput: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
                  tag: 'bg-purple-100 text-purple-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded',
                  remove: 'ml-2 text-purple-800 hover:text-purple-900'
                }}
              />
              {error && <Text color='red'>{error.message}</Text>}
            </>
          )}
        />

        <Divider />

        <Heading level={2}>Co-founder Preferences</Heading>
        <Fieldset>
          <Label htmlFor='desiredSkills'>Desired Skills</Label>
          <Controller
            name='desiredSkills'
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <ReactTags
                  tags={value?.map((skill: string) => ({ id: skill, text: skill })) || []}
                  handleDelete={(i) => {
                    const newSkills = [...value];
                    newSkills.splice(i, 1);
                    onChange(newSkills);
                  }}
                  handleAddition={(tag) => {
                    onChange([...value, tag.text]);
                  }}
                  placeholder='Add desired skills'
                  classNames={{
                    tags: 'flex flex-wrap gap-2',
                    tagInput: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
                    tag: 'bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded',
                    remove: 'ml-2 text-indigo-800 hover:text-indigo-900'
                  }}
                />
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Fieldset>
          <Label htmlFor='workStyle'>Work Style</Label>
          <Controller
            name='workStyle'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input {...field} id='workStyle' />
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Fieldset>
          <Label htmlFor='commitmentLevel'>Commitment Level</Label>
          <Controller
            name='commitmentLevel'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Select {...field} id='commitmentLevel'>
                  <option value=''>Select commitment level</option>
                  <option value='Full-time'>Full-time</option>
                  <option value='Part-time'>Part-time</option>
                  <option value='Flexible'>Flexible</option>
                </Select>
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Divider />

        <Heading level={2}>Social Links</Heading>
        <Fieldset>
          <Label htmlFor='linkedInUrl'>LinkedIn URL</Label>
          <Controller
            name='linkedInUrl'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input {...field} id='linkedInUrl' type='url' />
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Fieldset>
          <Label htmlFor='githubUrl'>GitHub URL</Label>
          <Controller
            name='githubUrl'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input {...field} id='githubUrl' type='url' />
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Fieldset>
          <Label htmlFor='twitterUrl'>Twitter URL</Label>
          <Controller
            name='twitterUrl'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input {...field} id='twitterUrl' type='url' />
                {error && <Text color='red'>{error.message}</Text>}
              </>
            )}
          />
        </Fieldset>

        <Button type='submit' onClick={() => setIsDialogOpen(true)}>Save Profile</Button>
      </form>

      <Link href='/dashboard' className='mt-4 inline-block'>Back to Dashboard</Link>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogPanel>
          <DialogTitle>Profile Updated</DialogTitle>
          <DialogDescription>
            Your profile has been successfully updated.
          </DialogDescription>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
