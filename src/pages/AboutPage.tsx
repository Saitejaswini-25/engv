import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, GraduationCap, Lightbulb } from 'lucide-react';

const AboutPage: React.FC = () => {
  const values = [
    {
      title: "Knowledge Sharing",
      description: "We believe in freely sharing knowledge and expertise to help students grow.",
      icon: <BookOpen className="w-10 h-10 text-blue-600" />
    },
    {
      title: "Practical Learning",
      description: "Our focus is on bridging the gap between theory and practical industry skills.",
      icon: <GraduationCap className="w-10 h-10 text-blue-600" />
    },
    {
      title: "Community Support",
      description: "We foster a supportive community where students can collaborate and learn together.",
      icon: <Users className="w-10 h-10 text-blue-600" />
    },
    {
      title: "Cultural Awareness",
      description: "We emphasize the importance of cultural and personal growth alongside technical skills.",
      icon: <Lightbulb className="w-10 h-10 text-blue-600" />
    }
  ];
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">About Engiversee</h1>
            <p className="text-xl text-blue-100">
              A passionate community dedicated to empowering engineering students through knowledge sharing and skills development.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-4">
                Engiversee was founded in 2024 with a clear vision: to create a collaborative platform where engineering students can learn, grow, and excel in their academic and professional journeys.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                We recognized a gap between theoretical education provided in colleges and the practical skills needed in the industry. This realization led us to establish Engiversee as a bridge between these two worlds.
              </p>
              <p className="text-lg text-gray-700">
                Today, we are a growing community of passionate educators, industry professionals, and students working together to make quality education and career guidance accessible to all.
              </p>
            </motion.div>
            
            <motion.div
              className="rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Engiversee team collaborating" 
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Mission & Vision</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guiding principles that drive our organization forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="card p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4 text-blue-800">Our Mission</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Ensures students receive relevant, high-quality education for a strong foundation.</li>
                <li>Develops practical, job-ready skills aligned with industry standards.</li>
                <li>Provides career clarity and guidance during critical academic years.</li>
                <li>Bridges the gap between theory and real-world application.</li>
                <li>Empowers students to become confident, capable professionals in a competitive world.</li>
              </ul>
            </motion.div>

            <motion.div 
              className="card p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4 text-blue-800">Our Vision</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Fosters a global community of skilled, confident engineers.</li>
                <li>Promotes both technical excellence and personal development.</li>
                <li>Encourages cultural awareness for better global collaboration.</li>
                <li>Ensures equal access to resources, mentorship, and opportunities.</li>
                <li>Helps students unlock their full potential in a rapidly evolving world.</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The core principles that guide everything we do at Engiversee
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="flex gap-4 items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-blue-100 rounded-full p-4 flex-shrink-0">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-8">Company Overview</h2>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-lg text-gray-700 mb-6">
                Engiversee is a passionate group of individuals committed to empowering students, especially those in the field of engineering, by sharing knowledge, insights, and opportunities. We were founded with the vision of creating a collaborative platform where students can learn, grow, and excel in their academic and professional journeys.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                At Engiversee, we aim to bridge the gap between theoretical education and practical industry skills. Our community focuses on offering free workshops, programming language tutorials, aptitude training, and career guidance. We believe in fostering a space where students can collaborate, share their expertise, and uplift each other.
              </p>
              
              <p className="text-lg text-gray-700 mb-8">
                In addition to technical education, we emphasize the importance of cultural and personal growth through our initiatives like "Know Your Culture, Know Your Country, and Know Yourself." By encouraging students to connect with their roots, we aim to instill a sense of identity and pride alongside technical excellence.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold mb-2">Founded</h4>
                  <p>2024</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold mb-2">Company Size</h4>
                  <p>2-10 employees</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold mb-2">Industry</h4>
                  <p>Education</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
