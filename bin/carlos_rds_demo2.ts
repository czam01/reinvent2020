#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CarlosRdsDemo2Stack } from '../lib/carlos_rds_demo2-stack';

const app = new cdk.App();
new CarlosRdsDemo2Stack(app, 'CarlosRdsDemo2Stack');
