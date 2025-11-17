# Postman'da findAllNews Query

## Query:

```graphql
query FindAllNews($input: NewsFilterInput!) {
  findAllNews(input: $input) {
    list {
      id
      title
      content
      status
      image
      video
      createdAt
      updatedAt
    }
    metaCounter {
      total
    }
  }
}
```

## Variables (1-variant - search bilan):

```json
{
  "input": {
    "page": 1,
    "limit": 2,
    "sort": "createdAt",
    "direction": "DESC",
    "search": {
      "status": null
    }
  }
}
```

## Variables (2-variant - search siz, oddiy):

```json
{
  "input": {
    "page": 1,
    "limit": 2,
    "sort": "createdAt",
    "direction": "DESC"
  }
}
```

## Boshqa misollar:

### Faqat ACTIVE statusli:

```json
{
  "input": {
    "page": 1,
    "limit": 2,
    "sort": "createdAt",
    "direction": "DESC",
    "search": {
      "status": "ACTIVE"
    }
  }
}
```

### Faqat PAUSE statusli:

```json
{
  "input": {
    "page": 1,
    "limit": 2,
    "sort": "createdAt",
    "direction": "ASC",
    "search": {
      "status": "PAUSE"
    }
  }
}
```

### Pagination (2-sahifa):

```json
{
  "input": {
    "page": 2,
    "limit": 2,
    "sort": "createdAt",
    "direction": "DESC",
    "search": {
      "status": null
    }
  }
}
```

## Response misoli:

```json
{
  "data": {
    "findAllNews": {
      "list": [
        {
          "id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "title": "Yangi Yangilik",
          "content": "Kontent matni...",
          "status": "ACTIVE",
          "image": "/uploads/news/1234567890-image.jpg",
          "video": null,
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "metaCounter": [
        {
          "total": 8
        }
      ]
    }
  }
}
```
