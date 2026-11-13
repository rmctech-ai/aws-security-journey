window.EXPLAIN = {
"mindset": [
 ["Changing data without permission breaks integrity: the numbers can no longer be trusted.", ["Confidentiality is about who can see data, not whether it changed.", null, "Availability is about the system being usable.", "Authentication is about proving identity, not part of the CIA triad."]],
 ["SSH with password login open to everyone is a weakness, so it is a vulnerability.", ["A threat is who or what might exploit the weakness (bots, attackers).", null, "A control reduces risk; this increases it.", "Impact is the damage if it is exploited."]],
 ["Risk combines how likely something is with how bad it would be: likelihood × impact.", ["Cost and time matter for treatment, not for the risk score itself.", null, "Adding them doesn't measure risk.", "That isn't a standard risk formula."]],
 ["GuardDuty watches activity and raises findings; it doesn't block anything, so it is detective.", ["Preventive controls stop attacks, such as MFA or security groups.", null, "Corrective controls fix or recover, such as backups.", "Physical controls are locks, guards and badges."]]
],
"network-eyes": [
 ["Customers only need HTTPS on 443; everything else should be private or closed.", ["22 (SSH) is an admin door that should not face the internet.", null, "3306 (MySQL) is a database port and must stay private.", "6379 (Redis) has no strong auth by default and must stay private."]],
 ["Filtered means the probe got no answer because a firewall or security group dropped it.", ["An answering service is reported as open.", null, "Closed means the host answered that nothing listens there.", "nmap port states don't involve credentials."]],
 ["Session Manager connects through the SSM agent over outbound HTTPS, so no inbound port 22 is needed.", ["An Elastic IP is just a static public address.", null, "Route 53 is DNS.", "Inspector scans for vulnerabilities."]],
 ["Security groups are stateful and only have allow rules; return traffic is allowed automatically.", ["That describes NACLs.", null, "Security groups attach to ENIs/instances in a VPC.", "They apply to EC2, RDS, Lambda in VPC and more, not S3."]]
],
"linux-logs": [
 ["Ubuntu and Debian log SSH and sudo activity in /var/log/auth.log (Amazon Linux and RHEL use /var/log/secure).", [null, "/etc/passwd lists accounts, not login attempts.", "/var/www/html is web content.", "There is no standard /tmp/ssh log."]],
 ["Many failures followed by a success from the same IP means the guessing worked.", ["One forgetful user doesn't produce a burst of guesses for root, admin and oracle.", null, "The log is recording normally.", "Key logins show as Accepted publickey, not password."]],
 ["With PasswordAuthentication no, only someone holding a private key can log in, so password guessing is pointless.", ["Allowing root login makes things worse.", null, "Changing the port only reduces noise; bots find other ports.", "X11 forwarding is unrelated to login attacks."]],
 ["GuardDuty analyzes VPC Flow Logs, DNS and CloudTrail and reports SSH brute force automatically.", [null, "Budgets tracks spend.", "Polly converts text to speech.", "Artifact provides compliance reports."]]
],
"iam-attacks": [
 ["Assume the key is already in use: deactivate it first, then investigate and clean up.", ["Making the repo private doesn't stop a key that was already copied.", null, "The password doesn't affect access keys.", "Versioning is unrelated to the leaked key."]],
 ["PassRole on * lets the user hand any role, including admin roles, to a new Lambda or EC2 and act as it.", ["Cost is not the problem.", null, "PassRole doesn't touch MFA.", "PassRole doesn't affect CloudTrail."]],
 ["OIDC federation gives the workflow short-lived credentials for a scoped role, with no stored secret to leak.", ["Stored keys are long-lived and leak easily.", null, "Root must never be used for automation.", "Sharing personal keys breaks accountability and least privilege."]],
 ["IAM Access Analyzer finds resources shared outside your account, unused access, and validates policies.", [null, "Polly is text to speech.", "Snowball is physical data transfer.", "Lightsail is simple hosting."]]
],
"account-baseline": [
 ["Root should almost never be used; daily admin work goes through Identity Center or IAM roles.", ["MFA on root is a core baseline item.", "Deleting root access keys is a core baseline item.", null, "A multi-Region CloudTrail trail is a core baseline item."]],
 ["Security Hub runs standards such as AWS FSBP and CIS and shows a security score.", [null, "Macie finds sensitive data in S3.", "Shield protects against DDoS.", "Detective helps investigate findings; it doesn't score standards."]],
 ["Stolen keys are often used for crypto-mining, which first shows up as an unexpected bill.", ["Budgets don't encrypt anything.", null, "Budgets alert; they don't block API calls.", "MFA is configured in IAM."]],
 ["Account-level Block Public Access overrides public ACLs and policies, so buckets can't be made public by accident.", [null, "Encryption is a separate setting.", "It doesn't delete buckets.", "It doesn't affect speed."]]
],
"network-data": [
 ["Referencing the app security group means only the app tier can reach the database.", ["Changing the port hides nothing from a scanner.", null, "A NACL allow rule doesn't remove the open security group.", "Versioning is unrelated to network exposure."]],
 ["Secrets Manager stores and rotates the secret; the function reads it at runtime with its IAM role.", ["Secrets in code leak with every copy of the code.", null, "A public bucket exposes it to everyone.", "Function names are visible metadata."]],
 ["AWS WAF inspects HTTP requests with rules, including managed SQL injection and XSS rule groups.", [null, "Shield Standard protects against network-layer DDoS, not SQLi patterns.", "Inspector scans for software vulnerabilities.", "Config tracks resource configuration."]],
 ["Macie discovers and classifies sensitive data such as PII in S3.", [null, "GuardDuty detects threats from activity.", "KMS manages encryption keys.", "Route 53 is DNS."]]
],
"detect-respond": [
 ["Snapshots preserve the disk as evidence before containment changes anything.", ["Rebooting can destroy volatile evidence.", null, "Deleting CloudTrail destroys evidence and is itself suspicious.", "Changing type doesn't help the investigation."]],
 ["GuardDuty severities from 7.0 to 8.9 are high.", ["Low is 1.0 to 3.9.", "Medium is 4.0 to 6.9.", null, "Informational isn't a GuardDuty severity level."]],
 ["Amazon Detective builds behavior graphs from logs to help investigate findings.", [null, "Budgets tracks spend.", "Lightsail is simple hosting.", "Snowball is physical data transfer."]],
 ["An EventBridge rule can match high-severity GuardDuty findings and invoke a Lambda that contains the instance.", [null, "Route 53 failover is DNS routing.", "Lifecycle rules move or expire S3 objects.", "Artifact provides compliance reports."]]
],
"sql-injection": [
 ["The bug is mixing untrusted input into the SQL text, so the input can change the query's structure.", ["Weak passwords are a different problem.", null, "Disk encryption doesn't stop injection.", "Speed is unrelated."]],
 ["Parameterized queries send the value separately, so it is never parsed as SQL.", [null, "Hiding the port doesn't help; the app itself sends the bad query.", "Passwords are unrelated.", "HTTPS protects the connection, not the query."]],
 ["The injected OR '1'='1' condition is always true, so every row matches.", [null, "The WHERE clause still exists; it is just always true.", "This payload dumps rows; login bypass uses different tricks.", "It is not a real username."]],
 ["AWS WAF's SQL injection managed rule group blocks common payloads at the edge.", [null, "Macie finds sensitive data.", "Backup copies data.", "Inspector scans for vulnerabilities in software."]]
],
"xss-csrf": [
 ["The script was stored and later rendered as HTML for every visitor: stored XSS.", ["SQL injection targets the database query.", null, "CSRF forges requests; it doesn't inject scripts.", "SSRF makes the server fetch URLs."]],
 ["Escaping turns special characters into harmless text in the right context.", [null, "Database encryption doesn't stop scripts in pages.", "Session timeouts don't prevent XSS.", "Rate limiting doesn't stop one malicious comment."]],
 ["The browser attaches the site's cookies to any request to that site, even from another page.", [null, "Password strength doesn't matter; the victim is already logged in.", "TLS doesn't stop a forged request.", "CSRF works with JavaScript on or off (a plain form is enough)."]],
 ["SameSite tells the browser not to send the cookie on cross-site requests.", [null, "Max-Age sets expiry.", "Path limits which URLs get the cookie.", "Domain sets which hosts get the cookie."]]
],
"auth-access": [
 ["Slow salted hashes make cracking expensive and unique per user.", ["Plain text is exposed instantly in a leak.", "MD5 is fast and easily cracked.", null, "A key in the code leaks with the code, so the passwords can be decrypted."]],
 ["The app checked login but not ownership of the object: an IDOR (broken access control).", ["XSS injects scripts.", null, "SQL injection changes queries.", "DDoS overwhelms availability."]],
 ["Reusing leaked pairs from other breaches at scale is credential stuffing.", [null, "Phishing tricks users into giving credentials.", "SSRF makes the server fetch URLs.", "Clickjacking tricks users into clicking hidden elements."]],
 ["A unique salt makes identical passwords hash differently and defeats precomputed tables.", ["Salts don't speed hashing up.", null, "Hashing isn't encryption.", "Salts don't shorten hashes."]]
],
"ssrf-files": [
 ["The attacker makes the server send a request to an internal address: SSRF.", ["XSS runs in browsers.", null, "CSRF forges browser requests to the site.", "SQL injection changes database queries."]],
 ["IMDSv2 requires a PUT request with a header to get a session token, which simple SSRF can't do.", ["Detailed monitoring adds metrics.", null, "Termination protection prevents accidental termination.", "An Elastic IP is a static address."]],
 ["Allowlists only permit what you need, and blocking private and link-local IPs stops internal targets.", ["Blocklists always miss something.", null, "HTTPS alone doesn't prevent internal or attacker hosts.", "Length says nothing about safety."]],
 ["../ sequences walk out of the intended folder: path traversal.", [null, "IDOR is about object IDs, not file paths.", "Prompt injection targets LLMs.", "Clickjacking is a UI trick."]]
],
"api-security": [
 ["Binding all request fields to the model lets attackers set fields like role: mass assignment.", [null, "SSRF fetches URLs.", "XSS injects scripts.", "Rate limiting is a defense, not an attack."]],
 ["API Gateway throttling and usage plans set request rate and burst limits.", [null, "Stages are deployment environments.", "Custom domains are naming.", "Binary media types handle file content."]],
 ["BOLA is the API name for IDOR: missing object-level authorization.", [null, "SQL injection changes queries.", "CSRF forges browser requests.", "DDoS overwhelms availability."]],
 ["An HMAC signature proves the sender knows the shared secret and the body wasn't changed.", ["Headers like User-Agent are trivial to fake.", null, "Size proves nothing.", "A long URL can still leak and be reused."]]
],
"llm-security": [
 ["The instructions arrive inside content the model reads, so it is indirect prompt injection.", ["Direct injection comes from the user's own message.", null, "SQL injection targets databases.", "CSRF forges browser requests."]],
 ["Least privilege for tools and human approval for risky actions limit what any successful injection can do.", ["A longer prompt can still be overridden.", null, "Bigger models are still injectable.", "Hiding the URL is not security."]],
 ["Unescaped model output can contain HTML or scripts that run in the browser: XSS.", [null, "Escaping doesn't change token cost.", "It doesn't make responses faster.", "It is unrelated to DNS."]],
 ["Anything in the context can be repeated by the model, extracted by injection, or logged.", ["Token cost isn't the reason.", null, "Models can read them, which is the problem.", "Speed isn't the reason."]]
],
"grc": [
 ["Insurance moves the financial impact to another party: transfer.", ["Mitigation adds controls.", null, "Acceptance means living with the risk.", "Avoidance means stopping the activity."]],
 ["AWS Artifact provides AWS's own compliance reports and agreements.", [null, "Audit Manager collects your evidence, not AWS's reports.", "Inspector scans for vulnerabilities.", "Trusted Advisor gives best-practice checks."]],
 ["NIST CSF 2.0's functions are Govern, Identify, Protect, Detect, Respond and Recover.", ["Restore is not a CSF function name.", null, "Report is not a CSF function.", "Review is not a CSF function."]],
 ["Score = likelihood × impact = 4 × 5 = 20, a high risk.", ["9 is the sum, not the product.", null, "1 is the difference.", "45 isn't the product of 4 and 5."]]
],
"career": [
 ["STAR is Situation, Task, Action, Result.", ["Risk isn't part of STAR.", null, "Review isn't part of STAR.", "Role isn't part of STAR."]],
 ["Evidence (scores, commands, screenshots, a clear write-up) shows you actually did the work.", ["Listing tools proves nothing.", null, "Certificates help but don't show hands-on work.", "Nobody can evaluate a private repo."]],
 ["Each note has three lines: Attack, Defense and In my world.", ["That's a news format, not the note format.", null, "That's a risk format.", "That's a programming format."]],
 ["Roadmap step 2 is the Skill Builder IAM plan plus the Security Champion path and badge.", ["Security Specialty comes much later.", null, "The Google certificate is in the \"later\" list.", "Penetration testing certs aren't on this roadmap."]]
]
};

/* merge into the lessons (loaded after lessons, before app.js) */
(function (E) { (window.LESSONS || []).forEach(l => { const x = E[l.id]; if (!x || !l.quiz) return; x.forEach((e, i) => { const q = l.quiz[i]; if (!q || !e) return; if (e[0]) q.why = e[0]; if (e[1]) q.w = e[1]; }); }); })(window.EXPLAIN || {});
