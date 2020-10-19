import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CarlosRdsDemo2 from '../lib/carlos_rds_demo2-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CarlosRdsDemo2.CarlosRdsDemo2Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
