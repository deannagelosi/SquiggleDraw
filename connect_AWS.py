import requests
import json

def main():
    # Load API info
    with open('api_config.json', 'r') as file:
        config = json.load(file)

    # make API request
    response = get_request(config)

    print(response.json())

def get_request(config):
    # makes AWS API request using key and url
    headers = {'x-api-key': config['API_KEY']}
    response = requests.get(config['API_URL'], headers=headers)

    return response

if __name__ == '__main__':
    main()