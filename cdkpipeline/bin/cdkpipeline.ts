import * as cdk from 'aws-cdk-lib';
import { CdkpipelineStack } from '../lib/cdkpipeline-stack';

const app = new cdk.App();
new CdkpipelineStack(app, 'CdkpipelineStack', {

});