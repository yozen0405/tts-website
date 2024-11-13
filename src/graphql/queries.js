/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAudioHistory = /* GraphQL */ `
  query GetAudioHistory($id: ID!) {
    getAudioHistory(id: $id) {
      id
      userId
      text
      audioUrl
      audioPath
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAudioHistories = /* GraphQL */ `
  query ListAudioHistories(
    $filter: ModelAudioHistoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAudioHistories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        text
        audioUrl
        audioPath
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
