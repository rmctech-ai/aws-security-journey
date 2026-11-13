/* Cloud Security lab prelude (loaded after sls_prelude.js): security datasets + IAM/EC2/S3/CloudTrail calls on the fake boto3. */
window.PY_PRELUDE = (window.PY_PRELUDE || '') + String.raw`

import json as _json, csv as _csv, io as _io, datetime as _dt, copy as _copy

def _log(svc, op, **kw):
    boto3.AWS_CALLS.append({"service": svc, "op": op, **_copy.deepcopy(kw)})

_C = type(boto3.client("x"))
def _mk(svc, op, ret=None, need=()):
    def f(self, **kw):
        miss = [k for k in need if k not in kw]
        if miss: raise ClientError("ValidationError", f"Missing required parameter: {miss[0]}")
        _log(svc, op, **kw); return dict(ret or {})
    return f
for _n, _s, _o, _need in [
    ("update_access_key", "iam", "UpdateAccessKey", ("UserName", "AccessKeyId", "Status")),
    ("delete_access_key", "iam", "DeleteAccessKey", ("UserName", "AccessKeyId")),
    ("put_user_policy", "iam", "PutUserPolicy", ("UserName", "PolicyName", "PolicyDocument")),
    ("attach_user_policy", "iam", "AttachUserPolicy", ("UserName", "PolicyArn")),
    ("delete_login_profile", "iam", "DeleteLoginProfile", ("UserName",)),
    ("revoke_security_group_ingress", "ec2", "RevokeSecurityGroupIngress", ("GroupId",)),
    ("create_snapshot", "ec2", "CreateSnapshot", ("VolumeId",)),
    ("modify_instance_attribute", "ec2", "ModifyInstanceAttribute", ("InstanceId",)),
    ("put_public_access_block", "s3", "PutPublicAccessBlock", ("Bucket", "PublicAccessBlockConfiguration")),
    ("put_bucket_encryption", "s3", "PutBucketEncryption", ("Bucket", "ServerSideEncryptionConfiguration")),
    ("start_logging", "cloudtrail", "StartLogging", ("Name",)),
]:
    setattr(_C, _n, _mk(_s, _o, need=_need))
def _list_access_keys(self, UserName, **kw):
    _log("iam", "ListAccessKeys", UserName=UserName)
    return {"AccessKeyMetadata": [k for k in _KEYS if k["UserName"] == UserName]}
_C.list_access_keys = _list_access_keys
_KEYS = [{"UserName": "dev-maria", "AccessKeyId": "AKIAEXAMPLEMARIA001", "Status": "Active"},
         {"UserName": "ci-legacy", "AccessKeyId": "AKIAEXAMPLELEGACY01", "Status": "Active"},
         {"UserName": "ci-legacy", "AccessKeyId": "AKIAEXAMPLELEGACY02", "Status": "Inactive"}]

TODAY = _dt.date(2026, 11, 13)

def _ev(eid, name, src, user, ip, t, region="ap-southeast-1", err=None, mfa=None, utype="IAMUser", params=None, resp=None):
    e = {"eventID": eid, "eventTime": t, "eventName": name, "eventSource": src, "awsRegion": region,
         "sourceIPAddress": ip, "userIdentity": {"type": utype, "userName": user, "arn": f"arn:aws:iam::111122223333:{'root' if utype == 'Root' else 'user/' + user}"},
         "requestParameters": params or {}, "responseElements": resp}
    if err: e["errorCode"] = err; e["errorMessage"] = "User is not authorized to perform this operation"
    if mfa is not None: e["additionalEventData"] = {"MFAUsed": "Yes" if mfa else "No"}
    return e

cloudtrail = [
    _ev("e01", "ConsoleLogin", "signin.amazonaws.com", "raul", "112.198.10.4", "2026-11-12T01:02:11Z", mfa=True, resp={"ConsoleLogin": "Success"}),
    _ev("e02", "GetObject", "s3.amazonaws.com", "dev-maria", "112.198.10.9", "2026-11-12T02:15:40Z", params={"bucketName": "raul-reports"}),
    _ev("e03", "ListBuckets", "s3.amazonaws.com", "ci-legacy", "185.220.101.7", "2026-11-12T03:40:02Z"),
    _ev("e04", "GetSecretValue", "secretsmanager.amazonaws.com", "ci-legacy", "185.220.101.7", "2026-11-12T03:40:09Z", err="AccessDenied"),
    _ev("e05", "ListUsers", "iam.amazonaws.com", "ci-legacy", "185.220.101.7", "2026-11-12T03:40:15Z", err="AccessDenied"),
    _ev("e06", "CreateAccessKey", "iam.amazonaws.com", "ci-legacy", "185.220.101.7", "2026-11-12T03:41:00Z", params={"userName": "raul"}, err="AccessDenied"),
    _ev("e07", "RunInstances", "ec2.amazonaws.com", "ci-legacy", "185.220.101.7", "2026-11-12T03:42:30Z", region="us-east-1", params={"instanceType": "p4d.24xlarge", "maxCount": 8}),
    _ev("e08", "StopLogging", "cloudtrail.amazonaws.com", "ci-legacy", "185.220.101.7", "2026-11-12T03:43:05Z", params={"name": "org-trail"}),
    _ev("e09", "ConsoleLogin", "signin.amazonaws.com", "root", "45.83.64.1", "2026-11-12T04:10:00Z", mfa=False, utype="Root", resp={"ConsoleLogin": "Success"}),
    _ev("e10", "PutBucketPolicy", "s3.amazonaws.com", "dev-maria", "112.198.10.9", "2026-11-12T05:01:12Z", params={"bucketName": "raul-public-site"}),
    _ev("e11", "GetObject", "s3.amazonaws.com", "dev-maria", "112.198.10.9", "2026-11-12T05:20:44Z", params={"bucketName": "raul-reports"}),
    _ev("e12", "DescribeInstances", "ec2.amazonaws.com", "raul", "112.198.10.4", "2026-11-12T06:00:00Z"),
    _ev("e13", "DeleteTrail", "cloudtrail.amazonaws.com", "dev-maria", "112.198.10.9", "2026-11-12T06:30:00Z", params={"name": "test-trail"}, err="AccessDenied"),
    _ev("e14", "AuthorizeSecurityGroupIngress", "ec2.amazonaws.com", "dev-maria", "112.198.10.9", "2026-11-12T07:05:00Z", params={"groupId": "sg-0db", "cidrIp": "0.0.0.0/0", "fromPort": 5432}),
]

credential_report = """user,arn,password_enabled,mfa_active,access_key_1_active,access_key_1_last_rotated,access_key_1_last_used_date
<root_account>,arn:aws:iam::111122223333:root,not_supported,true,false,N/A,N/A
raul,arn:aws:iam::111122223333:user/raul,true,true,false,N/A,N/A
dev-maria,arn:aws:iam::111122223333:user/dev-maria,true,false,true,2026-09-30,2026-11-12
ci-legacy,arn:aws:iam::111122223333:user/ci-legacy,false,false,true,2025-02-01,2026-11-12
ops-jun,arn:aws:iam::111122223333:user/ops-jun,true,false,false,N/A,N/A
audit-bot,arn:aws:iam::111122223333:user/audit-bot,false,false,true,2026-10-20,2026-11-13
"""

buckets = [
    {"name": "raul-reports", "encryption": "aws:kms", "public_access_block": True, "versioning": True, "policy_public": False},
    {"name": "raul-public-site", "encryption": "AES256", "public_access_block": False, "versioning": False, "policy_public": True},
    {"name": "raul-backups", "encryption": None, "public_access_block": True, "versioning": True, "policy_public": False},
    {"name": "raul-logs", "encryption": "aws:kms", "public_access_block": True, "versioning": True, "policy_public": False},
    {"name": "raul-tmp", "encryption": None, "public_access_block": False, "versioning": False, "policy_public": False},
]

security_groups = [
    {"GroupId": "sg-0web", "GroupName": "web", "IpPermissions": [{"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}]},
    {"GroupId": "sg-0ssh", "GroupName": "bastion", "IpPermissions": [{"IpProtocol": "tcp", "FromPort": 22, "ToPort": 22, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}]},
    {"GroupId": "sg-0db", "GroupName": "postgres", "IpPermissions": [{"IpProtocol": "tcp", "FromPort": 5432, "ToPort": 5432, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}]},
    {"GroupId": "sg-0app", "GroupName": "app", "IpPermissions": [{"IpProtocol": "tcp", "FromPort": 8080, "ToPort": 8080, "IpRanges": [{"CidrIp": "10.0.0.0/16"}]}]},
    {"GroupId": "sg-0all", "GroupName": "temp-debug", "IpPermissions": [{"IpProtocol": "-1", "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}]},
    {"GroupId": "sg-0rdp", "GroupName": "windows", "IpPermissions": [{"IpProtocol": "tcp", "FromPort": 3389, "ToPort": 3389, "IpRanges": [{"CidrIp": "203.0.113.5/32"}]}]},
]

guardduty_findings = [
    {"Id": "f1", "Type": "UnauthorizedAccess:IAMUser/TorIPCaller", "Severity": 5.0, "Title": "API called from a Tor exit node", "Resource": "ci-legacy"},
    {"Id": "f2", "Type": "CryptoCurrency:EC2/BitcoinTool.B!DNS", "Severity": 8.0, "Title": "EC2 instance querying a crypto-mining domain", "Resource": "i-0abc123"},
    {"Id": "f3", "Type": "Recon:IAMUser/MaliciousIPCaller", "Severity": 5.0, "Title": "Reconnaissance API calls from a known malicious IP", "Resource": "ci-legacy"},
    {"Id": "f4", "Type": "Stealth:IAMUser/CloudTrailLoggingDisabled", "Severity": 2.0, "Title": "CloudTrail logging was disabled", "Resource": "org-trail"},
    {"Id": "f5", "Type": "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS", "Severity": 8.5, "Title": "EC2 instance credentials used from outside AWS", "Resource": "i-0abc123"},
    {"Id": "f6", "Type": "Policy:IAMUser/RootCredentialUsage", "Severity": 2.0, "Title": "Root credentials were used", "Resource": "root"},
    {"Id": "f7", "Type": "Discovery:S3/AnomalousBehavior", "Severity": 7.2, "Title": "Unusual S3 ListObjects volume", "Resource": "raul-reports"},
]

sg_event = {"version": "0", "source": "aws.ec2", "detail-type": "AWS API Call via CloudTrail", "region": "ap-southeast-1",
            "detail": {"eventName": "AuthorizeSecurityGroupIngress", "userIdentity": {"userName": "dev-maria"},
                       "requestParameters": {"groupId": "sg-0db", "ipPermissions": {"items": [{"ipProtocol": "tcp", "fromPort": 5432, "toPort": 5432, "ipRanges": {"items": [{"cidrIp": "0.0.0.0/0"}]}}]}}}}
`;
