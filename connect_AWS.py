import requests
import psycopg2
import json

def main():
    # Load API info
    with open('api_config.json', 'r') as file:
        config = json.load(file)

    # make API request
    response = get_request(config)

    data = json.loads(response.json()["body"])

    print(data)
    
    if data:
        # source: https://stackoverflow.com/questions/17915117/nested-dictionary-comprehension-python
        result = [
            {key: value for key, value in d.items() if key != "new_squiggle"}
            for d in data
        ]
    else:
        result = []

    print(result)

    # Open connection to db
    cursor, db = db_connect()

    # json_test = [{
    #     "datetime": "2023-04-09T14:30:00",
    #     "author": "Pangur"
    # }]

    insert_data(cursor, result)

    # Commit the transaction
    db.commit()

    cursor.close()
    db.close()

def db_connect():
    # Connect to the database
    db = psycopg2.connect(
        dbname = "squiggle_db",
        user = "admin",
        password = "admin",
        host = "localhost",
        port = "5432"
    )

    # Create a cursor object to interact with the database
    cursor = db.cursor()

    return cursor, db

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

if __name__ == '__main__':
    main()