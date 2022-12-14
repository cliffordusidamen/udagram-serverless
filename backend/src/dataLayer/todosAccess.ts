import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class ToDoAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE
    ) {
    }

    async getAllToDo(userId: string): Promise<TodoItem[]> {
        logger.log('info', "Getting all todos")

        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        console.log(result);
        const items = result.Items;

        return items as TodoItem[];
    }

    async createToDo(todoItem: TodoItem): Promise<TodoItem> {

        logger.log('info', "Creating a new todo item")

        const params = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(params).promise();
        console.log(result);

        return todoItem as TodoItem;
    }

    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {

        logger.log('info', "Updating a todo item");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();

        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    async deleteToDo(todoId: string, userId: string): Promise<string> {

        logger.log('info', "Deleting a todo item");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        await this.docClient.delete(params).promise();

        return "" as string;
    }

}