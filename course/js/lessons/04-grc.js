/* ============ 14 GRC BASICS ============ */
LESSONS.push({
  id: 'grc', num: 14, cat: 'grc', layer: 7, mins: 15,
  title: 'GRC Basics', short: 'Governance, risk, compliance, frameworks',
  overview: `<p>Technical controls answer "how". <b>GRC</b> answers "which, why and who": <b>Governance</b> sets policies and owners, <b>Risk management</b> decides which risks matter most, and <b>Compliance</b> proves you meet a standard (SOC 2, ISO 27001, PCI DSS, the Philippine Data Privacy Act). Cloud makes GRC more technical: controls and evidence can be code.</p>`,
  hook: `<b>Governance = who decides. Risk = what matters most. Compliance = prove it.</b>`,
  why: `GRC engineering is a growing cloud security career path (AJ Yawn's course is on your list), and the CCP exam asks about AWS Artifact, compliance programs and the shared responsibility model.`,
  scene: { type: 'graph', nodes: [
    { id: 'gov', x: 150, y: 110, icon: 'book', label: 'Governance', sub: 'policies, owners' },
    { id: 'risk', x: 470, y: 240, icon: 'list', label: 'Risk register', sub: 'likelihood × impact' },
    { id: 'comp', x: 790, y: 110, icon: 'shield', label: 'Compliance', sub: 'SOC 2, ISO, PCI, DPA' },
    { id: 'treat', x: 150, y: 390, icon: 'process', label: 'Treatment', sub: 'mitigate · transfer · accept · avoid', at: 2 },
    { id: 'aws', x: 790, y: 390, icon: 'cloud', label: 'AWS GRC tools', sub: 'Artifact, Audit Manager, Config', at: 3 }
  ], edges: [{ a: 'gov', b: 'risk' }, { a: 'risk', b: 'comp' }, { a: 'risk', b: 'treat', at: 2 }, { a: 'aws', b: 'comp', at: 3 }] },
  steps: [
    { t: 'Governance', sub: 'Policies, roles, accountability',
      body: `<p><b>Governance</b> is how an organization directs security: written <b>policies</b> (acceptable use, access control, incident response), <b>roles</b> (who owns which system and risk), and <b>oversight</b> (reviews, metrics, audits). Without it, controls are random and nobody is accountable.</p>`,
      analogy: `The <b>barangay ordinances and officials</b>: rules, who enforces them, and who answers when they're broken.`,
      hook: `<b>Policy says what. Owner says who. Review says how well.</b>`,
      words: ['governance', 'security policy', 'accountability', 'risk owner', 'oversight'],
      focus: ['gov'],
      cmds: [{ c: 'aws organizations list-policies --filter SERVICE_CONTROL_POLICY --query "Policies[].Name"', o: '[ "deny-leave-org", "deny-disable-cloudtrail", "allowed-regions" ]', k: 'cli' }] },
    { t: 'Risk management', sub: 'Identify, assess, prioritize',
      body: `<p>List risks in a <b>risk register</b>: what could happen, <b>likelihood</b> (1–5), <b>impact</b> (1–5), score = likelihood × impact, an owner and a treatment. A score of 15+ is high, 8–14 medium, below 8 low. Work the high risks first: budget and time are always limited.</p>`,
      analogy: `A family deciding whether to fix the <b>leaking roof before typhoon season</b> or the squeaky gate.`,
      hook: `<b>Score = L × I. 15+ high · 8–14 medium · under 8 low.</b>`,
      words: ['risk register', 'likelihood', 'impact', 'risk score', 'heat map'],
      flow: { from: 'gov', to: 'risk', label: 'ASSESS', detail: ['R1 leaked CI key: 4 × 5 = 20 HIGH'], color: 'red' }, focus: ['risk'],
      cmds: [{ c: 'column -t -s, risks.csv', o: 'id  risk                         L  I  score\nR1  Leaked CI access key         4  5  20\nR5  Prompt injection in bot      4  3  12', k: 'sh' }] },
    { t: 'Risk treatment', sub: 'Four choices',
      body: `<p>For each risk choose: <b>Mitigate</b> (add controls: MFA, WAF), <b>Transfer</b> (insurance, a managed service, a contract), <b>Accept</b> (low risk, documented and signed off by the owner) or <b>Avoid</b> (stop doing the risky thing: don't store card numbers at all). Residual risk is what remains after treatment.</p>`,
      analogy: `For typhoons: <b>reinforce</b> the roof, <b>insure</b> the house, <b>accept</b> some fallen leaves, or <b>move</b> away from the riverbank.`,
      hook: `<b>Mitigate · Transfer · Accept · Avoid.</b>`,
      words: ['mitigate', 'transfer', 'accept', 'avoid', 'residual risk'],
      flow: { from: 'risk', to: 'treat', label: 'TREAT', detail: ['R2 public bucket → mitigate (Block Public Access)', 'card data → avoid (use a payment provider)'], color: 'amber' }, focus: ['treat', 'risk'],
      cmds: [{ c: 'aws s3control put-public-access-block --account-id 111122223333 --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true', o: '', k: 'def' }] },
    { t: 'Frameworks and compliance', sub: 'NIST CSF, ISO 27001, SOC 2, CIS, PCI, DPA',
      body: `<p><b>NIST CSF 2.0</b>: six functions: Govern, Identify, Protect, Detect, Respond, Recover. <b>ISO/IEC 27001</b>: a certifiable information security management system. <b>SOC 2</b>: an auditor's report on security controls (common for SaaS). <b>CIS Controls/Benchmarks</b>: prescriptive hardening. <b>PCI DSS</b>: card payments. <b>Philippine Data Privacy Act of 2012</b>: personal data in the Philippines, overseen by the National Privacy Commission.</p>`,
      analogy: `Different <b>building codes</b> for houses, hospitals and banks, each with its own inspector.`,
      hook: `<b>NIST CSF: Govern, Identify, Protect, Detect, Respond, Recover.</b>`,
      words: ['NIST CSF 2.0', 'ISO 27001', 'SOC 2', 'CIS Benchmarks', 'PCI DSS', 'Data Privacy Act'],
      flow: { from: 'risk', to: 'comp', label: 'MAP', detail: ['control: MFA → NIST PR.AA, CIS 1.5, SOC 2 CC6.1'], color: 'purple' }, focus: ['comp'],
      cmds: [{ c: 'aws securityhub describe-standards --query "Standards[].Name"', o: '[ "AWS Foundational Security Best Practices v1.0.0", "CIS AWS Foundations Benchmark v3.0.0", "NIST Special Publication 800-53 Revision 5", "PCI DSS v4.0.1" ]', k: 'cli' }] },
    { t: 'GRC on AWS', sub: 'Evidence as code',
      body: `<p><b>AWS Artifact</b>: download AWS's own compliance reports (SOC, ISO, PCI) and agreements. <b>AWS Audit Manager</b>: collects evidence continuously against frameworks. <b>Config conformance packs</b> and <b>Security Hub standards</b>: controls checked automatically. <b>Control Tower</b> and <b>SCPs</b>: guardrails across accounts. Remember shared responsibility: AWS's reports cover the cloud; you prove your part.</p>`,
      analogy: `Instead of photocopying receipts at tax time, a <b>bookkeeper who files every receipt automatically</b>.`,
      hook: `<b>Artifact = AWS's reports. Audit Manager = your evidence. Config/Security Hub = controls as code.</b>`,
      words: ['AWS Artifact', 'Audit Manager', 'conformance pack', 'Control Tower', 'continuous compliance'],
      flow: { from: 'aws', to: 'comp', label: 'EVIDENCE', detail: ['Audit Manager: 142 evidence items', 'Artifact: SOC 2 report'], color: 'green' }, focus: ['aws', 'comp'],
      cloud: `<b>In my world:</b> for automation clients handling Filipino customers' personal data, the Data Privacy Act applies: know what personal data each n8n workflow touches, where it's stored, and who can access it.`,
      cmds: [{ c: 'aws configservice put-conformance-pack --conformance-pack-name cis-baseline --template-s3-uri s3://raul-grc/cis-conformance-pack.yaml', o: '{ "ConformancePackArn": "arn:aws:config:ap-southeast-1:111122223333:conformance-pack/cis-baseline/conformance-pack-a1b2" }', k: 'def' }] }
  ],
  summary: { title: 'You speak GRC', sub: 'Govern, prioritize, prove', text: `<p>Governance sets policies, owners and oversight. Risk management scores risks (likelihood × impact) in a register and treats them: mitigate, transfer, accept or avoid. Compliance maps controls to frameworks (NIST CSF 2.0, ISO 27001, SOC 2, CIS, PCI DSS, the Data Privacy Act). On AWS, Artifact provides AWS's reports, while Audit Manager, Config conformance packs and Security Hub turn your controls and evidence into code.</p>` },
  quiz: [
    { q: 'Buying cyber insurance is which risk treatment?', a: ['Mitigate', 'Transfer', 'Accept', 'Avoid'], c: 1, why: 'Insurance transfers financial impact to another party.' },
    { q: 'Where do you download AWS\'s SOC and ISO compliance reports?', a: ['AWS Artifact', 'AWS Audit Manager', 'Amazon Inspector', 'AWS Trusted Advisor'], c: 0, why: 'Artifact provides AWS compliance documents.' },
    { q: 'The six functions of NIST CSF 2.0 are Govern, Identify, Protect, Detect, Respond and…', a: ['Restore', 'Recover', 'Report', 'Review'], c: 1, why: 'Recover is the sixth function.' },
    { q: 'A risk with likelihood 4 and impact 5 scores…', a: ['9', '20', '1', '45'], c: 1, why: 'Likelihood × impact = 20 (high).' }
  ],
  challenge: { task: 'Write rating(score) → "High" if score >= 15, "Medium" if >= 8, else "Low"; and register(risks) → list of (id, score, rating) tuples sorted by score descending (ties keep the original order), where score = likelihood × impact.',
    hint: R`def rating(score):
    if score >= 15:
        return "High"
    if score >= 8:
        return "Medium"
    return "Low"

def register(risks):
    rows = [(r["id"], r["likelihood"] * r["impact"]) for r in risks]
    rows.sort(key=lambda x: x[1], reverse=True)
    return [(i, s, rating(s)) for i, s in rows]

for row in register(risks):
    print(row)
`,
    starter: R`for r in risks:
    print(r)

def rating(score):
    return "Low"

def register(risks):
    return []
`,
    check: '_t(lambda: register(risks) == [("R1", 20, "High"), ("R3", 15, "High"), ("R5", 12, "Medium"), ("R2", 10, "Medium"), ("R4", 4, "Low")] and rating(8) == "Medium" and rating(7) == "Low" and rating(15) == "High")' },
  next: `Last lesson: turn everything you've learned into a <b>portfolio and a career story</b>, and write your first journey note in code.`,
  cheat: [['G · R · C', 'govern · risk · comply'], ['score = L × I', 'risk register'], ['mitigate · transfer · accept · avoid', 'treatments'], ['NIST CSF 2.0', 'Govern Identify Protect Detect Respond Recover'], ['Artifact · Audit Manager', 'AWS reports · your evidence'], ['Data Privacy Act 2012', 'Philippines, NPC']]
});

/* ============ 15 YOUR SECURITY CAREER ============ */
LESSONS.push({
  id: 'career', num: 15, cat: 'grc', layer: 7, mins: 14,
  title: 'Your Security Journey & Portfolio', short: 'Roadmap, notes, projects, interviews',
  overview: `<p>Knowledge only gets you hired when people can <b>see</b> it. This lesson turns the journey into a plan and a portfolio: the roadmap steps in your repo, notes in the Attack · Defense · In my world format, projects with evidence, and interview stories. The lab writes the note generator for your <code>notes/</code> folder.</p>`,
  hook: `<b>Learn → write the note → build the project → show the evidence → tell the story.</b>`,
  why: `The January job caravan and every cloud security application will ask "what have you done?", not "what have you watched?".`,
  scene: { type: 'graph', nodes: [
    { id: 'ccp', x: 100, y: 240, icon: 'book', label: 'CCP (CLF-C02)', sub: 'Dec 2026' },
    { id: 'sb', x: 300, y: 100, icon: 'key', label: 'Skill Builder', sub: 'IAM plan + Security Champion' },
    { id: 'thm', x: 300, y: 380, icon: 'terminal', label: 'TryHackMe + Hacksplaining', sub: 'hands-on basics' },
    { id: 'proj', x: 540, y: 240, icon: 'blueprint', label: 'Account Baseline project', sub: 'evidence', at: 1 },
    { id: 'notes', x: 760, y: 100, icon: 'file', label: 'notes/', sub: 'Attack · Defense · In my world', at: 2 },
    { id: 'job', x: 860, y: 330, icon: 'users', label: 'Recruiters', sub: 'portfolio + story', at: 3 }
  ], edges: [{ a: 'ccp', b: 'sb' }, { a: 'ccp', b: 'thm' }, { a: 'sb', b: 'proj', at: 1 }, { a: 'thm', b: 'proj', at: 1 }, { a: 'proj', b: 'notes', at: 2 }, { a: 'notes', b: 'job', at: 3 }, { a: 'proj', b: 'job', at: 3 }] },
  steps: [
    { t: 'The roadmap', sub: 'One step at a time',
      body: `<p>1. <b>CCP</b> first (your first AWS cert). 2. <b>Skill Builder</b>: IAM learning plan + Security Champion path and badge. 3. <b>TryHackMe Pre Security</b> + <b>Hacksplaining</b>. 4. <b>Project: Secure AWS Account Baseline</b>. Later: Infrastructure Security and Compliance plans, the Google Cybersecurity certificate, then AWS Security Specialty or Solutions Architect Associate.</p>`,
      analogy: `A <b>jeepney route</b>: fixed stops, in order. Skipping stops gets you lost.`,
      hook: `<b>CCP → Skill Builder (IAM + Champion) → THM + Hacksplaining → Baseline project.</b>`,
      words: ['roadmap', 'AWS Skill Builder', 'Security Champion', 'TryHackMe', 'Hacksplaining'],
      flow: { from: 'ccp', to: 'sb', label: 'NEXT', detail: ['IAM plan → Security Champion badge'], color: 'blue' }, focus: ['ccp', 'sb', 'thm'],
      cmds: [{ c: 'cat README.md | grep -A7 "## Roadmap"', o: '| 1 | AWS Certified Cloud Practitioner (CLF-C02) | In progress |\n| 2 | Skill Builder: IAM learning plan | Planned |\n| 2 | Security Champion path and badge | Planned |\n| 3 | TryHackMe Pre Security path | Planned |\n| 4 | Project: Secure AWS Account Baseline | Planned |', k: 'sh' }] },
    { t: 'Projects with evidence', sub: 'Show, don\'t tell',
      body: `<p>A recruiter-ready security project has: a <b>problem</b> ("a new AWS account is insecure by default"), <b>what you did</b> (commands, templates), <b>evidence</b> (before/after Security Hub score, screenshots, findings fixed), <b>what you learned</b>, and <b>cleanup</b> (resources deleted, cost shown). Keep it in this repo, linked from your hub.</p>`,
      analogy: `A <b>before-and-after renovation album</b> beats a list of tools you own.`,
      hook: `<b>Problem → actions → evidence → lessons → cleanup.</b>`,
      words: ['portfolio', 'evidence', 'write-up', 'before/after', 'GitHub'],
      flow: { from: 'sb', to: 'proj', label: 'BUILD', detail: ['Security Hub 41% → 92%'], color: 'green' }, focus: ['proj'],
      cmds: [{ c: 'ls projects/account-baseline/', o: 'README.md  before-securityhub.png  after-securityhub.png  baseline.yaml  cleanup.md', k: 'sh' }] },
    { t: 'Notes that compound', sub: 'Attack · Defense · In my world',
      body: `<p>After every lesson, room or module, write one short note in <code>notes/&lt;source&gt;/</code>: <b>Attack</b>, <b>Defense</b>, <b>In my world</b>. After 3 months that's 50+ notes: a searchable personal knowledge base, interview prep, and visible proof of consistent learning on GitHub.</p>`,
      analogy: `<b>Daily savings in an alkansya</b>: small coins, big total.`,
      hook: `<b>One note per lesson. Three lines. Every time.</b>`,
      words: ['notes', 'knowledge base', 'consistency', 'GitHub activity', 'learning in public'],
      flow: { from: 'proj', to: 'notes', label: 'WRITE', detail: ['notes/hacksplaining/sql-injection.md'], color: 'purple' }, focus: ['notes'],
      cmds: [{ c: 'find notes -name "*.md" ! -name README.md | wc -l', o: '0', k: 'sh' }] },
    { t: 'Interview stories', sub: 'STAR, with your own systems',
      body: `<p>Answer behavioral and technical questions with <b>STAR</b>: Situation, Task, Action, Result. Example: "My account had no MFA on root and no detection (S). I had to baseline it (T). I enabled MFA, a multi-Region trail, GuardDuty and Security Hub, and fixed the failing controls (A). The score went from 41% to 92% (R)." Practice the classics: secure a new account, respond to a leaked key, explain least privilege, secure an AI agent.</p>`,
      analogy: `A <b>basketball highlight reel</b>: the play, your move, the score.`,
      hook: `<b>Situation · Task · Action · Result, with real numbers.</b>`,
      words: ['STAR method', 'behavioral interview', 'technical interview', 'results', 'storytelling'],
      flow: { from: 'notes', to: 'job', label: 'TELL', detail: ['STAR: baseline 41% → 92%'], color: 'amber' }, focus: ['job', 'proj'],
      cmds: [{ c: 'cat interview/leaked-key.md', o: 'S: CI key found in a public commit\nT: contain within 15 min\nA: deactivated key, CloudTrail lookup, removed new IAM user, OIDC for CI\nR: no data accessed; no long-lived keys since', k: 'sh' }] },
    { t: 'Keep the momentum', sub: 'Small daily steps, visible progress',
      body: `<p>Track progress in the tracker on this repo's home page, keep notes flowing, and publish milestones (badge earned, project shipped) on LinkedIn. Security is a long road; consistency matters more than speed, and every Explorer course in your hub supports a step of this journey.</p>`,
      analogy: `<b>Rice terraces</b> are built one step at a time, and they last for centuries.`,
      hook: `<b>Consistent beats intense. Visible beats private.</b>`,
      words: ['progress tracking', 'learning in public', 'LinkedIn', 'milestones', 'consistency'],
      focus: ['ccp', 'sb', 'thm', 'proj', 'notes', 'job'],
      cloud: `<b>In my world:</b> my Cloud Learning Hub links this journey with IAM, VPC, Cloud Security and Well-Architected Explorer, so recruiters see one connected path.`,
      cmds: [{ c: 'git log --oneline -3 -- notes/', o: 'a1b2c3d notes: hacksplaining xss\nd4e5f6a notes: iam-plan permission boundaries\n0f1e2d3 notes: tryhackme networking basics', k: 'sh' }] }
  ],
  summary: { title: 'Your journey is a plan and a portfolio', sub: 'Roadmap, evidence, notes, stories', text: `<p>Follow the roadmap in order (CCP, Skill Builder IAM plan and Security Champion, TryHackMe and Hacksplaining, the Account Baseline project), turn every lesson into a three-line note, build projects with evidence, tell STAR stories with real numbers, and keep progress visible.</p>` },
  quiz: [
    { q: 'In the STAR method, "R" stands for…', a: ['Risk', 'Result', 'Review', 'Role'], c: 1, why: 'Situation, Task, Action, Result.' },
    { q: 'What makes a security project convincing to recruiters?', a: ['A list of tools you have heard of', 'Evidence such as before/after scores, commands and a write-up', 'A long certificate list only', 'A private repo nobody can see'], c: 1, why: 'Evidence shows you did the work.' },
    { q: 'The three lines of every journey note are…', a: ['Who, what, when', 'Attack, Defense, In my world', 'Problem, cost, owner', 'Input, output, error'], c: 1, why: 'That is this repo\'s note format.' },
    { q: 'Which step comes right after the CCP exam on this roadmap?', a: ['AWS Security Specialty', 'Skill Builder IAM plan and Security Champion path', 'Google Cybersecurity certificate', 'Penetration testing certification'], c: 1, why: 'Roadmap step 2.' }
  ],
  challenge: { task: 'Write note(topic, attack, defense, world) → the markdown note "# {topic}\\n\\n- **Attack:** {attack}\\n- **Defense:** {defense}\\n- **In my world:** {world}\\n", raising ValueError if any part is empty or only spaces; and progress(roadmap) → int percent of steps whose status is "done" (rounded down, 0 for an empty list).',
    hint: R`def note(topic, attack, defense, world):
    parts = [topic, attack, defense, world]
    if any(not p or not p.strip() for p in parts):
        raise ValueError("every part of the note is required")
    return f"# {topic}\n\n- **Attack:** {attack}\n- **Defense:** {defense}\n- **In my world:** {world}\n"

def progress(roadmap):
    if not roadmap:
        return 0
    done = sum(1 for s in roadmap if s["status"] == "done")
    return done * 100 // len(roadmap)

print(note("SQL injection", "input changes the SQL query", "parameterized queries",
           "Supabase client and n8n Postgres node use parameters"))
print(progress([{"step": "CCP", "status": "done"}, {"step": "IAM plan", "status": "planned"}, {"step": "Champion", "status": "planned"}]))
`,
    starter: R`def note(topic, attack, defense, world):
    return ""

def progress(roadmap):
    return 0
`,
    check: '_t(lambda: note("XSS", "script in a comment", "escape output", "Jinja2 autoescape") == "# XSS\\n\\n- **Attack:** script in a comment\\n- **Defense:** escape output\\n- **In my world:** Jinja2 autoescape\\n" and _raises(lambda: note("a", " ", "c", "d"), ValueError) and _raises(lambda: note("", "b", "c", "d"), ValueError) and progress([{"status": "done"}, {"status": "planned"}, {"status": "done"}]) == 66 and progress([]) == 0)' },
  next: `You've completed the Security Journey Explorer. Write your first real note in <code>notes/</code>, tick the tracker, and when the CCP exam is behind you, start roadmap step 2.`,
  cheat: [['CCP → IAM plan + Champion → THM + Hacksplaining → Baseline', 'roadmap'], ['problem · actions · evidence · lessons · cleanup', 'project write-up'], ['Attack · Defense · In my world', 'note format'], ['STAR', 'interview stories'], ['one note per lesson', 'compounding'], ['visible progress', 'tracker + LinkedIn']]
});
