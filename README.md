# contentful_copy_content
Copy content from one environment to another in Contentful

This script allow you to copy a list of entries between environnements
Natively, Contentful doesn't provides an userfriendly interface to do that. The Contentful CLI is not super easy for business people

<img width="450" alt="image" src="https://github.com/antonincoste/contentful_copy_content/assets/154880000/b156f115-6ff7-4b3a-9100-cf2dc9701897">


# Project setup
Clone the project on your locale machine

```bash
  git clone https://github.com/antonincoste/contentful_copy_content.git
```

Install all necessary librairies

```bash
  npm install dotenv
  npm install express
  npm install body-parser
  npm install contentful-management
```

Create a new .env file on root level
Inside the file, add these two variables and update them with you Contentful Space ID and CMA Access token

```bash
  SPACE_ID_CONTENTFUL=
  TOKEN_CONTENTFUL=
```

Update environnements ID in index.html
"value="qa"" must be changed to match your environnement name

```bash
  <label for="sourceEnv">Source Environment:</label>
        <select id="sourceEnv">
        <option value="dev">Dev</option>
        <option value="qa">QA</option>
        <option value="stg">Staging</option>
        <option value="content">Content</option>
    </select>
```

You can then run the project with the following command

```bash
  node server.js
```
