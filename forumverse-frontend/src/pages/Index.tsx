
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Heart
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
      name: "Sarah Chen",
      role: "Software Developer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9a6fd32?w=100&h=100&fit=crop&crop=face",
      content: "ForumVerse has become my go-to platform for technical discussions. The community is incredibly knowledgeable and supportive."
    },
    {
      name: "Marcus Rodriguez",
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "I've learned more in the past year on ForumVerse than anywhere else. The quality of discussions is unmatched."
    },
    {
      name: "Elena Popov",
      role: "Product Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "The community here is amazing. I've made connections that have helped advance my career significantly."
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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <Badge className="mb-6" variant="outline">
                <Star className="w-3 h-3 mr-1" />
                Join 50,000+ developers worldwide
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Welcome to ForumVerse
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                The modern community platform where meaningful discussions happen. 
                Connect, learn, and grow with developers from around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ForumVerse?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for modern communities with the features you need to create 
              meaningful connections and discussions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See What Our Community is Discussing
            </h2>
            <p className="text-xl text-muted-foreground">
              Get a glimpse of the vibrant conversations happening right now
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {/* Sample Discussion Cards */}
            <Card className="hover:shadow-lg transition-shadow animate-fade-in">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">techguru42</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Building Modern React Applications with TypeScript</h3>
                <p className="text-muted-foreground mb-4">
                  Learn how to build robust, scalable React applications using TypeScript. This guide covers best practices...
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    23 replies
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-fade-in animate-delay-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b9a6fd32?w=100&h=100&fit=crop&crop=face" />
                    <AvatarFallback>D</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">designlover</p>
                    <p className="text-sm text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">The Future of Web Design: Trends to Watch in 2024</h3>
                <p className="text-muted-foreground mb-4">
                  Discover the latest trends shaping web design in 2024, from AI-powered tools to sustainable design practices...
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">Design</Badge>
                  <Badge variant="outline">UI/UX</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    18 replies
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community members have to say about ForumVerse
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the Conversation?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers, designers, and creators who are already 
              part of the ForumVerse community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Your Journey
                  <Heart className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <Link to="/feed">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Discussions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold">ForumVerse</span>
              </div>
              <p className="text-muted-foreground">
                Building the future of online communities, one discussion at a time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Code of Conduct</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Moderators</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Events</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Bug Reports</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Feature Requests</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">DMCA</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ForumVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
