require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const contentfulManagement = require('contentful-management');
const path = require('path'); // Ajouter cela


const app = express();
const port = 3000;

// Remplacez ces valeurs par vos informations de configuration Contentful
const SPACE_ID = process.env.SPACE_ID_CONTENTFUL;
const ACCESS_TOKEN = process.env.TOKEN_CONTENTFUL;

// Client Contentful
const client = contentfulManagement.createClient({
    accessToken: ACCESS_TOKEN
});

app.use(bodyParser.json());
app.use(express.static('public')); // Sert les fichiers statiques (si vous avez des fichiers CSS ou JS)

// Ajouter cette ligne pour servir votre fichier HTML à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Assurez-vous que le chemin est correct
});

// ... (début du fichier, imports et configuration)

// Endpoint pour la copie et la publication d'entrées
app.post('/copy', async (req, res) => {
    const { sourceEnv, targetEnv, entryIds, copyChecked, publishChecked } = req.body;
    let messages = [];

    if (copyChecked) {
        for (const entryId of entryIds) {
            const copyResult = await copyContent(sourceEnv, targetEnv, entryId);
            messages.push(copyResult.message);
        }
    }

    if (publishChecked) {
        for (const entryId of entryIds) {
            const publishResult = await publishEntry(targetEnv, entryId);
            messages.push(publishResult.message);
        }
    }

    console.log("Messages renvoyés : ", messages); // Log pour débogage
    res.json({ message: messages.join('\n') });
});



// Fonction pour vérifier si une entrée existe sans la copier
async function checkEntryExists(env, entryId) {
    const environment = await client.getSpace(SPACE_ID).then(space => space.getEnvironment(env));
    return environment.getEntry(entryId);
}


// Fonction pour copier le contenu d'un environnement à l'autre
async function copyContent(srcEnv, tgtEnv, entryId) {
    try {
        // Récupérer l'entrée dans l'environnement 'srcEnv'
        const sourceEnvironment = await client.getSpace(SPACE_ID).then(space => space.getEnvironment(srcEnv));
        const entry = await sourceEnvironment.getEntry(entryId);

        // Récupérer l'environnement 'tgtEnv'
        const targetEnvironment = await client.getSpace(SPACE_ID).then(space => space.getEnvironment(tgtEnv));

        // Vérifier si l'entrée existe déjà dans 'tgtEnv'
        try {
            await targetEnvironment.getEntry(entryId);
            console.log(`Entry ${entryId} already exists in ${tgtEnv}. Skipping.`);
            return { success: true, message: `Entry ${entryId} already exists in ${tgtEnv}. Skipping.` };
        } catch (error) {
            // Créer une nouvelle entrée dans 'tgtEnv' si elle n'existe pas
            if (error.name === 'NotFound') {
                const newEntry = await targetEnvironment.createEntryWithId(entry.sys.contentType.sys.id, entryId, {
                    fields: entry.fields
                });

                console.log(`Entry ${entryId} copied to ${tgtEnv} successfully.`);
                return { success: true, message: `Entry ${entryId} copied to ${tgtEnv} successfully.` };
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error(`Error copying entry ${entryId} in ${srcEnv} to ${tgtEnv}: ${error.message}`);
        return { success: false, message: `Error copying entry ${entryId} in ${srcEnv} to ${tgtEnv}: ${error.message}` };
    }
}



// Fonction pour publier une entrée dans un environnement spécifié
async function publishEntry(tgtEnv, entryId) {
    try {
        // Récupérer l'environnement cible
        const targetEnvironment = await client.getSpace(SPACE_ID).then(space => space.getEnvironment(tgtEnv));

        // Récupérer l'entrée dans l'environnement cible
        const entry = await targetEnvironment.getEntry(entryId);

        // Vérifier si l'entrée est déjà publiée
        if (entry.isPublished()) {
            console.log(`Entry ${entryId} is already published in ${tgtEnv}.`);
            return { success: true, message: `Entry ${entryId} is already published in ${tgtEnv}.` };
        }

        // Publier l'entrée
        await entry.publish();
        console.log(`Entry ${entryId} published in ${tgtEnv} successfully.`);
        return { success: true, message: `Entry ${entryId} published in ${tgtEnv} successfully.` };
    } catch (error) {
        console.error(`Error publishing entry ${entryId} in ${tgtEnv}: ${error.message}`);

        // Construisez un message d'erreur personnalisé
        const customErrorMessage = `Error publishing entry ${entryId} in ${tgtEnv}`;
        console.error(customErrorMessage);

        // Retourner uniquement le message d'erreur personnalisé
        return { success: false, message: customErrorMessage };
    }
}


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
