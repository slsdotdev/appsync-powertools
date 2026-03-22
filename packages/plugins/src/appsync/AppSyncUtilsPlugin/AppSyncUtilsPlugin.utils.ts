export const AppSyncScalar = {
  AWSDate: "AWSDate",
  AWSDateTime: "AWSDateTime",
  AWSTime: "AWSTime",
  AWSTimestamp: "AWSTimestamp",
  AWSEmail: "AWSEmail",
  AWSJSON: "AWSJSON",
  AWSURL: "AWSURL",
  AWSPhone: "AWSPhone",
  AWSIPAddress: "AWSIPAddress",
} as const;

export type AppSyncScalarName = keyof typeof AppSyncScalar;

export const AppSyncDirective = {
  AWSSubscribe: "aws_subscribe",
  AWSAuth: "aws_auth",
  AWSCognitoUserPools: "aws_cognito_user_pools",
  AWSApiKey: "aws_api_key",
  AWSIAM: "aws_iam",
  AWSOIDC: "aws_oidc",
  AWSLambda: "aws_lambda",
} as const;

export type AppSyncDirectiveName = keyof typeof AppSyncDirective;
