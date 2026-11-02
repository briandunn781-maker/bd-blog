// Your personal details. Edit these and the About page, Contact page and footer all update.
export const site = {
  name: "Brian Dunn",
  role: "Web Developer and Engineer",
  location: "Greater Boston Area",
  // Put a photo in client/public (e.g. client/public/me.jpg) and set photo: '/me.jpg'
  photo: "/LinkedInPhoto.jpg",
  // Your email is NOT set here (anything in this file is public). Set CONTACT_EMAIL in server/.env.

  // Each paragraph is a separate string
  bio: [
    "Hi there, and welcome to my website! I'm happy you decided to take the time to see a demo of what I have built as a web developer and engineer. I am 30 years old, with a Masters in Computer Science from Merrimack College. I have 5 years of professional experience, working in healthcare and multimedia, before transitioning into the tech space. I am passionate about building web applications and exploring new technologies. Feel free to get in touch with me! ",
  ],

  // Shown as tabs on the About page. Keep phone numbers and addresses out of here: this file is public.
  resume: {
    experience: [
      {
        company: "Indiana University Health",
        location: "Indianapolis, IN",
        dates: "Aug 2021 – Present",
        roles: ["Consultant, Digital Media Production"],
        bullets: [
          "Create and produce audio and video content for the Clinical Media Design and Development department.",
          "Develop online learning modules using a Learning Management System distributed to IU Health team members.",
          "Expertise with major EMR systems such as Epic and Cerner.",
        ],
      },
      {
        company: "Norwood Community Media",
        location: "Norwood, MA",
        dates: "Oct 2018 – Aug 2021",
        roles: ["Sports Coordinator (promoted Feb 2021)", "Staff Producer (Oct 2018 – Feb 2021)"],
        bullets: [
          "Oversaw all sports content, staffing, and live broadcast production; produced and edited a weekly sports news segment and a monthly original interview show.",
          "Produced live town government meetings, sports, and community events (60–120 minutes); awarded the 2020 Alliance for Community Media Overall Excellence in Public Access Award.",
        ],
      },
    ],
    education: [
      {
        school: "Merrimack College",
        location: "North Andover, MA",
        dates: "May 2026",
        degree: "Master of Science in Computer Science, Concentration: Software Engineering",
        details: ["Relevant coursework: Advanced Algorithms, Database Principles, Software Design and Documentation"],
      },
      {
        school: "University of New Hampshire",
        location: "Durham, NH",
        dates: "May 2018",
        degree: "Bachelor of Arts in Communication",
        details: [],
      },
    ],
    projects: [
      {
        name: "Bank Manager Application",
        tech: "Python",
        bullets: [
          "Designed and implemented a modular, class-based banking system simulating core ATM operations (withdrawals, deposits, transfers) with a command-line interface, applying object-oriented design principles for a maintainable, extensible codebase.",
        ],
      },
      {
        name: "NHL Statistics Database",
        tech: "MySQL, Python",
        bullets: [
          "Built a full application layer with a Tkinter GUI for an NHL player database client, handling both business logic and data entry through manual insert queries.",
        ],
      },
    ],
    skills: [
      { label: "Languages", items: ["Java", "Python", "JavaScript", "HTML5/CSS3", "SQL", "C/C++", "R", "Node.js"] },
      { label: "Frontend", items: ["React", "HTML", "CSS", "JavaScript", "Responsive Design"] },
      { label: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "SQL"] },
      { label: "Tools & Platforms", items: ["Git", "Docker", "Google Cloud Platform", "VS Code", "IntelliJ", "CI/CD"] },
    ],
  },

  // Remove any you don't use
  socials: [
    { label: "GitHub", url: "https://github.com/briandunn781-maker" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/bdunn2026" },
  ],
};
