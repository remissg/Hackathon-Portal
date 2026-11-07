# **MatruCare AI** 

_Internship Programme  •  Full Stack Developer Track_ matrucareai@gmail.com 

Issued: May 24, 2026 

## **ASSIGNMENT BRIEF — HACKATHON PORTAL** 

Role: Full Stack Developer Intern Stack: MERN + Nodemailer Level: Intermediate 

### **PROJECT OVERVIEW** 

You are required to design and develop a fully functional **Hackathon Registration Portal** using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with complete **CRUD operations** . The platform will allow participants to register, verify identity via OTP, log in to a personal dashboard, and register for a hackathon event with full team management. Confirmation emails must be sent via **Nodemailer** from **matrucareai@gmail.com** . 

### **TECHNOLOGY STACK** 

|**Layer**|**Technology**|**Purpose**|
|---|---|---|
|Frontend|React.js + Tailwind CSS / Material UI|UI Components & Routing|
|Backend|Node.js + Express.js|REST API & Business Logic|
|Database|MongoDB + Mongoose|Data Persistence & Schemas|
|Auth|JWT + bcrypt|Secure Authentication|
|Email|Nodemailer (matrucareai@gmail.com)|OTP & Confirmation Mails|
|OTP|Custom 6-digit OTP Generator|Email Verification|



### **REQUIRED COMPONENTS / PAGES** 

|**#**|**Component**|**Description**|
|---|---|---|
|1|**Home**|Landing page: hero section, event highlights, timeline, prizes & CTA buttons (Register Now /<br>Login).|
|||Responsive navigation: Logo (MatruCare AI), links to Home, About, Contact, Login, Signup.|
|2|**Navbar**|Mobile hamburger menu.|
|||Company footer with copyright, social links, contact email (matrucareai@gmail.com), and|
|3|**Footer**|quick-nav.|



|4|**Signup**|Registration: Full Name, Email, Password, Confirm Password. On submit→send OTP to<br>email→redirect to OTP verification.|
|---|---|---|
|5|**OTP Verify**|6-digit OTP input. Verify OTP→mark account as verified in DB→redirect to Login page.<br>Include Resend OTP.|
|6|**Login**|Email + Password login. On success→generate JWT→redirect to Dashboard.|
|7|**Dashboard**|Private route. Shows user profile + registered event details. If NOT registered→'Register<br>Now' button linking to Registration Form.|
|8|**Registration**|Full hackathon registration form (see Form Fields section). Dynamic team member entry. On<br>submit→save to DB + send confirmation email.|
|9|**Contact**|Contact form: Name, Email, Message. Company email: matrucareai@gmail.com.|



### **HACKATHON REGISTRATION FORM FIELDS** 

The Registration Page must collect the following fields. All fields are **mandatory** unless marked optional. 

|**#**|**Field Label**|**Input Type**|**Notes / Validation**|
|---|---|---|---|
|1|Full Name|Text Input|Min 3 chars, letters only|
|2|Email Address|Email Input|Valid email, pre-filled from auth session|
|3|Mobile Number|Number Input|10-digit Indian mobile number|
|4|College Name|Dropdown / Select|Pre-defined list of colleges|
|5|Course|Dropdown / Select|B.Tech, M.Tech, BCA, MCA, BSc, etc.|
|6|Branch|Dropdown / Select|CSE, IT, ECE, ME, CE, etc.|
|7|Year of Study|Dropdown / Select|1st, 2nd, 3rd, 4th year|
|8|Domain / Track|Dropdown / Select|AI/ML, Web Dev, IoT, Cyber Security, Blockchain, etc.|
|9|Project Name|Text Input|Min 5 characters|
|10|PPT Link|URL Input|Google Drive / OneDrive shareable link|
|11|Prototype Link|URL Input|GitHub / Figma / live demo link|
|12|Demo Video Link|URL Input|YouTube / Drive link (Optional)|
|13|Team Size|Number Select (1-5)|Dynamically renders member entry boxes below|
||||For each member: Member Name + Member Email (based|
|14|Team Members|Dynamic Fields|on Team Size)|



**Dynamic Team Members:** When Team Size is selected (e.g., 3), the form dynamically renders 3 entry boxes — each asking for **Member Name** and **Member Email** . Team Size = 1 means solo (no extra member boxes). 

### **USER FLOW & AUTHENTICATION LOGIC** 

|**Step 1 — Signup**|User fills Signup form→Backend creates unverified account→OTP generated→<br>OTP emailed via Nodemailer (matrucareai@gmail.com)→Redirect to OTP<br>Verification page.|
|---|---|
|**Step 2 — OTP Verify**|User enters 6-digit OTP→Backend verifies (time-limited: 10 min)→Mark user as<br>verified in MongoDB→Redirect to Login page.|
|**Step 3 — Login**|User enters Email + Password→bcrypt.compare()→JWT issued→Stored in<br>localStorage/httpOnly cookie→Redirect to Dashboard.|
||Protected route (JWT guard). Displays user profile. If no hackathon registration found|
|**Step 4 — Dashboard**|→Show 'Register Now' CTA.|
||User fills Hackathon Registration Form→On Submit: save to DB→send|
|**Step 5 — Registration**|confirmation email with event + team details via Nodemailer→Show success screen.|
|**Step 6 — Logout**|Clear JWT token from storage→Redirect to Home page.|



### **NODEMAILER EMAIL CONFIGURATION** 

|**Email**|**Trigger Event**|**Email Content**|
|---|---|---|
|||6-digit OTP with 10-minute expiry. Sender|
|matrucareai@gmail.com|User Signup (OTP)|Name: MatruCare AI|
|||Confirmation with participant name, event, team|
|matrucareai@gmail.com|Hackathon Registration|details, domain, project name|



**Important:** Do NOT include any candidate name or personal sender name in emails. Always use **MatruCare AI** as sender name and **matrucareai@gmail.com** as the from address. Enable Gmail App Passwords for SMTP authentication in Nodemailer. 

### **CRUD OPERATIONS — API ENDPOINTS** 

|**Operation**|**Endpoint**|**Description**|
|---|---|---|
|CREATE — Register|POST /api/auth/signup|Create new user account|
|CREATE — OTP Verify|POST /api/auth/verify-otp|Verify OTP, activate account|
|READ — Login|POST /api/auth/login|Authenticate user, return JWT|
|READ — Profile|GET /api/user/me|Fetch logged-in user's profile (protected)|
|CREATE — Hackathon|POST /api/hackathon/register|Submit hackathon registration form|
|READ — My Entry|GET /api/hackathon/my-entry|Fetch user's hackathon registration|
|UPDATE — Profile|PUT /api/user/update|Update user details (optional)|



DELETE — Entry 

DELETE /api/hackathon/:id 

Delete registration (admin / optional) 

### **DELIVERABLES & SUBMISSION** 

|**GitHub Repository**|Public repo with /client (React) and /server (Node/Express) folders. Include a detailed<br>README.md.|
|---|---|
|**Live Deployment**|Frontend on Vercel/Netlify. Backend on Render/Railway. Share both live URLs.|
|**Environment Vars**|Use .env for all secrets (MONGO_URI, JWT_SECRET, EMAIL_PASS). Include<br>.env.example in repo.|
|**README.md**|Must include: project overview, tech stack, setup steps, API docs, .env guide, and<br>screenshots.|
|**Demo Video**|3–5 min screen recording covering: signup→OTP→login→dashboard→registration<br>→confirmation email.|



### **EVALUATION CRITERIA** 

|**Criteria**|**Marks**|
|---|---|
|Functional Completeness (all flows working end-to-end)|30|
|Code Quality, Structure & Readability|20|
|UI/UX Design & Responsiveness (mobile + desktop)|20|
|Authentication & Security (JWT, bcrypt, OTP expiry)|15|
|Nodemailer Integration (OTP email + Confirmation email)|10|
|README, Deployment & Demo Video<br>**Total**|5<br>**100**|



### **IMPORTANT RULES & GUIDELINES** 

- Do **NOT** include any candidate name or personal information in email templates. 

- Always use **MatruCare AI** as the sender name and **matrucareai@gmail.com** as the from address. 

- All routes except Home, Login, Signup must be **protected routes** (JWT middleware guard). 

- Passwords must be **hashed** using bcrypt before storing in MongoDB. Never store plain-text passwords. 

- OTPs must be **time-limited** (expire after 10 minutes) and invalidated after first use. 

- Use **.env** for all secrets. Never hardcode credentials or API keys in source code. • Code must be **well-commented** and follow consistent naming conventions (camelCase). • The application must be **fully responsive** — tested on mobile, tablet, and desktop. • Plagiarism or code copied from other interns will result in **immediate disqualification** . 

MatruCare AI | matrucareai@gmail.com | Full Stack Developer Internship Programme 

