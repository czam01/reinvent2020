import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as ec2cdk from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds';
import * as path from 'path';
import fs = require('fs');

export class CarlosRdsDemo2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2cdk.Vpc(this, 'Vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      subnetConfiguration: [
        { name: 'aurora_rdsTest', subnetType: ec2cdk.SubnetType.ISOLATED }
      ]
    });

    const subnetIds: string[] = [];
    vpc.isolatedSubnets.forEach((subnet, index) => {
      subnetIds.push(subnet.subnetId);
    });


    const dbSubnetGroup = new rds.CfnDBSubnetGroup(this, 'AuroraSubnetGroup', {
      dbSubnetGroupDescription: 'Subnet group to access aurora',
      dbSubnetGroupName: 'aurora-provisioned-subnet-group',
      subnetIds
    });



    const aurora = new rds.CfnDBCluster(this, 'AuroraProvisioned', {
      databaseName: this.node.tryGetContext("databaseName"),
      dbClusterIdentifier: 'aurora-provisioned',
      engine: 'aurora-mysql',
      engineMode: 'provisioned',
      masterUsername: this.node.tryGetContext("masterUser"),
      masterUserPassword: this.node.tryGetContext("masterPassword"),
      port: 3306,
      dbSubnetGroupName: dbSubnetGroup.dbSubnetGroupName
    });

// Instancia Primaria del cluster
    const aurora_primaria = new rds.CfnDBInstance(this, 'AuroraMaster', {
      dbInstanceClass: "db.r3.xlarge",
      dbClusterIdentifier: aurora.dbClusterIdentifier,
      engine: 'aurora-mysql'
    });
    
    aurora_primaria.addDependsOn(aurora);


    //wait for subnet group to be created
    aurora.addDependsOn(dbSubnetGroup);



    //create SNS topic to trigger DMS task
    const topic = new sns.Topic(this, 'triggerTopic', {
      topicName: 'trigerReInventDemo',
      displayName: 'trigerReInventDemo'
    });

    const layer = lambda.LayerVersion.fromLayerVersionArn(this, 'layerversion', 'arn:aws:lambda:us-east-1:638852852210:layer:reInventDemoSQL:1');

    let someArray = [1, 2];//, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let iter in someArray) {

      const lambdaScheduler = new lambda.Function(this, "lambda_query_" + iter.toString(), {
        functionName: "reInventQueryLambda" + iter.toString(),
        runtime: lambda.Runtime.PYTHON_3_7,
        vpc: vpc,
        handler: "index.handler",
        code: new lambda.InlineCode(fs.readFileSync(path.join("lib", "resources", "index.py"), { encoding: 'utf-8' })),
        allowPublicSubnet: true,
        layers: [layer],
        environment: {
          "dbUser": this.node.tryGetContext("masterUser"),
          "dbPassword": this.node.tryGetContext("masterPassword"),
          "dbName": this.node.tryGetContext("databaseName"),
          "dbHost": aurora.getAtt("Endpoint.Address").toString(),
          "dbPort": aurora.getAtt("Endpoint.Port").toString()
        }
      });
      //function subscribes to topic
      lambdaScheduler.addEventSource(new SnsEventSource(topic));

    }
  }

}
