// Triggered by the AWS GET API to get new squiggle records
// Marks the entry as sent by changing new_squiggle from 1 to 0
// This prevents sending the same squiggle more than once

// Import required AWS SDK clients and commands
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB client and a document client
const client = new DynamoDBClient({ region: "us-west-2" });
const documentClient = DynamoDBDocumentClient.from(client);

// Lambda function handler
export async function handler(event) {
    // Query records with new_squiggle set to 1
    const records = await getRecordsWithNewSquiggle();

    // Build the API Gateway response
    const response = {
        statusCode: 200,
        body: JSON.stringify(records),
    };

    // Update new_squiggle from 1 to 0 for each record in the response
    await updateNewSquiggle(records);

    return response;
};

// Function to query DynamoDB table for records with the specified new_squiggle value
async function getRecordsWithNewSquiggle() {
    // Define the query parameters
    const queryParams = {
        TableName: "squiggle_aws_db", // DynamoDB table name
        IndexName: "NewSquiggleIndex", // Global Secondary Index name
        KeyConditionExpression: "new_squiggle = :new_squiggle", // Query condition (new_squiggle = value)
        ExpressionAttributeValues: {
            ":new_squiggle": 1 // New squiggles equal 1
        },
        ScanIndexForward: true, // Sort the results in ascending order
        ConsistentRead: false // Use eventual consistency for the query
    };
    
    // Execute the query and return the result
    try {
        const result = await documentClient.send(new QueryCommand(queryParams));
        return result.Items;
    } catch (error) {
        console.error("Error querying DynamoDB:", error);
        throw error;
    }
}

// Function to update the new_squiggle attribute for each record in the list
async function updateNewSquiggle(records) {
    for (const record of records) {
        const updateParams = {
            TableName: "squiggle_aws_db",
            Key: {
                "author": record.author, // Partition key
                "datetime": record.datetime, // Sort key
            },
            UpdateExpression: "SET new_squiggle = :new_squiggle",
            ExpressionAttributeValues: {
                ":new_squiggle": 0,
            },
        };

        try {
            await documentClient.send(new UpdateCommand(updateParams));
        } catch (error) {
            console.error("Error updating DynamoDB record:", error);
            throw error;
        }
    }
}