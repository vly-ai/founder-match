import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registrationSchema, loginSchema, forgotPasswordSchema } from '../lib/validation/authSchemas';
import { IUser } from '../models/User';

import { StackedLayout } from '../components/stacked-layout';
import { Navbar, NavbarItem } from '../components/navbar';
import { Input } from '../components/input';
import { Button } from '../components/button';
import { Fieldset, Label, Description } from '../components/fieldset';
import { Text } from '../components/text';
import { Heading } from '../components/heading';
import { Link } from '../components/link';
import { Divider } from '../components/divider';
import { Alert } from '../components/alert';

const AuthPage: NextPage = () => {
  const router = useRouter();
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string | null>(null);

  const { register: registerForm, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors } } = useForm({
    resolver: yupResolver(registrationSchema)
  });

  const { register: loginForm, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const { register: forgotPasswordForm, handleSubmit: handleForgotPasswordSubmit, formState: { errors: forgotPasswordErrors } } = useForm({
    resolver: yupResolver(forgotPasswordSchema)
  });

  const onRegisterSubmit = async (data: { email: string; password: string; name: string }) => {
    try {
      await axios.post('/api/auth/register', data);
      router.push('/verify-email');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setRegistrationError(error.response.data.message);
      } else {
        setRegistrationError('An unexpected error occurred');
      }
    }
  };

  const onLoginSubmit = async (data: { email: string; password: string }) => {
    try {
      const response = await axios.post<{ token: string; user: IUser }>('/api/auth/login', data);
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError('An unexpected error occurred');
      }
    }
  };

  const onForgotPasswordSubmit = async (data: { email: string }) => {
    try {
      await axios.post('/api/auth/forgot-password', data);
      setForgotPasswordSuccess('If a user with that email exists, a password reset link has been sent.');
    } catch (error) {
      setForgotPasswordSuccess(null);
    }
  };

  return (
    <StackedLayout
      navbar={<Navbar>
        <NavbarItem href='/' aria-label='Home'>
          <img src='/logo.svg' alt='Logo' className='h-8 w-auto' />
        </NavbarItem>
        <NavbarItem href='/'>Home</NavbarItem>
        <NavbarItem href='/about'>About</NavbarItem>
      </Navbar>} sidebar={undefined}    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='mt-10 sm:mt-0'>
            <div className='md:grid md:grid-cols-2 md:gap-6'>
              <div className='md:col-span-1'>
                <Heading level={2}>Register</Heading>
                {registrationError && <Alert color='red' onClose={()=>{}}>{registrationError}</Alert>}
                <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className='mt-5 space-y-6'>
                  <Fieldset>
                    <Label htmlFor='register-name'>Name</Label>
                    <Input id='register-name' type='text' {...registerForm('name')} />
                    {registerErrors.name && <Text color='red'>{}</Text>}
                  </Fieldset>
                  <Fieldset>
                    <Label htmlFor='register-email'>Email</Label>
                    <Input id='register-email' type='email' {...registerForm('email')} />
                    {registerErrors.email && <Text color='red'>{}</Text>}
                  </Fieldset>
                  <Fieldset>
                    <Label htmlFor='register-password'>Password</Label>
                    <Input id='register-password' type='password' {...registerForm('password')} />
                    {registerErrors.password && <Text color='red'>{}</Text>}
                  </Fieldset>
                  <Button type='submit'>Register</Button>
                </form>
                <div className='mt-6'>
                  <Button onClick={() => router.push('/api/auth/oauth/google')} color='white'>Register with Google</Button>
                  <Button onClick={() => router.push('/api/auth/oauth/linkedin')} color='white' className='mt-3'>Register with LinkedIn</Button>
                </div>
              </div>

              <div className='mt-5 md:col-span-1 md:mt-0'>
                <Heading level={2}>Login</Heading>
                {loginError && <Alert color='red' onClose={()=>{}}>{loginError}</Alert>}
                <form onSubmit={handleLoginSubmit(onLoginSubmit)} className='mt-5 space-y-6'>
                  <Fieldset>
                    <Label htmlFor='login-email'>Email</Label>
                    <Input id='login-email' type='email' {...loginForm('email')} />
                    {loginErrors.email && <Text color='red'>{}</Text>}
                  </Fieldset>
                  <Fieldset>
                    <Label htmlFor='login-password'>Password</Label>
                    <Input id='login-password' type='password' {...loginForm('password')} />
                    {loginErrors.password && <Text color='red'>{}</Text>}
                  </Fieldset>
                  <Button type='submit'>Login</Button>
                </form>
                <div className='mt-6'>
                  <Button onClick={() => router.push('/api/auth/oauth/google')} color='white'>Login with Google</Button>
                  <Button onClick={() => router.push('/api/auth/oauth/linkedin')} color='white' className='mt-3'>Login with LinkedIn</Button>
                </div>

                <Divider className='my-8' />

                <Heading level={3}>Forgot Password</Heading>
                {forgotPasswordSuccess && <Alert color='green' onClose={()=>{}}>{forgotPasswordSuccess}</Alert>}
                <form onSubmit={handleForgotPasswordSubmit(onForgotPasswordSubmit)} className='mt-5 space-y-6'>
                  <Fieldset>
                    <Label htmlFor='forgot-password-email'>Email</Label>
                    <Input id='forgot-password-email' type='email' {...forgotPasswordForm('email')} />
                    {forgotPasswordErrors.email && <Text color='red'>{}</Text>}
                  </Fieldset>
                  <Button type='submit'>Reset Password</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className='mt-16 border-t border-gray-200'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between py-6'>
            <Link href='/terms'>Terms of Service</Link>
            <Link href='/privacy'>Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </StackedLayout>
  );
};

export default AuthPage;