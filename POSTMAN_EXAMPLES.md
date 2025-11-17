# Postman'da GraphQL Test Qilish

## 1. POSTMAN SETUP

### Headers


Content-Type: application/json
```

### URL

```
POST http://localhost:3000/graphql
```

---

## 2. FIND ALL NEWS (Barcha Newslarni Olish)

### Query

```graphql
query FindAllNews($page: Int, $limit: Int, $sort: String, $status: NewsStatus) {
  findAllNews(page: $page, limit: $limit, sort: $sort, status: $status) {
    total
    news {
      id
      title
      content
      status
      image
      video
      createdAt
      updatedAt
    }
  }
}
```

### Variables (1-variant - Barcha newslar)

```json
{
  "page": 1,
  "limit": 10,
  "sort": "desc"
}
```

### Variables (2-variant - Faqat ACTIVE statusli)

```json
{
  "page": 1,
  "limit": 5,
  "sort": "desc",
  "status": "ACTIVE"
}
```

### Variables (3-variant - Faqat PAUSE statusli)

```json
{
  "page": 1,
  "limit": 5,
  "sort": "asc",
  "status": "PAUSE"
}
```

### Variables (4-variant - Pagination test)

```json
{
  "page": 2,
  "limit": 3,
  "sort": "desc"
}
```

---

## 3. FIND ONE NEWS (Bitta Newsni Olish)

### Query

```graphql
query FindOneNews($id: ID!) {
  findOneNews(id: $id) {
    id
    title
    content
    status
    image
    video
    createdAt
    updatedAt
  }
}
```

### Variables

```json
{
  "id": "YOUR_NEWS_ID_HERE"
}
```

---

## 4. CREATE NEWS (Yangi News Yaratish)

### Query

```graphql
mutation CreateNews($input: CreateNewsInput!) {
  createNews(input: $input) {
    id
    title
    content
    status
    image
    video
    createdAt
    updatedAt
  }
}
```

### Variables (Rasmsiz)

```json
{
  "input": {
    "title": "Yangi Yangilik",
    "content": "Bu yangilikning to'liq matni",
    "status": "ACTIVE"
  }
}
```

### Variables (Rasm bilan - File Upload)

**Eslatma:** File upload uchun Postman'da **GraphQL** emas, **form-data** ishlatish kerak!

**Body type:** `form-data`

**Key-Value pairs:**

```
operations: {"query":"mutation($file: Upload!, $input: CreateNewsInput!) { createNews(input: $input, file: $file) { id title content status image } }","variables":{"input":{"title":"Test News","content":"Content here","status":"ACTIVE"},"file":null}}
map: {"0":["variables.file"]}
0: [SELECT FILE]
```

---

## 5. UPDATE NEWS (Newsni Yangilash)

### Query

```graphql
mutation UpdateNews($input: UpdateNewsInput!) {
  updateNews(input: $input) {
    id
    title
    content
    status
    image
    video
    createdAt
    updatedAt
  }
}
```

### Variables

```json
{
  "input": {
    "id": "YOUR_NEWS_ID_HERE",
    "title": "Yangilangan Sarlavha",
    "content": "Yangilangan kontent",
    "status": "ACTIVE"
  }
}
```

---

## 6. CREATE INQUIRY (Inquiry Yaratish)

### Query

```graphql
mutation CreateInquery($input: CreateInqueryInput!) {
  createInquery(input: $input) {
    id
    name
    email
    phone
    detail
    agreed
    createdAt
    updatedAt
  }
}
```

### Variables

```json
{
  "input": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "detail": "Men sizning mahsulotlaringiz haqida ma'lumot olishni xohlayman",
    "agreed": true
  }
}
```

---

## POSTMAN'DA QADAMLAR

1. **Yangi Request yarating**
2. **Method:** POST
3. **URL:** `http://localhost:3000/graphql`
4. **Headers tab:**
   - `Content-Type: application/json`
5. **Body tab:**
   - `GraphQL` tanlang
   - **Query** qismiga GraphQL query yozing
   - **Variables** qismiga JSON variables yozing
6. **Send** tugmasini bosing

---

## STATUS QIYMATLARI

- `ACTIVE` - Faol news
- `PAUSE` - To'xtatilgan news
- `DELETE` - O'chirilgan news (avtomatik filterlanadi)

---

## SORT QIYMATLARI

- `desc` - Yangi eski (default)
- `asc` - Eski yangi

---

## MISOL RESPONSE

```json
{
  "data": {
    "findAllNews": {
      "total": 8,
      "news": [
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
      ]
    }
  }
}
```
