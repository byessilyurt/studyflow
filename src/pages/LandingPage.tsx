import React from 'react';
import { BookOpen, Users, Target, Trophy, Brain, Clock } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const features = [
    {
      icon: Users,
      title: 'Study Together',
      description: 'Join themed study rooms with fellow learners and AI study buddies for motivation.'
    },
    {
      icon: Clock,
      title: 'Synchronized Timers',
      description: 'Pomodoro-style study sessions synchronized across all participants in your room.'
    },
    {
      icon: Target,
      title: 'Stay Focused',
      description: 'Beautiful, calming environments designed to minimize distractions and maximize focus.'
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Track your progress, earn achievements, and compete on leaderboards for motivation.'
    },
    {
      icon: Brain,
      title: 'Subject-Focused',
      description: 'Organize study sessions by subject with customizable themes and ambient sounds.'
    },
    {
      icon: BookOpen,
      title: 'Virtual Library',
      description: 'Experience the quiet productivity of studying in a library, but with friends online.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Study Hours Completed' },
    { value: '2,500+', label: 'Active Learners' },
    { value: '50+', label: 'Study Subjects' },
    { value: '95%', label: 'Focus Improvement' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Focus Better
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Together
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join virtual study rooms with themed environments, synchronized timers, and AI study buddies. 
              Transform your learning experience with gamified focus tracking and community motivation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Button size="lg" onClick={() => onNavigate('rooms')} className="px-8 py-4 text-lg">
                Start Studying Now
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-green-500 rounded-full opacity-10 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why StudyFlow Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scientifically designed features that help you stay focused, motivated, and productive in your studies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} variant="elevated" className="p-8 text-center hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="p-12 bg-gradient-to-r from-blue-600 to-purple-600">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Study Habits?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students who have improved their focus and academic performance with StudyFlow.
            </p>
            <Button 
              size="lg" 
              onClick={() => onNavigate('rooms')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Join Your First Study Room
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};