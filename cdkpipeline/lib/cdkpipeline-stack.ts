import * as cdk from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class CdkpipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
