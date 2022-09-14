#!/bin/sh
set -e

cd deploy/lambda

cp cf-template.packaged.yaml cf-template.packaged.yaml.bak || true

aws cloudformation package \
    --template-file cf-template.yaml \
    --s3-bucket animeta-frontend-kr \
    --s3-prefix lambda \
    --output-template-file cf-template.packaged.yaml \
    --region ap-northeast-2

aws cloudformation deploy \
    --template-file cf-template.packaged.yaml \
    --stack-name animeta-frontend-lambda \
    --capabilities CAPABILITY_IAM \
    --region ap-northeast-2 \
    --parameter-overrides DomainName=animeta.net
