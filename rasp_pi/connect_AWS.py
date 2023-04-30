import requests
import json
import time
from db_controller import db_connect, insert_data

def main():
    # Load API info
    with open('api_config.json', 'r') as file:
        config = json.load(file)

        print("Waiting for squiggles...")

    while True:
        # make API request
        response = get_request(config)
        data = json.loads(response.json()["body"])

        if data:
            print(f"Adding {len(data)} new squiggle(s).")
            # source: https://stackoverflow.com/questions/17915117/nested-dictionary-comprehension-python
            result = [
                {key: value for key, value in d.items() if key != "new_squiggle"}
                for d in data
            ]
            print("GET result:")
            print(result)
        else:
            result = []

        if result:
            # Open connection to db
            cursor, db = db_connect()

            insert_data(cursor, result)

            # Commit the transaction
            db.commit()

            cursor.close()
            db.close()

        # Wait for 2 seconds before looping again
        time.sleep(2)

def get_request(config):
    # makes AWS API request using key and url
    headers = {'x-api-key': config['API_KEY']}
    response = requests.get(config['API_URL'], headers=headers)

    return response

if __name__ == '__main__':
    main()