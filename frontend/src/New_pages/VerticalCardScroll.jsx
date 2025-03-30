import VerticalCard from "../Temp_components/VerticalCard";
import "./VerticalCardScroll.css";
import postimg from "../assets/postman.png";
import reactjsimg from "../assets/reactjs.png";
import { motion, useScroll } from "framer-motion";
import { NewNavbar } from "./NewNavbar";
import { useEffect, useRef } from "react";
import Lenis from "lenis";

function VerticalCardScroll() {
    const container = useRef(null);

    const { scrollYProgress } = useScroll({
  
      target: container,
  
      offset: ['start start', 'end end']
  
    })
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time){
        lenis.raf(time)
        requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, []);

  return (
    <>
      {/* <NewNavbar></NewNavbar> */}
      <div className="verticalproj" style={{fontFamily:"Montserrat-Regular",fontSize:"2rem",display:"flex",alignItems:"center",justifyContent:"center",marginTop:"50px"}}>
        Projects
      </div>
      <main ref={container} className="main23">
        {projects.map((project, i) => {
const targetScale = 1 - ( (projects.length - i) * 0.05);

return <VerticalCard key={`p_${i}`} i={i} {...project} progress={scrollYProgress} range={[i * .25, 1]} targetScale={targetScale}/>
        })}
      </main>
    </>
  );
}
export default VerticalCardScroll;

export const projects = [
  {
    title: "Vanguard",
    description:
      "Vanguard: Revolutionizing autonomous navigation in conflict zones with ESP32, advanced sensors, and drone collaboration. Powered by Dijkstra’s Algorithm and Machine Learning, it excels in pathfinding, obstacle avoidance, and adaptive navigation.",
    src: postimg,
    link: "https://https://github.com/Rajas2912/Vanguard",
    color: "#afb9c5",
  },
  {
    title: "TaskVerify",
    description:
      "Built a full-stack platform to automate assignment evaluation, providing instant AI-powered scores and personalized feedback for students. Teachers can create assignments, view leaderboards, and use chatbot support for assistance. The platform archives submissions securely in the cloud and encourages student engagement through leaderboards. Reactjs , SpringBoot ,MySQL , AI Models",
    src: reactjsimg,
    link: "https://www.ignant.com/2022/09/30/clement-chapillon-questions-geographical-and-mental-isolation-with-les-rochers-fauves/",
    color: "#41474a",
  },
  {
    title: "Zissou",
    description:
      "Though he views photography as a medium for storytelling, Zissou’s images don’t insist on a narrative. Both crisp and ethereal, they’re encoded with an ambiguity—a certain tension—that lets the viewer find their own story within them.",
    src: "water.jpg",
    link: "https://www.ignant.com/2023/10/28/capturing-balis-many-faces-zissou-documents-the-sacred-and-the-mundane-of-a-fragile-island/",
    color: "#75747f",
  },
  {
    title: "Matthias Leidinger",
    description:
      "Originally hailing from Austria, Berlin-based photographer Matthias Leindinger is a young creative brimming with talent and ideas.",
    src: postimg,
    link: "https://www.ignant.com/2023/03/25/ad2186-matthias-leidingers-photographic-exploration-of-awe-and-wonder/",
    color: "#b2b2b2",
  },
  {
    title: "Clément Chapillon",
    description:
      "This is a story on the border between reality and imaginary, about the contradictory feelings that the insularity of a rocky, arid, and wild territory provokes”—so French photographer Clément Chapillon describes his latest highly captivating project Les rochers fauves (French for ‘The tawny rocks’).",
    src: reactjsimg,
    link: "https://www.ignant.com/2022/09/30/clement-chapillon-questions-geographical-and-mental-isolation-with-les-rochers-fauves/",
    color: "#afb9c5",
  },
];
