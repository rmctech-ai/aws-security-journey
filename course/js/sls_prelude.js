/* Serverless lab prelude: a tiny in-memory AWS (fake boto3), a Lambda context, sample events and invoke(). */
window.PY_PRELUDE = String.raw`
import sys, types, json, time, uuid, copy, base64

if 'boto3' not in sys.modules:
    AWS_CALLS = []
    _DDB, _S3, _SECRETS = {}, {}, {"prod/db": json.dumps({"username": "app", "password": "s3cr3t-from-vault"}), "prod/api-key": "sk-live-123"}

    class ClientError(Exception):
        def __init__(self, code, msg=""):
            super().__init__(f"An error occurred ({code}) when calling the operation: {msg}")
            self.response = {"Error": {"Code": code, "Message": msg}}

    def _log(svc, op, **kw):
        AWS_CALLS.append({"service": svc, "op": op, **copy.deepcopy(kw)})

    class _Cond:
        def __init__(self, kind, name):
            self.kind, self.name = kind, name

    def _check_cond(expr, item):
        if expr is None: return True
        if isinstance(expr, _Cond):
            return (expr.name not in (item or {})) if expr.kind == "not_exists" else (expr.name in (item or {}))
        if isinstance(expr, str):
            e = expr.replace(" ", "")
            if e.startswith("attribute_not_exists("): return expr.split("(")[1].split(")")[0].strip() not in (item or {})
            if e.startswith("attribute_exists("): return expr.split("(")[1].split(")")[0].strip() in (item or {})
        return True

    class Attr:
        def __init__(self, name): self.name = name
        def not_exists(self): return _Cond("not_exists", self.name)
        def exists(self): return _Cond("exists", self.name)
        def eq(self, v): return ("eq", self.name, v)

    class Key:
        def __init__(self, name): self.name = name
        def eq(self, v): return ("eq", self.name, v)
        def begins_with(self, v): return ("begins_with", self.name, v)

    class Table:
        def __init__(self, name):
            self.name = name; self.table_name = name
            _DDB.setdefault(name, {})
        def _key(self, item):
            ks = [k for k in ("pk", "PK", "id", "orderId", "invoiceId", "userId") if k in item]
            if not ks: raise ClientError("ValidationException", "The provided key element does not match the schema")
            k = ks[0]; sk = next((s for s in ("sk", "SK") if s in item), None)
            return (item[k], item[sk]) if sk else (item[k],)
        def put_item(self, Item, ConditionExpression=None, **kw):
            k = self._key(Item); cur = _DDB.setdefault(self.name, {}).get(k)
            if not _check_cond(ConditionExpression, cur):
                _log("dynamodb", "PutItem", table=self.name, item=Item, failed=True)
                raise ClientError("ConditionalCheckFailedException", "The conditional request failed")
            _DDB.setdefault(self.name, {})[k] = copy.deepcopy(Item); _log("dynamodb", "PutItem", table=self.name, item=Item)
            return {"ResponseMetadata": {"HTTPStatusCode": 200}}
        def get_item(self, Key, **kw):
            _log("dynamodb", "GetItem", table=self.name, key=Key)
            it = _DDB.setdefault(self.name, {}).get(self._key(Key))
            return {"Item": copy.deepcopy(it)} if it else {}
        def delete_item(self, Key, **kw):
            _log("dynamodb", "DeleteItem", table=self.name, key=Key); _DDB.setdefault(self.name, {}).pop(self._key(Key), None); return {}
        def update_item(self, Key, UpdateExpression="", ExpressionAttributeValues=None, ExpressionAttributeNames=None, ConditionExpression=None, ReturnValues=None, **kw):
            k = self._key(Key); it = _DDB.setdefault(self.name, {}).get(k)
            if not _check_cond(ConditionExpression, it): raise ClientError("ConditionalCheckFailedException", "The conditional request failed")
            it = it or dict(Key); vals = ExpressionAttributeValues or {}; names = ExpressionAttributeNames or {}
            expr = UpdateExpression.strip()
            if expr.upper().startswith("SET"):
                for part in expr[3:].split(","):
                    a, b = [x.strip() for x in part.split("=", 1)]; a = names.get(a, a)
                    if "+" in b:
                        x, y = [t.strip() for t in b.split("+")]; base_ = it.get(names.get(x, x), 0) if not x.startswith(":") else vals[x]
                        it[a] = base_ + (vals[y] if y.startswith(":") else it.get(y, 0))
                    else: it[a] = vals.get(b, b)
            elif expr.upper().startswith("ADD"):
                a, b = expr[3:].split(); a = names.get(a, a); it[a] = it.get(a, 0) + vals[b]
            _DDB.setdefault(self.name, {})[k] = it; _log("dynamodb", "UpdateItem", table=self.name, key=Key, expr=UpdateExpression)
            return {"Attributes": copy.deepcopy(it)} if ReturnValues else {}
        def query(self, KeyConditionExpression=None, **kw):
            _log("dynamodb", "Query", table=self.name)
            items = list(_DDB.setdefault(self.name, {}).values()); conds = KeyConditionExpression
            conds = [conds] if isinstance(conds, tuple) and conds and isinstance(conds[0], str) else (conds or [])
            for c in conds:
                op, n, v = c
                items = [i for i in items if (i.get(n) == v if op == "eq" else str(i.get(n, "")).startswith(v))]
            return {"Items": copy.deepcopy(items), "Count": len(items)}
        def scan(self, **kw):
            _log("dynamodb", "Scan", table=self.name); items = list(_DDB.setdefault(self.name, {}).values())
            return {"Items": copy.deepcopy(items), "Count": len(items)}

    class _Resource:
        def __init__(self, svc): self.svc = svc
        def Table(self, name): return Table(name)

    class _Client:
        def __init__(self, svc): self.svc = svc
        def send_message(self, QueueUrl, MessageBody, **kw):
            _log("sqs", "SendMessage", queue=QueueUrl, body=MessageBody); return {"MessageId": str(uuid.uuid4())}
        def publish(self, TopicArn=None, Message="", Subject=None, MessageAttributes=None, **kw):
            _log("sns", "Publish", topic=TopicArn, message=Message, subject=Subject); return {"MessageId": str(uuid.uuid4())}
        def put_events(self, Entries):
            for e in Entries:
                if not all(k in e for k in ("Source", "DetailType", "Detail")): raise ClientError("ValidationException", "Source, DetailType and Detail are required")
                json.loads(e["Detail"])
            _log("events", "PutEvents", entries=Entries); return {"FailedEntryCount": 0, "Entries": [{"EventId": str(uuid.uuid4())} for _ in Entries]}
        def put_object(self, Bucket, Key, Body=b"", **kw):
            _S3[(Bucket, Key)] = Body if isinstance(Body, (bytes, str)) else str(Body); _log("s3", "PutObject", bucket=Bucket, key=Key); return {"ETag": '"abc"'}
        def get_object(self, Bucket, Key, **kw):
            _log("s3", "GetObject", bucket=Bucket, key=Key)
            if (Bucket, Key) not in _S3: raise ClientError("NoSuchKey", "The specified key does not exist.")
            data = _S3[(Bucket, Key)]; data = data.encode() if isinstance(data, str) else data
            class _B:
                def read(self_inner): return data
            return {"Body": _B(), "ContentLength": len(data)}
        def get_secret_value(self, SecretId, **kw):
            _log("secretsmanager", "GetSecretValue", secret=SecretId)
            if SecretId not in _SECRETS: raise ClientError("ResourceNotFoundException", "Secrets Manager can't find the specified secret.")
            return {"SecretString": _SECRETS[SecretId], "Name": SecretId}
        def start_execution(self, stateMachineArn, input="{}", name=None, **kw):
            _log("stepfunctions", "StartExecution", arn=stateMachineArn, input=input); return {"executionArn": stateMachineArn.replace(":stateMachine:", ":execution:") + ":" + (name or "run1")}
        def put_metric_data(self, Namespace, MetricData, **kw):
            _log("cloudwatch", "PutMetricData", ns=Namespace, data=MetricData); return {}
        def invoke(self, FunctionName, Payload=b"{}", InvocationType="RequestResponse", **kw):
            _log("lambda", "Invoke", fn=FunctionName, type=InvocationType); return {"StatusCode": 202 if InvocationType == "Event" else 200}

    boto3 = types.ModuleType("boto3")
    boto3.resource = lambda svc, **kw: _Resource(svc)
    boto3.client = lambda svc, **kw: _Client(svc)
    boto3._DDB, boto3._S3, boto3._SECRETS, boto3.AWS_CALLS = _DDB, _S3, _SECRETS, AWS_CALLS
    sys.modules["boto3"] = boto3
    bc = types.ModuleType("botocore"); bce = types.ModuleType("botocore.exceptions"); bce.ClientError = ClientError; bc.exceptions = bce
    sys.modules["botocore"] = bc; sys.modules["botocore.exceptions"] = bce
    b3d = types.ModuleType("boto3.dynamodb"); b3dc = types.ModuleType("boto3.dynamodb.conditions"); b3dc.Key = Key; b3dc.Attr = Attr; b3d.conditions = b3dc
    sys.modules["boto3.dynamodb"] = b3d; sys.modules["boto3.dynamodb.conditions"] = b3dc

import os, boto3
from botocore.exceptions import ClientError
os.environ.setdefault("TABLE_NAME", "invoices"); os.environ.setdefault("QUEUE_URL", "https://sqs.ap-southeast-1.amazonaws.com/111122223333/orders")
os.environ.setdefault("TOPIC_ARN", "arn:aws:sns:ap-southeast-1:111122223333:alerts"); os.environ.setdefault("BUS_NAME", "default")
os.environ.setdefault("AWS_REGION", "ap-southeast-1"); os.environ.setdefault("SECRET_ID", "prod/db")
AWS_CALLS = boto3.AWS_CALLS

class LambdaContext:
    function_name = "raul-fn"; memory_limit_in_mb = 256; function_version = "$LATEST"
    invoked_function_arn = "arn:aws:lambda:ap-southeast-1:111122223333:function:raul-fn"
    log_group_name = "/aws/lambda/raul-fn"
    def __init__(self): self.aws_request_id = "c0ffee00-" + uuid.uuid4().hex[:4] + "-4b1d-9f00-1a2b3c4d5e6f"; self._t = time.time()
    def get_remaining_time_in_millis(self): return max(0, int(3000 - (time.time() - self._t) * 1000))
context = LambdaContext()

def reset_aws():
    """Empty the fake tables/buckets and the call log."""
    boto3._DDB.clear(); boto3._S3.clear(); AWS_CALLS.clear()

def calls(service=None, op=None):
    """AWS calls your code made (fake boto3)."""
    return [c for c in AWS_CALLS if (service is None or c["service"] == service) and (op is None or c["op"] == op)]

def invoke(fn, event, ctx=None):
    """Run a handler the way Lambda does, printing CloudWatch-style START/END/REPORT lines."""
    ctx = ctx or LambdaContext(); t0 = time.time()
    print(f"START RequestId: {ctx.aws_request_id} Version: $LATEST")
    try:
        result = fn(copy.deepcopy(event), ctx)
    except Exception as e:
        print(f'[ERROR] {type(e).__name__}: {e}')
        print(f"END RequestId: {ctx.aws_request_id}")
        raise
    ms = (time.time() - t0) * 1000
    print(f"END RequestId: {ctx.aws_request_id}")
    print(f"REPORT RequestId: {ctx.aws_request_id}\tDuration: {ms:.2f} ms\tBilled Duration: {max(1, int(ms) + 1)} ms\tMemory Size: 256 MB")
    print("→", json.dumps(result, default=str)[:400])
    return result

def _t(f):
    """Challenge checker: fresh fake AWS, run f, never raise."""
    try:
        reset_aws(); return bool(f())
    except Exception:
        return False

events = {
  "api": {"version": "2.0", "routeKey": "POST /invoices", "rawPath": "/invoices",
          "headers": {"content-type": "application/json"},
          "requestContext": {"http": {"method": "POST", "path": "/invoices", "sourceIp": "203.0.113.9"}, "requestId": "req-1"},
          "body": json.dumps({"customer": "acme", "amount": 120}), "isBase64Encoded": False},
  "api_get": {"version": "2.0", "routeKey": "GET /invoices/{id}", "rawPath": "/invoices/inv-1",
          "pathParameters": {"id": "inv-1"}, "requestContext": {"http": {"method": "GET", "path": "/invoices/inv-1"}}, "body": None},
  "s3": {"Records": [{"eventSource": "aws:s3", "eventName": "ObjectCreated:Put",
          "s3": {"bucket": {"name": "raul-uploads"}, "object": {"key": "reports/2026/Nov+report+v2.csv", "size": 2048}}}]},
  "sqs": {"Records": [
          {"messageId": "m-1", "receiptHandle": "rh1", "body": json.dumps({"orderId": "o-1", "qty": 2})},
          {"messageId": "m-2", "receiptHandle": "rh2", "body": "this is not json"},
          {"messageId": "m-3", "receiptHandle": "rh3", "body": json.dumps({"orderId": "o-3", "qty": 1})}]},
  "eventbridge": {"version": "0", "id": "ev-1", "source": "raul.orders", "detail-type": "OrderPlaced",
          "time": "2026-11-13T12:00:00Z", "region": "ap-southeast-1", "detail": {"orderId": "o-9", "total": 250}},
  "schedule": {"source": "aws.events", "detail-type": "Scheduled Event", "time": "2026-11-13T00:00:00Z", "detail": {}},
  "sns": {"Records": [{"EventSource": "aws:sns", "Sns": {"Subject": "alert", "Message": json.dumps({"level": "high"})}}]},
}
`;
