import React, { useEffect, useState, useRef } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Slider from 'react-slick';
import CountUp from 'react-countup';
import { Link as ScrollLink, Element } from 'react-scroll';
import { motion } from 'framer-motion';
import axios from 'axios';

import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar';
import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { Heading, Subheading } from '@/components/heading';
import { Avatar } from '@/components/avatar';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/components/description-list';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@/components/dialog';
import { Divider } from '@/components/divider';
import { StackedLayout } from '@/components/stacked-layout';

import { formatNumber } from '../lib/formatters/numberFormatter';
import { useIntersectionObserver } from '../lib/hooks/useIntersectionObserver';
import { fadeInAnimation } from '../lib/animations/fadeInAnimation';
import { IStatistics } from '../models/Statistics';

interface FeaturedStory {
  id: string;
  founders: { name: string; profilePicture: string }[];
  description: string;
}

const Home: NextPage = () => {
  const [statistics, setStatistics] = useState<IStatistics | null>(null);
  const [featuredStories, setFeaturedStories] = useState<FeaturedStory[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsVisible = useIntersectionObserver(statsRef, { threshold: 0.1 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, storiesResponse] = await Promise.all([
          axios.get<IStatistics>('/api/statistics'),
          axios.get<FeaturedStory[]>('/api/featured-stories')
        ]);
        setStatistics(statsResponse.data);
        setFeaturedStories(storiesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <Image src='/logo.png' alt='Founder Match Logo' width={150} height={50} />
            <NavbarItem href='#features'>Features</NavbarItem>
            <NavbarItem href='#how-it-works'>How It Works</NavbarItem>
            <NavbarItem href='#success-stories'>Success Stories</NavbarItem>
            <NavbarItem href='#faq'>FAQ</NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href='/login'>Log In</NavbarItem>
            <Button href='/signup'>Sign Up</Button>
          </NavbarSection>
        </Navbar>
      }
    >
      <Head>
        <title>Founder Match - Find Your Perfect Co-Founder</title>
        <meta name='description' content='Connect with like-minded entrepreneurs and find your ideal co-founder to bring your startup ideas to life.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <section className='hero py-20'>
          <motion.div
            initial='hidden'
            animate='visible'
            variants={fadeInAnimation}
            className='text-center'
          >
            <Heading>Find Your Perfect Co-Founder</Heading>
            <Text className='mt-4 text-xl'>Connect with like-minded entrepreneurs and bring your startup ideas to life.</Text>
            <Button href='/signup' className='mt-8'>Get Started</Button>
          </motion.div>
        </section>

        <Divider />

        <Element name='features'>
          <section className='features py-20'>
            <Subheading className='text-center mb-12'>Platform Features</Subheading>
            <DescriptionList>
              <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3'>
                <div className='feature-item'>
                  <DescriptionTerm>Smart Matching Algorithm</DescriptionTerm>
                  <DescriptionDetails>
                    Our AI-powered system finds the most compatible co-founders based on your skills and goals.
                  </DescriptionDetails>
                </div>
                {/* Add more feature items */}
              </div>
            </DescriptionList>
          </section>
        </Element>

        <Divider />

        <Element name='how-it-works'>
          <section className='how-it-works py-20'>
            <Subheading className='text-center mb-12'>How It Works</Subheading>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
              <div className='step'>
                <Subheading as='h3'>1. Create Your Profile</Subheading>
                <Text>Sign up and build your detailed founder profile, showcasing your skills, experience, and vision.</Text>
              </div>
              <div className='step'>
                <Subheading as='h3'>2. Get Matched</Subheading>
                <Text>Our algorithm suggests potential co-founders based on compatibility and shared interests.</Text>
              </div>
              <div className='step'>
                <Subheading as='h3'>3. Connect and Collaborate</Subheading>
                <Text>Reach out to your matches, schedule meetings, and start building your dream team.</Text>
              </div>
            </div>
          </section>
        </Element>

        <Divider />

        <Element name='success-stories'>
          <section className='success-stories py-20'>
            <Subheading className='text-center mb-12'>Success Stories</Subheading>
            <Slider {...sliderSettings}>
              {featuredStories.map((story) => (
                <div key={story.id} className='story-slide p-4'>
                  <div className='flex justify-center space-x-4 mb-4'>
                    {story.founders.map((founder, index) => (
                      <Avatar key={index} src={founder.profilePicture} alt={founder.name} size='lg' />
                    ))}
                  </div>
                  <Text className='text-center mb-2'>{story.description}</Text>
                  <Text className='text-center font-semibold'>{story.founders.map(f => f.name).join(' & ')}</Text>
                </div>
              ))}
            </Slider>
          </section>
        </Element>

        <Divider />

        <section className='statistics py-20' ref={statsRef}>
          <Subheading className='text-center mb-12'>Platform Statistics</Subheading>
          {statistics && isStatsVisible && (
            <DescriptionList>
              <div className='grid grid-cols-1 gap-8 sm:grid-cols-3'>
                <div className='stat-item'>
                  <DescriptionTerm>Total Users</DescriptionTerm>
                  <DescriptionDetails>
                    <CountUp end={statistics.totalUsers} duration={2.5} formattingFn={formatNumber} />
                  </DescriptionDetails>
                </div>
                <div className='stat-item'>
                  <DescriptionTerm>Successful Matches</DescriptionTerm>
                  <DescriptionDetails>
                    <CountUp end={statistics.successfulMatches} duration={2.5} formattingFn={formatNumber} />
                  </DescriptionDetails>
                </div>
                <div className='stat-item'>
                  <DescriptionTerm>Active Users (Last 30 Days)</DescriptionTerm>
                  <DescriptionDetails>
                    <CountUp end={statistics.activeUsers.last30Days} duration={2.5} formattingFn={formatNumber} />
                  </DescriptionDetails>
                </div>
              </div>
            </DescriptionList>
          )}
        </section>

        <Divider />

        <section className='testimonials py-20'>
          <Subheading className='text-center mb-12'>What Our Users Say</Subheading>
          <Slider {...sliderSettings}>
            <div className='testimonial-slide p-4'>
              <Text className='italic mb-4'>"Founder Match helped me find the perfect technical co-founder for my startup idea. We've been working together for 6 months now and just secured our first round of funding!"</Text>
              <Text className='font-semibold'>- Sarah J., CEO of TechStart</Text>
            </div>
            {/* Add more testimonial slides */}
          </Slider>
        </section>

        <Divider />

        <Element name='faq'>
          <section className='faq py-20'>
            <Subheading className='text-center mb-12'>Frequently Asked Questions</Subheading>
            <div className='space-y-8'>
              <Dialog>
                <DialogPanel>
                  <DialogTitle>How does the matching algorithm work?</DialogTitle>
                  <DialogDescription>
                    Our AI-powered algorithm analyzes various factors including skills, experience, goals, and personality traits to suggest the most compatible co-founder matches.
                  </DialogDescription>
                </DialogPanel>
              </Dialog>
              {/* Add more FAQ items */}
            </div>
          </section>
        </Element>
      </main>

      <footer className='bg-gray-100 py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <NavbarItem href='/about'>About Us</NavbarItem>
            <NavbarItem href='/privacy'>Privacy Policy</NavbarItem>
            <NavbarItem href='/terms'>Terms of Service</NavbarItem>
            <NavbarItem href='/contact'>Contact Us</NavbarItem>
          </div>
          <Divider className='my-8' />
          <Text className='text-center'>&copy; {new Date().getFullYear()} Founder Match. All rights reserved.</Text>
        </div>
      </footer>
    </StackedLayout>
  );
};

export default Home;
