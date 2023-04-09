// Triggered by the POST Gateway when a user sends their squiggle
// Builds the record from user data and adds it to DynamoDB

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// example request from Postman
// {
//   "squiggle": {
//       "datetime": "25345"
//   }
// }

export async function handler(event) {
    // Check if event.squiggle is defined
    if (event.squiggle) {
        // Get the JSON data from the POST request
        // const data = JSON.parse(event.squiggle)
        const data = event.squiggle;

        // Set up parameters for the DynamoDB PutItem operation
        const params = {
            TableName: 'iot23_db_superproject_dege',
            Item: {
                "datetime": data.datetime,
                "new_squiggle": 1,
                "author": data.author
                // Add more attributes as needed
            }
        };

        try {
            // Write the item to the DynamoDB table
            await ddbDocClient.send(new PutCommand(params));

            // Create a response that returns the same POST body
            const response = {
                statusCode: 200, // success
                body: JSON.stringify({success: data}),
            };
            return response;
        } catch (error) {
            // Create an error response
            const response = {
                statusCode: 500, // server error
                body: JSON.stringify({ 
                    message: 'An error occurred while adding the item to the DynamoDB table.',
                    error: error
                }),
            };
            return response;
        }
    } else {
        // Return an error response if event.squiggle is undefined
        const response = {
            statusCode: 400, // user error
            body: JSON.stringify(
                { 
                    message: 'Invalid event.',
                    event: event
                }),
        };
        return response;
    }
}