import requests
import psycopg2
import json

def main():
    # Replace these with your actual database credentials
    db_name = "squiggle_db"
    db_user = "admin"
    db_password = "admin"
    db_host = "localhost"
    db_port = "5432"

    # Connect to the database
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )

    # Load API info
    with open('api_config.json', 'r') as file:
        config = json.load(file)

    # make API request
    response = get_request(config)

    # Create a cursor object to interact with the database
    cur = conn.cursor()

    print("pre data: ")
    read_data(cur)
    
    json_test = [{
        "datetime": "2023-04-09T14:30:00",
        "author": "Pangur"
    }]

    insert_data(cur, json_test)

    # Commit the transaction
    conn.commit()

    print("post data: ")
    read_data(cur)

    cur.close()
    conn.close()

    print(response.json())

def get_request(config):
    # makes AWS API request using key and url
    headers = {'x-api-key': config['API_KEY']}
    response = requests.get(config['API_URL'], headers=headers)

    return response

def insert_data(cur, json_data):
    # Load JSON data
    # data = json.loads(json_data)

    # Prepare the INSERT query template
    query = "INSERT INTO squiggles (datetime, author) VALUES (%s, %s);"

    # Check if data is a list (multiple records) or a dict (single record)
    for record in json_data:
        cur.execute(query, (record['datetime'], record['author']))

def read_data(cur):
    # Execute the SELECT query to fetch all rows from the 'squiggles' table
    cur.execute("SELECT * FROM squiggles;")

    # Fetch all the rows returned by the query
    rows = cur.fetchall()

    # Print the rows
    for row in rows:
        print(row)

if __name__ == '__main__':
    main()