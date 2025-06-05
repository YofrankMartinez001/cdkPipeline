import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { join } from 'path';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class CdkpipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //dynamo db init table part
    const table = new dynamodb.Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type:dynamodb.AttributeType.STRING},
      tableName: 'Items1234',
    });


    //lambda init part
    const itemLambda = new lambdaNodejs.NodejsFunction(this, 'CreateItemLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: (join(__dirname, 'lambdaFunctions', 'handler.ts')),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });
    itemLambda.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [table.tableArn],
      actions: [
        'dynamodb:GetItem'
      ]
    }))


    //api init part
    const api = new apigateway.RestApi(this, 'ItemsApi1234');
    const items = api.root.addResource('Items');


    //create cognito user pool part
    const myUserPool = new cognito.UserPool(this, 'userpool1234', {
      selfSignUpEnabled: true,
      signInAliases:{
        username: true,
        email: true
      }
    });
    new cdk.CfnOutput(this, 'ItemsUserPoolID', {
      value: myUserPool.userPoolId
    });

    //create userpool client
    const userPoolClient = myUserPool.addClient('ItemsUserPoolClient1234', {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true
      }
    });
    new cdk.CfnOutput(this, 'ItemsUserPoolClientID', {
      value: userPoolClient.userPoolClientId
    });

    //create cognito authorizer
    const cognitoAuth = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAutho', {
      cognitoUserPools: [myUserPool],
      identitySource: 'method.request.header.Authorization'
    });
    cognitoAuth._attachToApi(api)
    const optionsWithAuth: apigateway.MethodOptions = {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: cognitoAuth.authorizerId
      }
    }
    //protext api with cognito
    items.addMethod('GET', new apigateway.LambdaIntegration(itemLambda), optionsWithAuth);


    //pipeline part
    new CodePipeline(this, 'MyCodePipeline', {
      pipelineName: 'MyCodePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('YofrankMartinez001/cdkPipeline', 'main'),
        commands: [
          'cd cdkpipeline',
          'npm ci',
          'npx cdk synth'
        ],
        primaryOutputDirectory: 'cdkpipeline/cdk.out'
      })
    })
  }
}
