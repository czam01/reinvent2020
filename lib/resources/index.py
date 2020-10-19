import sys
import logging
import pymysql

rds_host  = "mysqlforlambdatest.cggwqk7kcvnh.us-east-1.rds.amazonaws.com"
name = "czam" 
password = "Colombia2020$"
db_name = "ExampleDB"

logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
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
        """
        cur.execute("create table Employee ( EmpID  int NOT NULL, Name varchar(255) NOT NULL, PRIMARY KEY (EmpID))")
        """
        cur.execute('insert into Employee (EmpID, Name) values(4, "Joe")')
        cur.execute('insert into Employee (EmpID, Name) values(5, "Bob")')
        cur.execute('insert into Employee (EmpID, Name) values(6, "Mary")')
        conn.commit()
        cur.execute("select * from Employee")
        for row in cur:
            item_count += 1
            logger.info(row)
            print(row)
    conn.commit()

    return "Added %d items from RDS MySQL table" %(item_count)