import banner_img from "../assets/portrait.png";
function AboutMe(){
return(
    <>
        <div className="container">
          <div
            className="row"
            style={{ margin: "40px 200px", display: "flex" }}
          >
            <div className="colText" style={{ padding: "3%" }}>
              <div className="title2" style={{fontFamily:"Montserrat-Regular",fontSize:"1.5rem"}}>Hey! I'm Rajas Bhosale</div>
              <div className="about_text2">
              <p className="lead" style={{fontFamily:"Montserrat-Regular"}}>
               BTech student in AI and Data Science at Vishwakarma Institute of Technology and a Diploma candidate in Programming at IIT Madras. Passionate about machine learning, AI, and full-stack development, I excel at creating innovative solutions and have worked on projects like ML-based image extraction. I enjoy exploring emerging technologies, collaborating with developers, and contributing to workshops and open-source projects.
              </p>
              </div>
              <div>
              <a>
                Let's Connect !
              </a>
              </div>

            </div>
            <div className="colImage">
              {/* <img
                src={banner_img}
                className="bannerImage"
                alt="Bootstrap Themes"
                width="400"
                height="500"
                loading="lazy"
              /> */}
            </div>
          </div>
        </div>
    </>
);
}
export default AboutMe;