import "./Main_Banner.css";
import AboutMe from "./AboutMe";
import Footer from "../Component/Footer";

import { NewNavbar } from "./NewNavbar";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import Rotating_Text from "../ReactBits/Rotating_Text";
import SpotlightCard from "../ReactBits/SpotlightCard";
import TeacherFace from "../3DModels/TeacherFace";

function Main_Banner() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <>
      {/* <Mainnavbar></Mainnavbar> */}
      <NewNavbar></NewNavbar>
      <div className="frontPage">
        <div className="topDiv">
          <div className="container">
            <div className="row">
              <div
                className="name1"
                style={{ fontFamily: "Montserrat-Regular" }}
              >
                Hello We are Team Kaizen,
              </div>
              {/* <button className="btn1">Night Mode</button> */}
            </div>
          </div>
        </div>

        <div className="container">
          <div
            className="row"
            style={{
              margin: "50px 530px",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            
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
                mainClassName="px-5 sm:px-2 md:px-3 bg-red-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>

          </div>
          <div
            className="row"
            style={{ margin: "20px 150px", display: "flex" }}
          >
            <div className="colText" style={{ }}>
              <div
                className="title1"
                style={{
                  fontSize: "3rem",
                  fontWeight: "500",
                  fontFamily: "Montserrat-Regular",
                }}
              >
                {/* <Typewriter
                  options={{
                    strings: [
                      "AI Assesment",
                      "3D VR Classroom",
                      "Voice Cloned Viva",
                      "3D Chatbot",
                    ],
                    autoStart: true,
                    loop: true,
                    cursor: "_",
                  }}
                /> */}
              </div>

              {/* <h1 className="title" >SOFTWARE DEVELOPER</h1> */}
              <p className="lead" style={{ fontSize: "1.3rem" }}>
                AI enthusiast, full-stack developer, and innovator passionate
                about building real-world solutions and sharing knowledge
                through projects and workshops.
              </p>
            </div>
            <div className="colModel" style={{ padding: "3%" }}>
              <TeacherFace></TeacherFace> {/* Add the TeacherFace component here */}
            </div>
          </div>
        </div>

        <div className="row" style={{ margin: "10px 400px", color: "white" }}>
          <SpotlightCard className="custom-spotlight-card">
            <div className="max-w-sm rounded-lg shadow-lg p-6 transform transition duration-500 hover:scale-105">
              <h2
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "Montserrat-Regular" }}
              >
                For Students
              </h2>
              <p
                className="text-gray-400 mb-6"
                style={{ fontFamily: "Montserrat-Regular" }}
              >
                Join the Smart Education System to access a wide range of
                courses, track your progress, and achieve your learning goals.
              </p>
              <div
                className="flex gap-4"
                style={{ fontFamily: "Montserrat-Regular" }}
              >
                <button className="bg-transparent border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-gradient-to-r from-grey-600 to-grey-700 transition duration-300">
                  Signup
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300">
                  Login
                </button>
              </div>
            </div>
          </SpotlightCard>
          <SpotlightCard className="custom-spotlight-card">
            <div className="max-w-sm rounded-lg shadow-lg p-6 transform transition duration-500 hover:scale-105">
              <h2
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "Montserrat-Regular" }}
              >
                For Teachers
              </h2>
              <p
                className="text-gray-400 mb-6"
                style={{ fontFamily: "Montserrat-Regular" }}
              >
                Empower your teaching with the Smart Education System. Create
                courses, manage students, and track their progress effortlessly.
              </p>
              <div
                className="flex gap-4"
                style={{ fontFamily: "Montserrat-Regular" }}
              >
                <button className="bg-transparent border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-gradient-to-r from-grey-400 to-grey-700 transition duration-300">
                  Signup
                </button>
                <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition duration-300">
                  Login
                </button>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>

      <Footer></Footer>
    </>
  );
}
export default Main_Banner;
