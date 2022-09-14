#!/bin/sh
set -e

cd deploy/lambda

aws cloudformation deploy \
    --template-file cf-template.packaged.yaml.bak \
    --stack-name animeta-frontend-lambda \
    --capabilities CAPABILITY_IAM \
    --region ap-northeast-2 \
    --parameter-overrides DomainName=animeta.net
