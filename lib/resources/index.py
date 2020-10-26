import sys
import logging
import pymysql
import os
import random
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dbUser = os.environ['dbUser']
dbPassword = os.environ['dbPassword']
dbName = os.environ['dbName']
dbHost = os.environ['dbHost']
dbPort = os.environ['dbPort']

try:
    conn = pymysql.connect(dbHost, user=dbUser, passwd=dbPassword, db=dbName, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")
def handler(event, context):
    """
    This function fetches content from MySQL RDS instance
    """
    streams = 10
    item_count = 0
    for i in range(streams):
        with conn.cursor() as cur:
            cur.execute("CREATE TABLE IF NOT EXISTS Employee ( EmpID  bigint NOT NULL AUTO_INCREMENT, Name varchar(255) NOT NULL, PRIMARY KEY (EmpID))")
            for i in range(1000):
                cur.execute('insert into Employee (Name) values("Clone{}")'.format(random.randint(0,1000000)))
            conn.commit()
            """
            cur.execute("select * from Employee order by EmpId desc limit 2")
            for row in cur:
                item_count += 1
                logger.info(row)
                print(row)
            conn.commit()
            """
        time.sleep(random.randint(0,5))
        
    return "Added %d items from RDS MySQL table" %(item_count)