import { AttributeValue, DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";



export async function getItems(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult>{

    if (event.queryStringParameters){
        if('id' in event.queryStringParameters){
            const itemId = event.queryStringParameters['id']
            const getItemResponse = await ddbClient.send(new GetItemCommand({
                TableName: process.env.TABLE_NAME,
                Key:{
                    'id': {S: itemId} as AttributeValue
                }
            }))
            if(getItemResponse.Item){
                return{
                    statusCode: 200,
                    body: JSON.stringify( getItemResponse.Item)
                }
            }else{
                return{
                    statusCode: 404,
                    body: JSON.stringify(`Item with id ${itemId} not found`)
                }
            }
        }else{
            return{
                statusCode: 404,
                body: JSON.stringify('Id required')
            }
        }
    }

    const result = await ddbClient.send(new ScanCommand({
        TableName: process.env.TABLE_NAME,
    }));
    console.log(result.Items);

    return{
        statusCode: 201,
        body: JSON.stringify(result.Items)
    }
}