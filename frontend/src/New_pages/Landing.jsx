import React, { useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Fade,
  Grow,
  Slide,
} from "@mui/material";
import { motion } from "framer-motion";
import Rotating_Text from "../ReactBits/Rotating_Text";
import Lenis from "lenis";

const LandingPage = () => {
  useEffect(() => {
    // Smooth scroll with Lenis
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Black Navbar */}
      <AppBar position="static" className="bg-black" style={{ backgroundColor: "black" }}>
        <Container maxWidth="xl">
          <Toolbar className="flex justify-between">
            <Typography variant="h6" className="font-bold text-white">
              Team Kaizen
            </Typography>
            <Box>
              <Button
                color="inherit"
                href="#about"
                className="text-gray-300 hover:text-white mx-2"
              >
                About
              </Button>
              <Button
                color="inherit"
                href="#features"
                className="text-gray-300 hover:text-white mx-2"
              >
                Features
              </Button>
              <Button
                color="inherit"
                href="#contact"
                className="text-gray-300 hover:text-white mx-2"
              >
                Contact
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section with Gradient Background */}
      <section 
        className="py-20" 
        style={{
          background: 'rgb(219,219,219)'
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="container">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="rotate_react"
                      style={{
                        fontSize: "3rem",
                        fontWeight: "500",
                        fontFamily: "Montserrat-Regular",
                        margin: "10px 0px",
                      }}
                    >
                      Team Kaizen
                    </div>
                    <div
                      style={{
                        margin: "10px 20px",
                        fontSize: "1.5rem",
                        fontWeight: "500",
                        fontFamily: "Montserrat-Regular",
                      }}
                    >
                      <Rotating_Text
                        texts={["Rajas", "Kishan"]}
                        mainClassName="px-5 sm:px-2 md:px-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                        staggerFrom={"last"}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                        transition={{
                          type: "spring",
                          damping: 30,
                          stiffness: 400,
                        }}
                        rotationInterval={2000}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography
                  variant="h4"
                  className="font-medium text-gray-600 mb-8"
                  style={{fontFamily:"Montserrat-Regular",margin:"35px 0px"}}
                >
                  Innovating Education with AI and 3D Technology
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="contained"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-100 px-6 py-3 rounded-full shadow-sm transition-all duration-300 transform hover:scale-105"
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </div>
          </Fade>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            className="text-center font-bold text-gray-800 mb-16"
          >
            Our Innovative Features
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Grow in timeout={1000}>
              <motion.div whileHover={{ y: -5 }}>
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <Typography
                    variant="h5"
                    className="font-bold text-gray-800 mb-4"
                  >
                    AI Assessment
                  </Typography>
                  <Typography className="text-gray-600">
                    Smart evaluation system that adapts to student performance
                    and provides personalized feedback.
                  </Typography>
                </div>
              </motion.div>
            </Grow>

            <Grow in timeout={1000} style={{ transitionDelay: "200ms" }}>
              <motion.div whileHover={{ y: -5 }}>
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <Typography
                    variant="h5"
                    className="font-bold text-gray-800 mb-4"
                  >
                    3D VR Classroom
                  </Typography>
                  <Typography className="text-gray-600">
                    Immersive learning environment that makes education
                    interactive and engaging.
                  </Typography>
                </div>
              </motion.div>
            </Grow>

            <Grow in timeout={1000} style={{ transitionDelay: "400ms" }}>
              <motion.div whileHover={{ y: -5 }}>
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <Typography
                    variant="h5"
                    className="font-bold text-gray-800 mb-4"
                  >
                    Voice Cloned Viva
                  </Typography>
                  <Typography className="text-gray-600">
                    Advanced voice technology for realistic oral examination
                    experiences.
                  </Typography>
                </div>
              </motion.div>
            </Grow>

            <Grow in timeout={1000} style={{ transitionDelay: "600ms" }}>
              <motion.div whileHover={{ y: -5 }}>
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <Typography
                    variant="h5"
                    className="font-bold text-gray-800 mb-4"
                  >
                    3D Chatbot
                  </Typography>
                  <Typography className="text-gray-600">
                    Interactive AI assistant that helps students with queries in
                    a natural way.
                  </Typography>
                </div>
              </motion.div>
            </Grow>
          </div>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <Container maxWidth="lg">
          <Slide direction="up" in timeout={800}>
            <div className="text-center">
              <Typography variant="h3" className="font-bold text-gray-800 mb-6">
                Ready to Transform Education?
              </Typography>
              <Typography
                variant="h6"
                className="text-gray-600 mb-10 max-w-2xl mx-auto"
              >
                Join hundreds of educators and students already experiencing the
                future of learning.
              </Typography>
              <div className="flex justify-center space-x-6">
                <Button
                  variant="contained"
                  size="large"
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="font-bold">For Students</span>
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="font-bold">For Teachers</span>
                </Button>
              </div>
            </div>
          </Slide>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Typography variant="h6" className="font-bold mb-4">
                Team Kaizen
              </Typography>
              <Typography className="text-gray-400">
                Innovating education through technology and AI.
              </Typography>
            </div>
            <div>
              <Typography variant="h6" className="font-bold mb-4">
                Contact Us
              </Typography>
              <Typography className="text-gray-400">
                Email: contact@teamkaizen.com
              </Typography>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <Typography>
              © {new Date().getFullYear()} Team Kaizen. All rights reserved.
            </Typography>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;