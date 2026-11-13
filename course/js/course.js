window.COURSE = {
 "short": "SJ",
 "key": "security-journey-v1",
 "prompt": "$",
 "termTitle": "terminal",
 "where": "SHELL",
 "lab": "python",
 "handsOn": "Defense Lab challenge",
 "errRe": "Traceback|INJECTION|AccessDenied|Failed password|error occurred|Error:|BLOCKED|False$",
 "cats": [
  [
   "all",
   "ALL"
  ],
  [
   "found",
   "FOUNDATIONS"
  ],
  [
   "aws",
   "AWS SECURITY"
  ],
  [
   "web",
   "WEB · API · LLM"
  ],
  [
   "grc",
   "GRC & CAREER"
  ]
 ],
 "catTitle": {
  "found": "SECURITY FOUNDATIONS",
  "aws": "AWS SECURITY (SKILL BUILDER)",
  "web": "WEB, API & LLM SECURITY (HACKSPLAINING)",
  "grc": "GRC & YOUR CAREER"
 },
 "kinds": {
  "cli": [
   "AWS CLI",
   "#1d5bd8"
  ],
  "py": [
   "PYTHON",
   "#7c3aed"
  ],
  "att": [
   "ATTACK",
   "#e11d48"
  ],
  "def": [
   "DEFENSE",
   "#16a34a"
  ],
  "sh": [
   "SHELL",
   "#0d9488"
  ]
 },
 "layers": [
  "MINDSET",
  "NETWORK & OS",
  "IDENTITY",
  "ACCOUNT",
  "APPLICATION",
  "AI",
  "GOVERNANCE"
 ],
 "levels": [
  [
   0,
   "CLOUD PRACTITIONER"
  ],
  [
   150,
   "SECURITY CURIOUS"
  ],
  [
   400,
   "LOG READER"
  ],
  [
   800,
   "THREAT SPOTTER"
  ],
  [
   1300,
   "DEFENDER"
  ],
  [
   2000,
   "SECURITY CHAMPION"
  ],
  [
   2900,
   "CLOUD SECURITY ENGINEER"
  ]
 ],
 "defaultCode": "# Defense Lab: real Python + fake security data. Try:\nprint(nmap_scan.splitlines()[3:6])\nprint(sum(\"Failed password\" in l for l in auth_log.splitlines()), \"failed logins\")\nprint([s[\"Sid\"] for s in ci_policy[\"Statement\"]])\n"
};
COURSE.errRe = new RegExp(COURSE.errRe, "i");
