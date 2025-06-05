import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { getItems } from "./GetItems";



const ddbclient = new DynamoDBClient({})

async function handler(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>{

    try{
        switch(event.httpMethod){
            case 'GET':
                const getResponse = await getItems(event, ddbclient);
                return getResponse;
            default:
                return {
                    statusCode: 405,
                    body: JSON.stringify({ message: 'Method not allowed'})
                }
        }
    }catch(error){
        console.error(error);
        return{
            statusCode: 500,
            body: JSON.stringify(error)
        }
    }
}  

export {handler}