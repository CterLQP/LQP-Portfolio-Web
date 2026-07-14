"use client";
import { useState, useEffect, useRef } from "react";
import { translations, titusData } from "../data/translations";

export default function Home() {
  const [lang, setLang] = useState("en");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroImgIdx, setHeroImgIdx] = useState(1);
  const [activeModal, setActiveModal] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", content: "", isGreeting: true }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Easter egg states
  const [eeQuoteClicks, setEeQuoteClicks] = useState(0);
  const [eeActive, setEeActive] = useState(false);
  const [eeText, setEeText] = useState("");
  const [eeSubVisible, setEeSubVisible] = useState(false);
  const eeTimerRef = useRef(null);
  const eeTypeTimeoutRef = useRef(null);
  
  const [currentSection, setCurrentSection] = useState("about");

  const t = translations[lang] || translations["en"];

  // Cache busting logic removed (Next.js handles it well)
  // intersection observer for .reveal
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setTimeout(() => setLang(savedLang), 0);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Observer to track which section the user is currently viewing
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          setCurrentSection(entry.target.id);
        }
      });
    }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });
    
    document.querySelectorAll('section').forEach(el => sectionObserver.observe(el));

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      sectionObserver.disconnect();
    };
  }, []);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('language', l);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const toggleHeroImage = () => setHeroImgIdx(prev => prev === 1 ? 2 : 1);

  const handleModalOpen = (id) => {
    setActiveModal(id);
  };
  const handleModalClose = () => {
    setActiveModal(null);
  };

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [activeModal]);

  // Chat logic
  const handleSendMessage = async (textOverride) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : chatInput;
    if (!textToSend.trim()) return;
    
    const newMessages = [...chatMessages, { role: "user", content: textToSend }];
    setChatMessages(newMessages);
    if (typeof textOverride !== 'string') setChatInput("");
    setIsTyping(true);

    const systemInstruction = `You are a helpful AI assistant for Le Quy Phat (Titus Le). 
    Use the following information about Titus to answer visitor questions. 
    CRITICAL INSTRUCTION: Keep your response extremely concise (maximum 1 short paragraph). Avoid long greetings or unnecessary pleasantries. Just answer the question directly.
    If you don't know the answer based on the provided context, suggest they contact Titus directly via email or LinkedIn.
    CURRENT STATUS: The user is currently viewing the "${currentSection}" section of the portfolio. If they ask a vague question, assume it's related to this section.
    SUPERPOWER: You can magically control the user's screen! If the user asks to see a section, go to a section, or asks where something is (like "show me your projects", "how to contact you", "where is your experience"), you MUST include the exact string [ACTION:SCROLL_TO_{SECTION}] anywhere in your response. Replace {SECTION} with one of: ABOUT, SKILLS, EXPERIENCE, EDUCATION, PROJECTS, CERTIFICATIONS, CONTACT. For example: "I'd be happy to show you his projects! [ACTION:SCROLL_TO_PROJECTS]"
    CONTEXT: ${titusData}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, systemInstruction })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      let botMsg = data.choices[0].message.content;
      
      // Parse UI Control Actions from AI
      const actionMatch = botMsg.match(/\[ACTION:SCROLL_TO_([A-Z]+)\]/);
      if (actionMatch) {
        const targetId = actionMatch[1].toLowerCase();
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        botMsg = botMsg.replace(/\[ACTION:SCROLL_TO_[A-Z]+\]/g, '').trim();
      }

      setChatMessages(prev => [...prev, { role: "bot", content: botMsg }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "bot", content: "⚠️ **System:** Please add your Groq API Key to Vercel Environment Variables as GROQ_API_KEY." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Easter egg logic
  const handleQuoteClick = () => {
    setEeQuoteClicks(prev => prev + 1);
    clearTimeout(eeTimerRef.current);
    eeTimerRef.current = setTimeout(() => setEeQuoteClicks(0), 1500);

    if (eeQuoteClicks + 1 === 3) {
      setEeQuoteClicks(0);
      triggerEasterEgg();
    }
  };

  const triggerEasterEgg = () => {
    if (eeActive) return;
    setEeActive(true);
    setEeText("");
    setEeSubVisible(false);
    document.body.style.overflow = 'hidden';
    // Secret is obscured to prevent snooping in DevTools
    const secretCodes = [84, 104, 7853, 116, 32, 107, 104, 243, 32, 273, 7875, 32, 107, 104, 244, 110, 103, 32, 110, 104, 7899, 32, 116, 7899, 105, 32, 101, 109];
    const secretMessage = String.fromCharCode(...secretCodes);
    const chars = Array.from(secretMessage);
    let i = 0;

    const typeWriter = () => {
      if (i < chars.length) {
        setEeText(secretMessage.substring(0, i + 1));
        i++;
        eeTypeTimeoutRef.current = setTimeout(typeWriter, 120);
      } else {
        eeTypeTimeoutRef.current = setTimeout(() => setEeSubVisible(true), 1000);
      }
    };
    eeTypeTimeoutRef.current = setTimeout(typeWriter, 1000);
  };

  const closeEasterEgg = () => {
    setEeActive(false);
    clearTimeout(eeTypeTimeoutRef.current);
    document.body.style.overflow = '';
    setTimeout(() => {
      setEeText("");
      setEeSubVisible(false);
    }, 1000);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          <a href="#" className="logo">LQP<span>.</span></a>
          <ul className="nav-links" style={{ display: menuOpen ? 'flex' : undefined, flexDirection: menuOpen ? 'column' : undefined, position: menuOpen ? 'absolute' : undefined, top: menuOpen ? '60px' : undefined, left: menuOpen ? '0' : undefined, width: menuOpen ? '100%' : undefined, background: menuOpen ? 'rgba(15, 23, 42, 0.95)' : undefined, padding: menuOpen ? '20px' : undefined, borderBottom: menuOpen ? '1px solid var(--border)' : undefined }}>
            <li><a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>{t.dock_about}</a></li>
            <li><a href="#skills" className="nav-link" onClick={() => setMenuOpen(false)}>{t.tab_skills}</a></li>
            <li><a href="#experience" className="nav-link" onClick={() => setMenuOpen(false)}>{t.dock_experience}</a></li>
            <li><a href="#education" className="nav-link" onClick={() => setMenuOpen(false)}>{t.dock_education}</a></li>
            <li><a href="#projects" className="nav-link" onClick={() => setMenuOpen(false)}>{t.tab_projects}</a></li>
            <li><a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>{t.dock_contact}</a></li>
          </ul>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="lang-switcher">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>EN</button>
              <span style={{ color: "var(--border)", margin: "0 5px" }}>|</span>
              <button className={`lang-btn ${lang === 'vi' ? 'active' : ''}`} onClick={() => changeLang('vi')}>VI</button>
            </div>
            <div className="mobile-menu-btn" style={{ marginLeft: "20px" }} onClick={() => setMenuOpen(!menuOpen)}>
              <i className="fa-solid fa-bars"></i>
            </div>
          </div>
        </div>
      </nav>

      <button className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop} title="Go to top">
        <i className="fa-solid fa-arrow-up"></i>
      </button>

      <section id="about" className="hero">
        <div className="container hero-container">
          <div className="hero-text reveal">
            <span className="hero-role">{t.about_role}</span>
            <h1 className="hero-name">
              <span>{t.about_name_main}</span>
              <span className="hero-aka">(Titus Le)</span>
            </h1>
            <p className="hero-bio">{t.about_bio}</p>
            <div className="hero-buttons">
              <a href="#contact" className="btn btn-primary">
                <i className="fa-solid fa-envelope"></i> <span>{t.dock_contact}</span>
              </a>
              <a href="https://drive.google.com/file/d/1Dg2hxJXCQUWue1O9jjvJg-ILgu4frhmR/view?usp=sharing" target="_blank" rel="noreferrer" className="btn btn-outline">
                <i className="fa-solid fa-download"></i> <span>{t.project_download_cv}</span>
              </a>
            </div>
          </div>
          <div className="hero-image-wrapper reveal">
            <div className="image-flipper-container">
              <button className="switch-photo-btn" onClick={toggleHeroImage} title="Change Photo">
                <i className="fa-solid fa-camera-rotate"></i>
              </button>
              <img id="hero-img-1" src="https://res.cloudinary.com/dd7gti2kn/image/upload/v1772872351/LQP/Titus_crbuaj.jpg" alt="Le Quy Phat Main" className={`hero-img ${heroImgIdx === 1 ? 'active' : ''}`} loading="eager" onClick={(e) => e.target.classList.toggle('revealed')} />
              <img id="hero-img-2" src="https://res.cloudinary.com/dd7gti2kn/image/upload/v1761701714/samples/LeQuyPhat_DA_rd9ufj.png" alt="Le Quy Phat Alt" className={`hero-img ${heroImgIdx === 2 ? 'active' : ''}`} loading="lazy" onClick={(e) => e.target.classList.toggle('revealed')} />
            </div>
            
            <div className="hero-quote" id="secret-trigger" onClick={handleQuoteClick}>
              <p><i className="fa-solid fa-quote-left"></i> <span>{t.about_quote}</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section bg-alt">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">{t.tab_skills}</h2>
          </div>
          <div className="skills-grid">
            <div className="skill-category reveal">
              <h3 className="skill-cat-title">{t.skills_cat1}</h3>
              <div className="skill-list">
                <div className="skill-item"><i className="fa-brands fa-python"></i> <span>{t.skill_python}</span></div>
                <div className="skill-item"><i className="fa-solid fa-database"></i> <span>{t.skill_sql}</span></div>
                <div className="skill-item"><i className="fa-brands fa-html5"></i> <span>{t.skill_html_css}</span></div>
                <div className="skill-item"><i className="fa-brands fa-js"></i> <span>{t.skill_js}</span></div>
              </div>
            </div>
            <div className="skill-category reveal">
              <h3 className="skill-cat-title">{t.skills_cat2}</h3>
              <div className="skill-list">
                <div className="skill-item"><i className="fa-solid fa-chart-line"></i> <span>{t.skill_power_bi}</span></div>
                <div className="skill-item"><i className="fa-solid fa-chart-pie"></i> <span>{t.skill_looker_studio}</span></div>
              </div>
            </div>
            <div className="skill-category reveal">
              <h3 className="skill-cat-title">{t.skills_cat3}</h3>
              <div className="skill-list">
                <div className="skill-item"><i className="fa-solid fa-tasks"></i> <span>{t.skill_agile}</span></div>
                <div className="skill-item"><i className="fa-solid fa-code-branch"></i> <span>{t.skill_sdlc}</span></div>
                <div className="skill-item"><i className="fa-solid fa-truck-fast"></i> <span>{t.skill_end_to_end}</span></div>
                <div className="skill-item"><i className="fa-solid fa-arrow-trend-up"></i> <span>{t.skill_process_imp}</span></div>
                <div className="skill-item"><i className="fa-solid fa-users"></i> <span>{t.skill_stakeholder}</span></div>
              </div>
            </div>
            <div className="skill-category reveal">
              <h3 className="skill-cat-title">{t.skills_cat4}</h3>
              <div className="skill-list">
                <div className="skill-item"><i className="fa-brands fa-jira"></i> <span>{t.skill_jira}</span></div>
                <div className="skill-item"><i className="fa-brands fa-confluence"></i> <span>{t.skill_confluence}</span></div>
                <div className="skill-item"><i className="fa-brands fa-google"></i> <span>{t.skill_google_ws}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">{t.dock_experience}</h2>
          </div>
          <div className="timeline">
            <div className="timeline-item reveal" style={{ transitionDelay: "0.1s" }}>
              <div className="timeline-date">{t.exp_ghn_date}</div>
              <h3 className="timeline-title">{t.exp_ghn_company}</h3>
              <p className="timeline-pos">{t.exp_ghn_position}</p>
              <ul className="timeline-desc">
                <li>{t.exp_ghn_desc1}</li>
                <li>{t.exp_ghn_desc2}</li>
                {t.exp_ghn_desc3 && <li>{t.exp_ghn_desc3}</li>}
              </ul>
            </div>
            {t.exp3_company && (
              <div className="timeline-item reveal" style={{ transitionDelay: "0.2s" }}>
                <div className="timeline-date">{t.exp3_date}</div>
                <h3 className="timeline-title">{t.exp3_company}</h3>
                <p className="timeline-pos">{t.exp3_position}</p>
                <ul className="timeline-desc">
                  <li>{t.exp3_desc1}</li>
                  <li>{t.exp3_desc2}</li>
                  {t.exp3_desc3 && <li>{t.exp3_desc3}</li>}
                </ul>
              </div>
            )}
            <div className="timeline-item reveal" style={{ transitionDelay: "0.3s" }}>
              <div className="timeline-date">{t.exp2_date}</div>
              <h3 className="timeline-title">{t.exp2_company}</h3>
              <p className="timeline-pos">{t.exp2_position}</p>
              <ul className="timeline-desc">
                <li>{t.exp2_desc1}</li>
                {t.exp2_desc2 && <li>{t.exp2_desc2}</li>}
                {t.exp2_desc3 && <li>{t.exp2_desc3}</li>}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="section bg-alt">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">{t.dock_education}</h2>
          </div>
          <div className="education-card reveal">
            <div className="edu-header">
              <h3>{t.edu_school}</h3>
              <span className="edu-year">{t.edu_time}</span>
            </div>
            <h4>{t.edu_degree}</h4>
            <ul className="edu-desc">
              <li>{t.edu_desc1}</li>
              <li>{t.edu_desc2}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">{t.projects_header}</h2>
          </div>
          
          {/* Project Filter Bar */}
          <div className="project-filter-bar reveal">
            {["All", "Python & ML", "Power BI", "Others"].map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {[
              {
                id: "desc-project-ghn",
                title: t.project_ghn_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769199596/LQP/python_-_streamlit_zurspu.jpg",
                tags: [t.tag_python, t.tag_streamlit, t.tag_ibcs, t.tag_ml],
                category: "Python & ML",
                codeUrl: "https://ghn-executive-dashboard.streamlit.app/",
                codeLabel: t.project_view_code
              },
              {
                id: "desc-project-avocado",
                title: t.project_avocado_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769199596/LQP/python_-_streamlit_zurspu.jpg",
                tags: [t.tag_python, t.tag_streamlit, t.tag_ml],
                category: "Python & ML",
                codeUrl: "https://avocado-analytics-lqp.streamlit.app/",
                codeLabel: t.project_view_code
              },
              {
                id: "desc-project-athens",
                title: t.project_athens_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769199596/LQP/python_-_streamlit_zurspu.jpg",
                tags: [t.tag_python, t.tag_streamlit, t.tag_ml],
                category: "Python & ML",
                codeUrl: "https://athens-airbnb-analysis.streamlit.app",
                codeLabel: t.project_view_code
              },
              {
                id: "desc-project7",
                title: t.project7_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769198128/LQP/Powerbi_gljqff.jpg",
                tags: [t.tag_powerbi],
                category: "Power BI",
                codeUrl: "https://drive.google.com/drive/folders/1Vl2ZvRNiYBN_cBVNUecxlK2h0BOg138u?usp=sharing",
                codeLabel: t.project_view_report
              },
              {
                id: "desc-project6",
                title: t.project6_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769198128/LQP/Powerbi_gljqff.jpg",
                tags: [t.tag_powerbi],
                category: "Power BI",
                codeUrl: "https://drive.google.com/drive/folders/1C4c6WWYiWzzQYoZ__1zdvb9ApcY04tqn?usp=sharing",
                codeLabel: t.project_view_report
              },
              {
                id: "desc-project5",
                title: t.project5_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769198128/LQP/Powerbi_gljqff.jpg",
                tags: [t.tag_powerbi],
                category: "Power BI",
                codeUrl: "https://drive.google.com/file/d/1WxB_n0SpW858Ex0HDPOoc4abrdDvKgFZ/view?usp=sharing",
                codeLabel: t.project_view_report
              },
              {
                id: "desc-project4",
                title: t.project4_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769199597/LQP/python-jupyter_notebook_jgtcqf.png",
                tags: [t.tag_python, t.tag_ml],
                category: "Python & ML",
                codeUrl: "https://github.com/LQP-CTER/Data-Mining",
                codeLabel: t.project_view_code
              },
              {
                id: "desc-project8",
                title: t.project8_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769199597/LQP/Python_cshp0h.png",
                tags: [t.tag_python, t.tag_tkinter],
                category: "Python & ML",
                codeUrl: "https://github.com/LQP-CTER/Inventory-Management-System/tree/main",
                codeLabel: t.project_view_code
              },
              {
                id: "desc-project3",
                title: t.project3_title,
                img: "https://res.cloudinary.com/dd7gti2kn/image/upload/v1769199596/LQP/python_-_streamlit_zurspu.jpg",
                tags: [t.tag_ai_ml, t.tag_streamlit],
                category: "Python & ML",
                codeUrl: "https://track-gold-trend.streamlit.app",
                codeLabel: t.project_view_code
              }
            ].filter(p => selectedCategory === "All" || p.category === selectedCategory).map((project, index) => (
              <div className="project-card reveal fade-in" key={index}>
                <div className="project-img-wrapper">
                  <img src={project.img} className="project-img" alt={project.title} loading="lazy" />
                </div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-tags">
                    {project.tags.map(tag => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="project-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => handleModalOpen(project.id)}>{t.project_view_desc}</button>
                    <a href={project.codeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">{project.codeLabel}</a>
                  </div>
                </div>
              </div>
            ))}


          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="section bg-alt">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">{t.dock_certifications}</h2>
          </div>
          <div className="cert-grid">
            <a href="https://www.udemy.com/certificate/UC-dbb3ae20-850d-4a4d-8e34-d3edc3724286" target="_blank" rel="noreferrer" className="cert-item reveal">
              <i className="fa-solid fa-certificate cert-icon"></i>
              <div className="cert-name">{t.cert_udemy}</div>
            </a>
            <a href="https://www.coursera.org/account/accomplishments/professional-cert/B45CQSQOURN3" target="_blank" rel="noreferrer" className="cert-item reveal">
              <i className="fa-solid fa-certificate cert-icon"></i>
              <div className="cert-name">{t.cert_gbi}</div>
            </a>
            <a href="https://coursera.org/share/6ea20d1cf569614188dd6772399a14c0" target="_blank" rel="noreferrer" className="cert-item reveal">
              <i className="fa-solid fa-certificate cert-icon"></i>
              <div className="cert-name">{t.cert2_title}</div>
            </a>
            <a href="https://coursera.org/share/f049bb02052c26dd80048a219e6055ca" target="_blank" rel="noreferrer" className="cert-item reveal">
              <i className="fa-solid fa-certificate cert-icon"></i>
              <div className="cert-name">{t.cert1_title}</div>
            </a>
            <a href="https://skillshop.credential.net/82c9e483-e371-408e-84a0-9431d5163b24" target="_blank" rel="noreferrer" className="cert-item reveal">
              <i className="fa-solid fa-certificate cert-icon"></i>
              <div className="cert-name">{t.cert3_title}</div>
            </a>
            <a href="https://coursera.org/share/9a1496ebdd61a54a16f88b975a4b6c23" target="_blank" rel="noreferrer" className="cert-item reveal">
              <i className="fa-solid fa-certificate cert-icon"></i>
              <div className="cert-name">{t.cert4_title}</div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="container contact-container reveal">
          <h2 className="section-title" style={{ marginBottom: "20px" }}>{t.contact_header}</h2>
          <p className="contact-text">{t.contact_subheader}</p>
          <div className="contact-info-row">
            <div className="contact-item">
              <i className="fa-solid fa-envelope"></i>
              <a href="mailto:Lequyphat0123@gmail.com">Lequyphat0123@gmail.com</a>
            </div>
            <div className="contact-item">
              <i className="fa-brands fa-whatsapp"></i>
              <a href="https://wa.me/0862893442" target="_blank" rel="noreferrer">{t.contact_whatsapp}</a>
            </div>
            <div className="contact-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>{t.contact_location_value}</span>
            </div>
          </div>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/cterlqp/" target="_blank" rel="noreferrer" className="social-link"><i className="fab fa-linkedin"></i></a>
            <a href="https://github.com/LQP-CTER" target="_blank" rel="noreferrer" className="social-link"><i className="fab fa-github"></i></a>
            <a href="https://www.facebook.com/phat.lequy.14" target="_blank" rel="noreferrer" className="social-link"><i className="fab fa-facebook"></i></a>
            <a href="https://t.me/CterLQP" target="_blank" rel="noreferrer" className="social-link"><i className="fab fa-telegram"></i></a>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>{t.footer_text}</p>
        </div>
      </footer>

      {/* Modals */}
      <div id="modal-overlay" className={`modal-overlay ${activeModal ? 'active' : ''}`} onClick={handleModalClose}>
        <div id="desc-project-ghn" className={`modal-box ${activeModal === 'desc-project-ghn' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_ghn}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_ghn_title}</h3>
            <p>{t.desc_ghn_content_p1}</p>
            <p>{t.desc_ghn_content_p2}</p>
          </div>
        </div>

        <div id="desc-project-avocado" className={`modal-box ${activeModal === 'desc-project-avocado' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_avocado}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_avocado_title}</h3>
            <p>{t.desc_avocado_content_p1}</p>
            <p>{t.desc_avocado_content_p2}</p>
          </div>
        </div>

        <div id="desc-project-athens" className={`modal-box ${activeModal === 'desc-project-athens' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_athens}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_athens_title}</h3>
            <p>{t.desc_athens_content_p1}</p>
            <p>{t.desc_athens_content_p2}</p>
          </div>
        </div>

        <div id="desc-project7" className={`modal-box ${activeModal === 'desc-project7' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_p7}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_p7_title}</h3>
            <p>{t.desc_p7_content_p1}</p>
            <p>{t.desc_p7_content_p2}</p>
          </div>
        </div>
        
        <div id="desc-project6" className={`modal-box ${activeModal === 'desc-project6' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_p6}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_p6_title}</h3>
            <p>{t.desc_p6_content_p1}</p>
            <p>{t.desc_p6_content_p2}</p>
          </div>
        </div>

        <div id="desc-project5" className={`modal-box ${activeModal === 'desc-project5' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_p5}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_p5_title}</h3>
            <p>{t.desc_p5_content_p1}</p>
            <p>{t.desc_p5_content_p2}</p>
          </div>
        </div>

        <div id="desc-project4" className={`modal-box ${activeModal === 'desc-project4' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_p4}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_p4_title}</h3>
            <p>{t.desc_p4_content_p1}</p>
            <p>{t.desc_p4_content_p2}</p>
          </div>
        </div>

        <div id="desc-project8" className={`modal-box ${activeModal === 'desc-project8' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_p8}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_p8_title}</h3>
            <p>{t.desc_p8_content_p1}</p>
            <p>{t.desc_p8_content_p2}</p>
          </div>
        </div>

        <div id="desc-project3" className={`modal-box ${activeModal === 'desc-project3' ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{t.popup_title_desc_p3}</span>
            <button className="close-modal" onClick={handleModalClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <h3>{t.desc_p3_title}</h3>
            <p>{t.desc_p3_content_p1}</p>
            <p>{t.desc_p3_content_p2}</p>
          </div>
        </div>
      </div>

      {/* Easter Egg Overlay */}
      <div id="easter-egg-overlay" className={`easter-egg-overlay ${eeActive ? 'active' : ''}`} onClick={closeEasterEgg}>
        <div id="easter-egg-text" className="easter-egg-text" style={{ opacity: 1 }}>{eeText}</div>
        <div id="easter-egg-sub" className="easter-egg-sub" style={{ opacity: eeSubVisible ? 1 : 0 }}>(Click anywhere to return)</div>
      </div>

      {/* Chat Widget */}
      <div className="chat-widget-container">
        {!chatOpen && <div className="chat-tooltip" id="chat-tooltip">{t.dock_chat_tooltip}</div>}
        <button className="chat-toggle-btn" onClick={() => setChatOpen(!chatOpen)} style={{ overflow: 'hidden', padding: '10px' }}>
          <img src="/ai-logo.png" alt="AI Chat" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        </button>
        <div className={`chat-window ${chatOpen ? 'active' : ''}`}>
          <div className="chat-header">
            <span className="chat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/ai-logo.png" alt="AI" style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '50%' }} /> {t.chat_title}
            </span>
            <button className="chat-close" onClick={() => setChatOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="chat-messages" id="chat-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`} dangerouslySetInnerHTML={{ __html: (msg.isGreeting ? t.chat_greeting : msg.content).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') }}></div>
            ))}
            {isTyping && (
              <div className="message bot typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            {chatMessages.length === 1 && !isTyping && (
              <div className="quick-replies" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', marginLeft: '10px' }}>
                <button onClick={() => handleSendMessage(t.chat_quick_skills)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '15px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', transition: 'all 0.2s' }}>{t.chat_quick_skills}</button>
                <button onClick={() => handleSendMessage(t.chat_quick_exp)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '15px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', transition: 'all 0.2s' }}>{t.chat_quick_exp}</button>
                <button onClick={() => handleSendMessage(t.chat_quick_contact)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '15px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', transition: 'all 0.2s' }}>{t.chat_quick_contact}</button>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <input 
              type="text" 
              className="chat-input" 
              placeholder={t.chat_placeholder} 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
            />
            <button className="chat-send" onClick={handleSendMessage}><i className="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    </>
  );
}
