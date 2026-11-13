window.LESSONS = window.LESSONS || [];
window.R = String.raw;

/* ============ 01 SECURITY MINDSET ============ */
LESSONS.push({
  id: 'mindset', num: 1, cat: 'found', layer: 1, mins: 12,
  title: 'The Security Mindset', short: 'CIA triad, threats, risk, attack vs defense',
  overview: `<p>Security starts with a way of thinking: what are we protecting, from whom, and what happens if it fails? This lesson gives you the vocabulary every security course, interview and certification uses, and the note format of this whole journey: <b>Attack · Defense · In my world</b>.</p>`,
  hook: `<b>Protect C-I-A. Risk = likelihood × impact. Think like the attacker, act like the defender.</b>`,
  why: `Recruiters asked for "security knowledge" for cloud roles. This is the base layer: the words you'll use in every TryHackMe room, Skill Builder course and interview answer.`,
  scene: { type: 'graph', nodes: [
    { id: 'asset', x: 470, y: 240, icon: 'vault', label: 'Asset', sub: 'invoices, keys, uptime' },
    { id: 'c', x: 200, y: 90, icon: 'lock', label: 'Confidentiality', sub: 'only the right eyes' },
    { id: 'i', x: 470, y: 60, icon: 'shield', label: 'Integrity', sub: 'not tampered' },
    { id: 'a', x: 740, y: 90, icon: 'clock', label: 'Availability', sub: 'up when needed' },
    { id: 'att', x: 140, y: 380, icon: 'bug', label: 'Threat actor', sub: 'exploits a weakness', at: 1 },
    { id: 'vuln', x: 470, y: 420, icon: 'key', label: 'Vulnerability', sub: 'weak spot', at: 1 },
    { id: 'ctl', x: 800, y: 380, icon: 'firewall', label: 'Controls', sub: 'prevent · detect · respond', at: 3 }
  ], edges: [{ a: 'asset', b: 'c' }, { a: 'asset', b: 'i' }, { a: 'asset', b: 'a' }, { a: 'att', b: 'vuln', at: 1 }, { a: 'vuln', b: 'asset', at: 1 }, { a: 'ctl', b: 'asset', at: 3 }] },
  steps: [
    { t: 'The CIA triad', sub: 'What security protects',
      body: `<p><b>Confidentiality</b>: only authorized people can see data (leaked customer emails break it).<br><b>Integrity</b>: data isn't changed without permission (an attacker editing invoice totals breaks it).<br><b>Availability</b>: systems work when needed (a DDoS taking the shop offline breaks it).</p><p>Every attack hurts at least one of the three, and every control protects at least one.</p>`,
      analogy: `Your <b>ATM card</b>: only you know the PIN (C), the balance is correct (I), the ATM works at 2 AM (A).`,
      hook: `<b>C = secret, I = correct, A = available.</b>`,
      words: ['confidentiality', 'integrity', 'availability', 'CIA triad', 'asset'],
      flow: { from: 'asset', to: 'c', label: 'PROTECT', detail: ['C: encryption, access control', 'I: hashing, signing', 'A: redundancy, backups'], color: 'blue' }, focus: ['c', 'i', 'a'],
      cmds: [{ c: 'aws s3api get-bucket-encryption --bucket raul-invoices', o: '{ "ServerSideEncryptionConfiguration": { "Rules": [ { "ApplyServerSideEncryptionByDefault": { "SSEAlgorithm": "aws:kms" } } ] } }', k: 'def' }] },
    { t: 'Threat, vulnerability, risk', sub: 'Three words people mix up',
      body: `<p>A <b>vulnerability</b> is a weakness (SSH open to the internet with password login). A <b>threat</b> is something that could exploit it (bots trying passwords). An <b>exploit</b> is the actual technique. <b>Risk</b> is the chance and cost of it happening: <b>likelihood × impact</b>.</p>`,
      analogy: `An <b>unlocked window</b> (vulnerability), a <b>burglar in the barangay</b> (threat), how likely and how bad a break-in would be (risk).`,
      hook: `<b>Vulnerability = weak spot. Threat = who/what could use it. Risk = likelihood × impact.</b>`,
      words: ['vulnerability', 'threat', 'exploit', 'risk', 'threat actor'],
      flow: { from: 'att', to: 'vuln', label: 'EXPLOIT', detail: ['bot → SSH :22', 'password guessing'], color: 'red' }, focus: ['att', 'vuln', 'asset'],
      warn: `<b>Attack:</b> automated bots scan the whole internet within minutes of a new server going online. "Nobody knows my IP" is not a defense.`,
      cmds: [{ c: 'grep -c "Failed password" /var/log/auth.log', o: '11', k: 'att' }] },
    { t: 'Think like an attacker', sub: 'Reconnaissance, initial access, impact',
      body: `<p>Attackers follow a pattern: <b>reconnaissance</b> (scan, search for leaked keys), <b>initial access</b> (a weak password, an injection bug, a leaked key), <b>privilege escalation</b> (get more rights), <b>lateral movement</b>, then <b>impact</b> (steal data, encrypt it, mine crypto). Frameworks like <b>MITRE ATT&CK</b> catalogue these tactics.</p><p>Defenders try to break the chain as early as possible.</p>`,
      analogy: `A burglar <b>cases the street, tries the doors, finds the keys, then empties the safe</b>. Stop them at any step and the burglary fails.`,
      hook: `<b>Recon → access → escalate → move → impact. Break the chain early.</b>`,
      words: ['reconnaissance', 'initial access', 'privilege escalation', 'lateral movement', 'MITRE ATT&CK'],
      flow: { from: 'att', to: 'asset', label: 'KILL CHAIN', detail: ['recon → leaked key → admin → data'], color: 'red' }, focus: ['att', 'vuln', 'asset'],
      cmds: [{ c: 'aws guardduty list-findings --detector-id 12abc --query "length(FindingIds)"', o: '6', k: 'def' }] },
    { t: 'Controls', sub: 'Prevent, detect, respond',
      body: `<p>Controls reduce risk. <b>Preventive</b> controls stop attacks (MFA, least privilege, firewalls). <b>Detective</b> controls notice them (CloudTrail, GuardDuty, log alerts). <b>Corrective / responsive</b> controls limit damage (backups, incident response, auto-remediation). Stack several: <b>defense in depth</b>.</p>`,
      analogy: `A house with a <b>lock</b> (prevent), a <b>CCTV camera</b> (detect) and <b>insurance plus a spare key</b> (respond).`,
      hook: `<b>Prevent · Detect · Respond. Never rely on one.</b>`,
      words: ['preventive control', 'detective control', 'corrective control', 'defense in depth', 'least privilege'],
      flow: { from: 'ctl', to: 'asset', label: 'LAYERS', detail: ['MFA · GuardDuty · backups'], color: 'green' }, focus: ['ctl', 'asset'],
      cmds: [{ c: 'aws iam get-account-summary --query "SummaryMap.AccountMFAEnabled"', o: '1', k: 'def' }] },
    { t: 'Attack · Defense · In my world', sub: 'How every lesson (and note) works',
      body: `<p>Every lesson in this journey, and every note you write in <code>notes/</code>, uses three lines:</p><p><b>Attack:</b> what the attacker does.<br><b>Defense:</b> how you stop it.<br><b>In my world:</b> what it looks like in AWS or in your own stack (FastAPI, Supabase, n8n, Claude).</p><p>The third line is what makes knowledge stick, and what impresses interviewers: you connect theory to real systems you've built.</p>`,
      analogy: `Like learning a <b>basketball play</b>: the opponent's move, your counter, and how your own team runs it.`,
      hook: `<b>Attack → Defense → In my world. Three lines, every time.</b>`,
      words: ['attack', 'defense', 'in my world', 'notes', 'portfolio'],
      focus: ['att', 'ctl', 'asset'],
      cloud: `<b>In my world:</b> an n8n webhook that accepts any request is a vulnerability; bots on the internet are the threat; a secret header check plus rate limiting is the defense.`,
      cmds: [{ c: 'cat notes/hacksplaining/sql-injection.md', o: '- **Attack:** input changes the SQL query\n- **Defense:** parameterized queries\n- **In my world:** Supabase client uses parameters; never build SQL strings in n8n', k: 'sh' }] }
  ],
  summary: { title: 'You think like a defender', sub: 'CIA, risk, kill chain, controls', text: `<p>Security protects confidentiality, integrity and availability. Vulnerabilities are weaknesses, threats exploit them, and risk is likelihood × impact. Attackers move through recon, access, escalation, movement and impact; defenders stack preventive, detective and responsive controls. Every lesson and note follows Attack · Defense · In my world.</p>` },
  quiz: [
    { q: 'An attacker changes invoice totals in your database. Which part of the CIA triad is broken?', a: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'], c: 1, why: 'Unauthorized modification breaks integrity.' },
    { q: 'SSH open to the internet with password login is a…', a: ['Threat', 'Vulnerability', 'Control', 'Impact'], c: 1, why: 'It is a weakness that threats can exploit.' },
    { q: 'Risk is commonly estimated as…', a: ['Cost × time', 'Likelihood × impact', 'Threats + vulnerabilities', 'Controls ÷ assets'], c: 1, why: 'How likely, times how bad.' },
    { q: 'Amazon GuardDuty alerting on suspicious API calls is a…', a: ['Preventive control', 'Detective control', 'Corrective control', 'Physical control'], c: 1, why: 'It detects; it does not block.' }
  ],
  challenge: { task: 'Write cia(event) that returns "C", "I" or "A" for which part of the triad each incident breaks. The checker tests the 6 incidents in the starter.',
    hint: R`def cia(event):
    e = event.lower()
    if any(w in e for w in ["leak", "exposed", "stolen", "read by"]):
        return "C"
    if any(w in e for w in ["changed", "altered", "tampered", "deleted rows"]):
        return "I"
    return "A"

incidents = ["customer emails leaked on a forum", "invoice totals altered by an attacker", "DDoS took the shop offline",
             "S3 bucket exposed publicly", "ransomware encrypted the server so nobody can use it", "log files tampered to hide activity"]
for i in incidents:
    print(cia(i), i)
`,
    starter: R`def cia(event):
    # return "C", "I" or "A"
    return "C"

incidents = ["customer emails leaked on a forum", "invoice totals altered by an attacker", "DDoS took the shop offline",
             "S3 bucket exposed publicly", "ransomware encrypted the server so nobody can use it", "log files tampered to hide activity"]
for i in incidents:
    print(cia(i), i)
`,
    check: '_t(lambda: [cia(i) for i in ["customer emails leaked on a forum","invoice totals altered by an attacker","DDoS took the shop offline","S3 bucket exposed publicly","ransomware encrypted the server so nobody can use it","log files tampered to hide activity"]] == ["C","I","A","C","A","I"])' },
  next: `Attackers start with reconnaissance: what does your server look like from the internet? Next: <b>networking through an attacker's eyes</b>: ports, services, DNS and HTTP.`,
  cheat: [['C · I · A', 'secret · correct · available'], ['risk', 'likelihood × impact'], ['vulnerability / threat / exploit', 'weakness / actor / technique'], ['prevent · detect · respond', 'control types'], ['MITRE ATT&CK', 'catalogue of attacker tactics'], ['Attack · Defense · In my world', 'note format']]
});

/* ============ 02 NETWORKING THROUGH AN ATTACKER'S EYES ============ */
LESSONS.push({
  id: 'network-eyes', num: 2, cat: 'found', layer: 2, mins: 14,
  title: 'Networks Through an Attacker\'s Eyes', short: 'Ports, services, DNS, HTTP, scanning',
  overview: `<p>TryHackMe's Pre Security path starts with how networks work. Here we look at the same ideas from the attacker's side: an IP address and a list of <b>open ports</b> is a map of where to knock. Every open port is a door; your job is to leave open only the doors customers need.</p>`,
  hook: `<b>Every open port is a door. Public: 80/443 only. Everything else: private or closed.</b>`,
  why: `Security groups, NACLs and WAF only make sense once you know ports, protocols and what scanning reveals. "Port 22 open to 0.0.0.0/0" is the classic finding in every cloud audit.`,
  scene: { type: 'graph', nodes: [
    { id: 'bot', x: 100, y: 240, icon: 'bug', label: 'Scanner', sub: 'nmap / bots' },
    { id: 'dns', x: 300, y: 90, icon: 'globe', label: 'DNS', sub: 'name → IP' },
    { id: 'ip', x: 460, y: 240, icon: 'server', label: '203.0.113.10', sub: 'shop server' },
    { id: 'p443', x: 760, y: 70, icon: 'lock', label: '443 https', sub: 'needed ✓' },
    { id: 'p22', x: 820, y: 200, icon: 'terminal', label: '22 ssh', sub: 'admin door', at: 2 },
    { id: 'p3306', x: 820, y: 330, icon: 'disk', label: '3306 mysql', sub: 'database!', at: 2 },
    { id: 'sg', x: 600, y: 420, icon: 'firewall', label: 'Security group', sub: 'allow 443 only', at: 4 }
  ], edges: [{ a: 'bot', b: 'dns' }, { a: 'bot', b: 'ip' }, { a: 'ip', b: 'p443' }, { a: 'ip', b: 'p22', at: 2 }, { a: 'ip', b: 'p3306', at: 2 }, { a: 'sg', b: 'ip', at: 4 }] },
  steps: [
    { t: 'IP, ports and protocols', sub: 'Addresses and doors',
      body: `<p>An <b>IP address</b> finds the machine; a <b>port</b> finds the service on it. TCP ports you'll see constantly: <b>22</b> SSH, <b>80</b> HTTP, <b>443</b> HTTPS, <b>3306</b> MySQL, <b>5432</b> PostgreSQL, <b>6379</b> Redis, <b>3389</b> RDP. <b>TCP</b> is reliable and connection-based (web, SSH); <b>UDP</b> is fire-and-forget (DNS, video).</p>`,
      analogy: `The IP is the <b>building address</b>, the port is the <b>unit number</b>: 443 is the shop's front counter, 3306 is the stockroom.`,
      hook: `<b>22 SSH · 80/443 web · 3306/5432 databases · 3389 RDP · 6379 Redis.</b>`,
      words: ['IP address', 'port', 'TCP', 'UDP', 'service'],
      flow: { from: 'bot', to: 'ip', label: 'CONNECT', detail: ['TCP SYN → :443', 'SYN-ACK = open'], color: 'blue' }, focus: ['ip', 'p443'],
      cmds: [{ c: 'nc -zv shop.example.com 443', o: 'Connection to shop.example.com (203.0.113.10) 443 port [tcp/https] succeeded!', k: 'sh' }] },
    { t: 'DNS and HTTP', sub: 'Names and web requests',
      body: `<p><b>DNS</b> turns <code>shop.example.com</code> into an IP. Attackers enumerate subdomains (<code>dev.</code>, <code>admin.</code>, <code>staging.</code>) looking for forgotten systems. <b>HTTP</b> requests have a method (GET/POST), a path, headers (cookies, tokens) and a body; HTTPS wraps it all in TLS so nobody on the network can read or change it.</p>`,
      analogy: `DNS is the <b>phonebook</b>; a forgotten <b>staging.</b> subdomain is an old back door nobody remembers locking.`,
      hook: `<b>Forgotten subdomains are free targets. HTTPS everywhere.</b>`,
      words: ['DNS', 'subdomain', 'HTTP methods', 'headers', 'TLS'],
      flow: { from: 'bot', to: 'dns', label: 'LOOKUP', detail: ['dig staging.example.com', '→ 203.0.113.44 (old server!)'], color: 'purple' }, focus: ['dns', 'bot'],
      cmds: [{ c: 'dig +short staging.example.com', o: '203.0.113.44', k: 'att' }] },
    { t: 'Port scanning', sub: 'What nmap shows an attacker',
      body: `<p>A <b>port scanner</b> like nmap tries every port and reports which are <b>open</b> (service answering), <b>closed</b> or <b>filtered</b> (a firewall drops the probe). An open database or Redis port on the internet is an emergency: those services were never meant to face it.</p>`,
      analogy: `Someone walking down the hallway <b>trying every door handle</b> and writing down which ones open.`,
      hook: `<b>open = answering · closed = nobody home · filtered = firewall.</b>`,
      words: ['port scan', 'nmap', 'open', 'closed', 'filtered', 'attack surface'],
      flow: { from: 'bot', to: 'p3306', label: 'SCAN', detail: ['3306/tcp open mysql ⚠', '6379/tcp open redis ⚠'], color: 'red' }, focus: ['p22', 'p3306', 'p443'],
      warn: `<b>Attack:</b> only scan systems you own or have written permission to test. Scanning other people's servers can be illegal. TryHackMe gives you legal targets.`,
      cmds: [{ c: 'nmap -sS -p- shop.example.com', o: '22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n3306/tcp open  mysql\n6379/tcp open  redis', k: 'att' }] },
    { t: 'Shrink the attack surface', sub: 'Close every door you don\'t need',
      body: `<p>The <b>attack surface</b> is everything an attacker can reach. Shrink it: databases in <b>private subnets</b>, security groups allowing only 443 from the internet, SSH replaced by <b>Systems Manager Session Manager</b> (no port 22 at all), admin panels behind a VPN or IP allowlist.</p>`,
      analogy: `A shop with <b>one front door and a guard</b> is easier to protect than one with ten unlocked side doors.`,
      hook: `<b>Fewer doors, fewer break-ins. No port 22: use Session Manager.</b>`,
      words: ['attack surface', 'private subnet', 'Session Manager', 'allowlist', 'least exposure'],
      focus: ['ip', 'p22', 'p3306'],
      cloud: `<b>In my world:</b> my FastAPI on EC2 only needs 443 via the load balancer; Supabase/Postgres should never be reachable on 5432 from 0.0.0.0/0.`,
      cmds: [{ c: 'aws ssm start-session --target i-0web1', o: 'Starting session with SessionId: raul-0a1b2c3d4e5f\nsh-5.2$', k: 'def' }] },
    { t: 'Security groups and NACLs', sub: 'AWS firewalls',
      body: `<p><b>Security groups</b> are stateful firewalls on each instance/ENI: allow rules only, return traffic automatic. <b>NACLs</b> are stateless subnet firewalls with allow and deny rules, evaluated in order. Typical: web SG allows 443 from the load balancer SG; DB SG allows 5432 only from the app SG.</p>`,
      analogy: `The SG is the <b>guard at each unit's door</b> who remembers who went in; the NACL is the <b>gate of the whole floor</b> that checks everyone both ways.`,
      hook: `<b>SG = stateful, allow-only, instance. NACL = stateless, allow+deny, subnet.</b>`,
      words: ['security group', 'NACL', 'stateful', 'stateless', 'SG referencing'],
      flow: { from: 'sg', to: 'ip', label: 'ALLOW 443', detail: ['inbound 443 from sg-alb', 'everything else: dropped'], color: 'green' }, focus: ['sg', 'ip'],
      cloud: `Deep dive: <b>VPC Explorer</b> (packet tracer lab).`,
      cmds: [{ c: 'aws ec2 revoke-security-group-ingress --group-id sg-0db --protocol tcp --port 3306 --cidr 0.0.0.0/0', o: '{ "Return": true }', k: 'def' }] }
  ],
  summary: { title: 'You see your network like an attacker', sub: 'Ports, DNS, scanning, surface', text: `<p>IPs find machines and ports find services. Attackers enumerate DNS and scan ports; open databases and admin ports are emergencies. Shrink the attack surface: only 443 public, databases private, SSH replaced by Session Manager, and security groups (stateful) plus NACLs (stateless) enforcing it.</p>` },
  quiz: [
    { q: 'Which port should normally be the only one open to the whole internet on a web server?', a: ['22', '443', '3306', '6379'], c: 1, why: 'HTTPS (443) is what customers need.' },
    { q: 'nmap reports a port as "filtered". This usually means…', a: ['The service is running and answering', 'A firewall is dropping the probe', 'The port is closed', 'The scan succeeded with credentials'], c: 1, why: 'Filtered = no response because something blocks it.' },
    { q: 'Which AWS feature lets you manage an EC2 instance without opening port 22?', a: ['Elastic IP', 'Systems Manager Session Manager', 'Route 53', 'Amazon Inspector'], c: 1, why: 'Session Manager connects through the SSM agent, no inbound port needed.' },
    { q: 'Security groups are…', a: ['Stateless with deny rules', 'Stateful with allow rules only', 'Applied to the whole Region', 'Only for S3'], c: 1, why: 'SGs are stateful allow-lists on instances/ENIs.' }
  ],
  challenge: { task: 'Parse the nmap_scan text. Write open_ports(scan) → sorted list of int ports whose STATE is "open", and risky(scan) → sorted list of open ports that should NOT face the internet (anything except 80 and 443).',
    hint: R`def open_ports(scan):
    ports = []
    for line in scan.splitlines():
        parts = line.split()
        if len(parts) >= 2 and "/tcp" in parts[0] and parts[1] == "open":
            ports.append(int(parts[0].split("/")[0]))
    return sorted(ports)

def risky(scan):
    return [p for p in open_ports(scan) if p not in (80, 443)]

print(open_ports(nmap_scan))
print("close these:", risky(nmap_scan))
`,
    starter: R`print(nmap_scan)

def open_ports(scan):
    # return a sorted list of open TCP ports as ints
    return []

def risky(scan):
    # open ports other than 80 and 443
    return []

print(open_ports(nmap_scan), risky(nmap_scan))
`,
    check: '_t(lambda: open_ports(nmap_scan) == [22, 80, 443, 3306, 6379] and risky(nmap_scan) == [22, 3306, 6379] and risky("443/tcp open https\\n8443/tcp filtered x") == [])' },
  next: `Port 22 was open, and somebody noticed. Next: <b>Linux logs for defenders</b>: reading auth.log to catch a brute-force attack in progress.`,
  cheat: [['22 · 80 · 443 · 3306 · 5432 · 6379 · 3389', 'common ports'], ['open / closed / filtered', 'nmap states'], ['attack surface', 'everything reachable'], ['Session Manager', 'no port 22'], ['SG', 'stateful, allow-only'], ['NACL', 'stateless, allow + deny']]
});

/* ============ 03 LINUX LOGS FOR DEFENDERS ============ */
LESSONS.push({
  id: 'linux-logs', num: 3, cat: 'found', layer: 2, mins: 14,
  title: 'Linux Logs for Defenders', short: 'auth.log, brute force, sudo, journald',
  overview: `<p>Every login attempt, every <code>sudo</code>, every service crash leaves a line in a log. Reading logs is the first real skill of a defender (and of a SOC analyst). This lesson reads <code>/var/log/auth.log</code> during a live SSH brute-force attack and turns what you find into Python detection code.</p>`,
  hook: `<b>Logs are the CCTV of a server. grep first, then automate.</b>`,
  why: `TryHackMe's Linux and SOC rooms, the Google Cybersecurity certificate and every cloud security job involve reading logs. CloudWatch Logs and GuardDuty automate exactly this.`,
  scene: { type: 'graph', nodes: [
    { id: 'bot', x: 100, y: 120, icon: 'bug', label: '45.155.205.9', sub: 'brute force' },
    { id: 'raul', x: 100, y: 380, icon: 'user', label: 'raul', sub: 'publickey ✓' },
    { id: 'sshd', x: 360, y: 240, icon: 'terminal', label: 'sshd', sub: 'port 22' },
    { id: 'log', x: 620, y: 240, icon: 'log', label: '/var/log/auth.log', sub: 'every attempt' },
    { id: 'py', x: 850, y: 110, icon: 'code', label: 'Detection', sub: 'grep / Python', at: 2 },
    { id: 'cw', x: 850, y: 380, icon: 'eye', label: 'CloudWatch / GuardDuty', sub: 'at scale', at: 4 }
  ], edges: [{ a: 'bot', b: 'sshd' }, { a: 'raul', b: 'sshd' }, { a: 'sshd', b: 'log' }, { a: 'log', b: 'py', at: 2 }, { a: 'log', b: 'cw', at: 4 }] },
  steps: [
    { t: 'Where the logs live', sub: '/var/log and journald',
      body: `<p><code>/var/log/auth.log</code> (Ubuntu/Debian) or <code>/var/log/secure</code> (Amazon Linux/RHEL) records logins, sudo and SSH. <code>/var/log/syslog</code> holds general system messages. On systemd systems, <code>journalctl</code> reads the journal: <code>journalctl -u ssh --since "1 hour ago"</code>.</p>`,
      analogy: `The <b>guard's logbook</b> at the gate: who came, when, from where, and whether they were let in.`,
      hook: `<b>auth.log / secure = who tried to get in. journalctl -u = one service's story.</b>`,
      words: ['/var/log/auth.log', '/var/log/secure', 'syslog', 'journalctl', 'systemd'],
      flow: { from: 'sshd', to: 'log', label: 'WRITE', detail: ['Accepted publickey for raul', 'Failed password for root'], color: 'blue' }, focus: ['sshd', 'log'],
      cloud: `Deep dive on the command line: <b>Linux Explorer</b>.`,
      cmds: [{ c: 'sudo tail -n 3 /var/log/auth.log', o: 'Nov 13 03:05:26 web1 sshd[1120]: Failed password for root from 193.32.162.70 port 38126 ssh2\nNov 13 03:06:02 web1 sudo:     raul : TTY=pts/0 ; PWD=/home/raul ; USER=root ; COMMAND=/usr/bin/systemctl restart shop\nNov 13 04:12:40 web1 sshd[1301]: Accepted password for deploy from 45.155.205.9 port 41990 ssh2', k: 'sh' }] },
    { t: 'Spot the brute force', sub: 'Many failures from one IP',
      body: `<p>A <b>brute-force</b> attack tries many passwords quickly. In the log it looks like a burst of <code>Failed password</code> lines from one IP, often for common usernames (<code>root</code>, <code>admin</code>, <code>test</code>, <code>ubuntu</code>) and <code>invalid user</code> entries.</p><p>Count failures per IP and the attacker stands out.</p>`,
      analogy: `Someone trying <b>every key on a giant key ring</b> in your door within one minute.`,
      hook: `<b>Burst of "Failed password" + common usernames + one IP = brute force.</b>`,
      words: ['brute force', 'Failed password', 'invalid user', 'credential stuffing', 'password spraying'],
      flow: { from: 'bot', to: 'sshd', label: 'GUESS ×6', detail: ['root / admin / oracle', '2-second intervals'], color: 'red' }, focus: ['bot', 'sshd', 'log'],
      cmds: [{ c: 'grep "Failed password" /var/log/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -rn', o: '      6 from 45.155.205.9\n      5 from 193.32.162.70\n      1 from 112.198.4.20', k: 'def' }] },
    { t: 'The scariest line', sub: 'A success after the failures',
      body: `<p>Failures are noise; the line to hunt for is an <b>Accepted</b> login from an IP that was just brute-forcing: <code>Accepted password for deploy from 45.155.205.9</code>. That means the attacker <b>got in</b> with a weak password on the <code>deploy</code> account. Time for incident response (lesson 7).</p>`,
      analogy: `Ten failed attempts on the door are annoying. <b>The door opening</b> afterwards is the emergency.`,
      hook: `<b>Failed × N then Accepted from the same IP = compromise.</b>`,
      words: ['successful login', 'compromise', 'indicator of compromise', 'IOC', 'correlation'],
      flow: { from: 'log', to: 'py', label: 'CORRELATE', detail: ['45.155.205.9: 6 failed → 1 accepted ⚠'], color: 'red' }, focus: ['log', 'py'],
      warn: `<b>Attack:</b> the attacker didn't break anything clever: a password login with a guessable password was enabled. Most real breaches are this boring.`,
      cmds: [{ c: 'grep "Accepted" /var/log/auth.log', o: 'Nov 13 01:02:11 web1 sshd[811]: Accepted publickey for raul from 112.198.4.20 port 50122 ssh2\nNov 13 04:12:40 web1 sshd[1301]: Accepted password for deploy from 45.155.205.9 port 41990 ssh2', k: 'att' }] },
    { t: 'Defend the door', sub: 'Keys, no root, fail2ban, no port 22',
      body: `<p><b>Defense:</b> disable password login (<code>PasswordAuthentication no</code>), disable root login (<code>PermitRootLogin no</code>), use SSH keys only, ban repeat offenders (<b>fail2ban</b>), and best of all, close port 22 and use <b>Session Manager</b>. Watch <code>sudo</code> lines too: who became root, and what did they run?</p>`,
      analogy: `Replace the keypad with <b>a key only you have</b>, and brick up the side door entirely.`,
      hook: `<b>Keys only · no root login · fail2ban · or no SSH at all.</b>`,
      words: ['PasswordAuthentication no', 'PermitRootLogin no', 'SSH keys', 'fail2ban', 'sudo audit'],
      flow: { from: 'raul', to: 'sshd', label: 'KEY ONLY', detail: ['publickey ✓', 'password: disabled'], color: 'green' }, focus: ['raul', 'sshd'],
      cmds: [{ c: 'sudo grep -E "^(PasswordAuthentication|PermitRootLogin)" /etc/ssh/sshd_config', o: 'PasswordAuthentication no\nPermitRootLogin no', k: 'def' }] },
    { t: 'At cloud scale', sub: 'CloudWatch Logs and GuardDuty',
      body: `<p>With 50 servers you can't grep each one. Ship logs to <b>CloudWatch Logs</b> (CloudWatch agent), create <b>metric filters</b> ("Failed password" count) and alarms, and query with <b>Logs Insights</b>. <b>GuardDuty</b> detects SSH brute force against EC2 automatically from network flow data.</p>`,
      analogy: `From one guard with a logbook to a <b>central CCTV room</b> watching every gate.`,
      hook: `<b>Central logs + metric filter + alarm. GuardDuty spots brute force for you.</b>`,
      words: ['CloudWatch Logs', 'metric filter', 'Logs Insights', 'GuardDuty', 'centralized logging'],
      flow: { from: 'log', to: 'cw', label: 'SHIP', detail: ['metric filter: "Failed password"', 'alarm > 20/5 min'], color: 'purple' }, focus: ['cw'],
      cloud: `<b>In my world:</b> GuardDuty finding <code>UnauthorizedAccess:EC2/SSHBruteForce</code> is exactly this attack, detected without reading a single log line.`,
      cmds: [{ c: 'aws logs start-query --log-group-name /ec2/auth --start-time 1731456000 --end-time 1731542400 --query-string "filter @message like /Failed password/ | parse @message \\"from * port\\" as ip | stats count() by ip | sort count() desc"', o: '{ "queryId": "8c2e..." }', k: 'def' }] }
  ],
  summary: { title: 'You can read the guard\'s logbook', sub: 'Detect brute force, find the break-in', text: `<p>auth.log (or secure) records every login attempt and sudo. Brute force shows as bursts of failures from one IP; the real alarm is a success from that same IP. Defend with keys only, no root login, fail2ban or no SSH at all (Session Manager), and at scale ship logs to CloudWatch with metric filters and let GuardDuty detect brute force.</p>` },
  quiz: [
    { q: 'On Ubuntu, failed SSH logins are recorded in…', a: ['/var/log/auth.log', '/etc/passwd', '/var/www/html', '/tmp/ssh'], c: 0, why: 'auth.log (secure on Amazon Linux/RHEL).' },
    { q: 'Six failed logins then "Accepted password" from the same IP most likely means…', a: ['A user forgot their password', 'A brute-force attack succeeded', 'The log is broken', 'SSH keys are working'], c: 1, why: 'Failures followed by a success from the attacker IP = compromise.' },
    { q: 'Which sshd setting stops password guessing entirely?', a: ['PermitRootLogin yes', 'PasswordAuthentication no', 'Port 2222', 'X11Forwarding no'], c: 1, why: 'With passwords disabled, only key holders can log in.' },
    { q: 'Which AWS service can detect SSH brute force against EC2 without you reading logs?', a: ['Amazon GuardDuty', 'AWS Budgets', 'Amazon Polly', 'AWS Artifact'], c: 0, why: 'GuardDuty analyzes flow logs, DNS and CloudTrail.' }
  ],
  challenge: { task: 'Write failed_by_ip(log) → dict {ip: number of "Failed password" lines}, and compromised(log, threshold=5) → sorted list of IPs that had at least threshold failures AND later an "Accepted" login.',
    hint: R`import re

def failed_by_ip(log):
    out = {}
    for line in log.splitlines():
        if "Failed password" in line:
            ip = re.search(r"from (\d+\.\d+\.\d+\.\d+)", line).group(1)
            out[ip] = out.get(ip, 0) + 1
    return out

def compromised(log, threshold=5):
    fails = failed_by_ip(log)
    hit = set()
    for line in log.splitlines():
        if "Accepted" in line:
            ip = re.search(r"from (\d+\.\d+\.\d+\.\d+)", line).group(1)
            if fails.get(ip, 0) >= threshold:
                hit.add(ip)
    return sorted(hit)

print(failed_by_ip(auth_log))
print("compromised:", compromised(auth_log))
`,
    starter: R`print(auth_log.splitlines()[1])

def failed_by_ip(log):
    # {ip: count of "Failed password" lines}
    return {}

def compromised(log, threshold=5):
    # IPs with >= threshold failures that also have an "Accepted" line
    return []

print(failed_by_ip(auth_log), compromised(auth_log))
`,
    check: '_t(lambda: failed_by_ip(auth_log) == {"45.155.205.9": 6, "112.198.4.20": 1, "193.32.162.70": 5} and compromised(auth_log) == ["45.155.205.9"] and compromised(auth_log, threshold=7) == [])' },
  next: `On a cloud account, the "password" is often an <b>access key</b>, and the door is IAM. Next: <b>IAM attacks</b>: leaked keys, wildcard policies and privilege escalation.`,
  cheat: [['/var/log/auth.log · /var/log/secure', 'login & sudo logs'], ['journalctl -u ssh', 'one service\'s log'], ['grep | sort | uniq -c', 'count per IP'], ['Failed × N → Accepted', 'compromise'], ['PasswordAuthentication no', 'keys only'], ['CloudWatch metric filter · GuardDuty', 'at scale']]
});
