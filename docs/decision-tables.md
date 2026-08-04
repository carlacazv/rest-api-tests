# Decision Tables

## Image search

| Breed filter | Category filter | Limit class   | Expected behavior                                                   |
| ------------ | --------------- | ------------- | ------------------------------------------------------------------- |
| absent       | absent          | valid         | return zero to limit images                                         |
| valid        | absent          | valid         | return images compatible with the breed filter                      |
| unknown      | absent          | valid         | return an empty result or a client error, never 5xx                 |
| absent       | valid           | valid         | return images compatible with the category filter                   |
| valid        | valid           | valid         | apply both filters or reject an unsupported combination predictably |
| any          | any             | below minimum | reject or clamp predictably, never 5xx                              |
| any          | any             | above maximum | reject or clamp predictably, never 5xx                              |

## Mutation execution

| API key | Mutation flag | Upload flag | Mutation test            | Upload test |
| ------- | ------------- | ----------- | ------------------------ | ----------- |
| absent  | any           | any         | skip                     | skip        |
| valid   | false         | any         | skip                     | skip        |
| valid   | true          | false       | run non-upload lifecycle | skip        |
| valid   | true          | true        | run                      | run         |
