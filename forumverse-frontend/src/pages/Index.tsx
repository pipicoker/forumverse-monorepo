
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { BackgroundGrid } from '@/components/ui/background-grid';
import { CountUpAnimation } from '@/components/ui/count-up-animation';
import { 
  ArrowRight, 
  Users, 
  MessageSquare, 
  Trophy, 
  Shield,
  Star,
  CheckCircle,
  Globe,
  Zap,
  Heart,
  TrendingUp,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Redirect authenticated users to feed
    window.location.href = '/feed';
    return null;
  }

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Rich Discussions",
      description: "Engage in meaningful conversations with a powerful editor and threading system."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Connect with like-minded individuals and build lasting relationships."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Moderated & Safe",
      description: "Enjoy a safe environment with active moderation and community guidelines."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Reputation System",
      description: "Build your reputation through quality contributions and helpful answers."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Community",
      description: "Join thousands of users from around the world sharing knowledge."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Updates",
      description: "Stay up-to-date with instant notifications and live discussions."
    }
  ];

  const testimonials = [
    {
      quote: "ForumVerse has become my go-to platform for technical discussions. The community is incredibly knowledgeable and supportive.",
      name: "Sarah Chen",
      title: "Software Developer"
    },
    {
      quote: "I've learned more in the past year on ForumVerse than anywhere else. The quality of discussions is unmatched.",
      name: "Marcus Rodriguez",
      title: "Designer"
    },
    {
      quote: "The community here is amazing. I've made connections that have helped advance my career significantly.",
      name: "Elena Popov",
      title: "Product Manager"
    },
    {
      quote: "The real-time collaboration features and discussion quality are outstanding. This platform has transformed how I work.",
      name: "James Wilson",
      title: "Tech Lead"
    },
    {
      quote: "Finding answers and connecting with experts has never been easier. ForumVerse is a game-changer for developers.",
      name: "Priya Sharma",
      title: "Full Stack Developer"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Members" },
    { number: "1M+", label: "Discussions" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Community Support" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Aceternity UI */}
      <section className="relative overflow-hidden py-20 md:py-32 min-h-[700px] md:min-h-[800px] flex items-center">
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="hsl(var(--primary))"
        />
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')`,
            }}
          ></div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10"></div>
          
          {/* Background Beams */}
          <BackgroundBeams className="opacity-40" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="animate-fade-in">
              <Badge className="mb-6 px-4 py-2 text-sm backdrop-blur-sm bg-primary/10 border-primary/20" variant="outline">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Join 50,000+ developers worldwide
              </Badge>
              
              <TextGenerateEffect
                words="Where Ideas Come to Life"
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent"
              />
              
              <p className="text-xl md:text-2xl text-foreground/90 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-md animate-fade-in">
                Join a thriving community of developers, designers, and innovators. 
                Share knowledge, solve problems, and build meaningful connections.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto group px-8 py-6 text-base shadow-xl hover:shadow-2xl transition-all backdrop-blur-sm">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-base border-2 backdrop-blur-sm bg-background/20 hover:bg-background/40 transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-foreground/70 mt-6 flex items-center justify-center gap-2 drop-shadow animate-fade-in">
                <CheckCircle className="w-4 h-4 text-primary" />
                No credit card required • Free forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Enhanced Animations */}
      <section className="py-16 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 border-y border-border relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  y: -5,
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center group cursor-default relative"
              >
                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                {/* Animated Counter */}
                <motion.div 
                  className="text-4xl md:text-5xl font-bold text-primary mb-2 relative z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.15 + 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{
                    scale: 1.1,
                    textShadow: "0 0 20px hsl(var(--primary))",
                    transition: { duration: 0.2 }
                  }}
                >
                  <CountUpAnimation target={stat.number} duration={1500} />
                </motion.div>
                
                {/* Label with Animation */}
                <motion.div 
                  className="text-sm md:text-base text-muted-foreground font-medium relative z-10"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15 + 0.5
                  }}
                  whileHover={{
                    color: "hsl(var(--primary))",
                    transition: { duration: 0.2 }
                  }}
                >
                  {stat.label}
                </motion.div>
                
                {/* Floating Particles */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.5s' }}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Animations */}
      <section className="py-24 relative overflow-hidden">
        <BackgroundGrid />
        
        {/* Floating Animation Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-primary/5 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-primary/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 inline-flex items-center gap-1.5" variant="outline">
                <TrendingUp className="w-3 h-3" />
                Features
              </Badge>
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
              Why Choose ForumVerse?
              </motion.h2>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
              Built for modern communities with the features you need to create 
              meaningful connections and discussions.
              </motion.p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card className="group h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-2 hover:border-primary/30 backdrop-blur-sm bg-card/60 hover:bg-card/80 relative overflow-hidden">
                  {/* Animated Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Floating Particles Effect */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.5s' }}></div>
                  
                  <CardHeader className="relative z-10">
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-primary/20"
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        transition: { duration: 0.6 }
                      }}
                    >
                    {feature.icon}
                    </motion.div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative z-10">
                    <motion.p 
                      className="text-muted-foreground leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.description}
                    </motion.p>
                </CardContent>
                  
                  {/* Animated Border Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
                    <div className="w-full h-full bg-background rounded-lg"></div>
                  </div>
              </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Preview with Enhanced Animations */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 inline-flex items-center gap-1.5" variant="outline">
                <MessageSquare className="w-3 h-3" />
                Live Discussions
              </Badge>
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                See What's Happening Now
              </motion.h2>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Get a glimpse of the vibrant conversations happening right now
              </motion.p>
            </motion.div>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            {/* Enhanced Discussion Cards */}
            {[
              {
                id: 1,
                user: "techguru42",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
                time: "2 hours ago",
                title: "Building Modern React Applications with TypeScript",
                description: "Learn how to build robust, scalable React applications using TypeScript. This guide covers best practices...",
                tags: ["React", "TypeScript"],
                replies: 23,
                likes: 45,
                status: "Trending",
                statusColor: "bg-primary/10 text-primary border-primary/20"
              },
              {
                id: 2,
                user: "designlover",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b9a6fd32?w=100&h=100&fit=crop&crop=face",
                time: "4 hours ago",
                title: "The Future of Web Design: Trends to Watch in 2024",
                description: "Discover the latest trends shaping web design in 2024, from AI-powered tools to sustainable design practices...",
                tags: ["Design", "UI/UX"],
                replies: 18,
                likes: 32,
                status: "Hot",
                statusColor: "border-primary/30"
              }
            ].map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-2 hover:border-primary/40 backdrop-blur-sm bg-card/80 hover:bg-card/90 relative overflow-hidden">
                  {/* Animated Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-500 font-medium">LIVE</span>
                  </div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                            <AvatarImage src={discussion.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {discussion.user.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <div>
                          <motion.p 
                            className="font-semibold group-hover:text-primary transition-colors duration-300"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            {discussion.user}
                          </motion.p>
                          <p className="text-sm text-muted-foreground">{discussion.time}</p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className={discussion.statusColor}>
                          {discussion.status}
                        </Badge>
                      </motion.div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <motion.h3 
                      className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {discussion.title}
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground mb-5 leading-relaxed"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {discussion.description}
                    </motion.p>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      {discussion.tags.map((tag, tagIndex) => (
                        <motion.div
                          key={tag}
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge 
                            variant="outline" 
                            className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                          >
                            {tag}
                          </Badge>
                        </motion.div>
                      ))}
                      
                      <div className="flex items-center text-sm text-muted-foreground gap-4 ml-auto">
                        <motion.div 
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-medium">{discussion.replies}</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Heart className="w-4 h-4" />
                          <span className="font-medium">{discussion.likes}</span>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Animated Border Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
                    <div className="w-full h-full bg-background rounded-lg"></div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to="/feed">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="outline" size="lg" className="border-2 px-8 group">
                  View All Discussions
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials with Infinite Moving Cards */}
      <section className="py-24 relative bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4" variant="outline">
              <Users className="w-3 h-3 mr-1.5" />
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              See what our community members have to say about ForumVerse
            </p>
          </div>

          <div className="flex justify-center">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Ready to Join the Conversation?
            </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              Join thousands of developers, designers, and creators who are already 
              part of the ForumVerse community.
            </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto group px-8 py-6 text-base shadow-xl hover:shadow-2xl transition-shadow">
                  Start Your Journey
                    <Heart className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <Link to="/feed">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-base border-2">
                  Explore Discussions
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Secure & private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>50K+ members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-xl">F</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">ForumVerse</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Building the future of online communities, one discussion at a time.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-foreground">Community</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Guidelines
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Code of Conduct
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Moderators
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Events
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-foreground">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Help Center
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Contact Us
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Bug Reports
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Feature Requests
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Privacy Policy
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Terms of Service
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  Cookie Policy
                </a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center group">
                  <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all mr-0 group-hover:mr-1" />
                  DMCA
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              &copy; 2024 ForumVerse. All rights reserved. Made with <Heart className="w-4 h-4 inline text-primary fill-primary" /> by the community.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <a href="#" className="hover:text-primary transition-colors">Status</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Changelog</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
