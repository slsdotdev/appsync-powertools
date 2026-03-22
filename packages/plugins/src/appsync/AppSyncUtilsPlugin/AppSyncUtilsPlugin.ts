import { ITransformerContext, TransformerPluginBase } from "@gqlbase/core";
import {
  ArgumentNode,
  DirectiveDefinitionNode,
  DirectiveNode,
  InputValueNode,
  ListTypeNode,
  NonNullTypeNode,
  ScalarNode,
  ValueNode,
} from "@gqlbase/core/definition";
import { createPluginFactory, InternalDirective } from "@gqlbase/core/plugins";

/**
 * This plugin adds support for AWS AppSync specific scalar and directive types.
 *
 * @definition
 * ```graphql
 * scalar AWSDate
 * scalar AWSDateTime
 * scalar AWSTime
 * scalar AWSTimestamp
 * scalar AWSEmail
 * scalar AWSJSON
 * scalar AWSURL
 * scalar AWSPhone
 * scalar AWSIPAddress
 *
 * directive `@aws_subscribe(mutations: [String!]!)` on FIELD_DEFINITION
 * directive `@aws_auth(cognito_groups: [String!])` on FIELD_DEFINITION | OBJECT
 * directive `@aws_cognito_user_pools(cognito_groups: [String!])` on FIELD_DEFINITION | OBJECT
 * directive `@aws_api_key` on FIELD_DEFINITION | OBJECT
 * directive `@aws_iam` on FIELD_DEFINITION | OBJECT
 * directive `@aws_oidc` on FIELD_DEFINITION | OBJECT
 * directive `@aws_lambda` on FIELD_DEFINITION | OBJECT
 * ```
 *
 * @see https://docs.aws.amazon.com/appsync/latest/devguide
 */

export class AppSyncUtilsPlugin extends TransformerPluginBase {
  constructor(context: ITransformerContext) {
    super("AppSyncUtilsPlugin", context);
  }

  public init() {
    this.context.base
      .addNode(
        ScalarNode.create("AWSDate", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("string")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSDateTime", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("string")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSTime", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("string")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSTimestamp", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("number")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSEmail", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("string")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSJSON", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("object")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSURL", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("string")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSPhone", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("string")),
          ]),
        ])
      )
      .addNode(
        ScalarNode.create("AWSIPAddress", [
          DirectiveNode.create(InternalDirective.TYPE_HINT, [
            ArgumentNode.create("type", ValueNode.enum("string")),
          ]),
        ])
      )
      .addNode(
        DirectiveDefinitionNode.create(
          "aws_subscribe",
          ["FIELD_DEFINITION"],
          InputValueNode.create(
            "mutations",
            NonNullTypeNode.create(ListTypeNode.create(NonNullTypeNode.create("String")))
          )
        )
      )
      .addNode(
        DirectiveDefinitionNode.create(
          "aws_auth",
          ["FIELD_DEFINITION", "OBJECT"],
          InputValueNode.create(
            "cognito_groups",
            ListTypeNode.create(NonNullTypeNode.create("String"))
          )
        )
      )
      .addNode(
        DirectiveDefinitionNode.create(
          "aws_cognito_user_pools",
          ["FIELD_DEFINITION", "OBJECT"],
          InputValueNode.create(
            "cognito_groups",
            ListTypeNode.create(NonNullTypeNode.create("String"))
          )
        )
      )
      .addNode(DirectiveDefinitionNode.create("aws_api_key", ["FIELD_DEFINITION", "OBJECT"]))
      .addNode(DirectiveDefinitionNode.create("aws_iam", ["FIELD_DEFINITION", "OBJECT"]))
      .addNode(DirectiveDefinitionNode.create("aws_oidc", ["FIELD_DEFINITION", "OBJECT"]))
      .addNode(DirectiveDefinitionNode.create("aws_lambda", ["FIELD_DEFINITION", "OBJECT"]));
  }
}

export const appSyncUtilsPlugin = createPluginFactory(AppSyncUtilsPlugin);
