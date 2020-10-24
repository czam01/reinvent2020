import sys
import logging
import pymysql
import os
import random

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

    item_count = 0

    with conn.cursor() as cur:

        cur.execute("SHOW TABLES")
        table_iterator = cur.fetchall()
        if "Employee" not in table_iterator:
            cur.execute("create table Employee ( EmpID  int NOT NULL, Name varchar(255) NOT NULL, PRIMARY KEY (EmpID))")

        for i in range(10000):
            id= random.randint(0, 40000000)
            cur.execute('insert into Employee (EmpID, Name) values({}, "Clone{}")'.format(id,i))
        conn.commit()
        cur.execute("select * from Employee")
        for row in cur:
            item_count += 1
            logger.info(row)
            print(row)
    conn.commit()

    return "Added %d items from RDS MySQL table" %(item_count)