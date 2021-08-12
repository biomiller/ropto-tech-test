import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import https from "https";
import mysql from "mysql";
import 'dotenv/config';

axios.defaults.timeout = 60000;
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

const port = 3001;
const app = express();
app.use(bodyParser.json());

export const server = app.listen(port, () => console.log(`App running on port ${port}`));

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.DATABASE,
});

app.get("/saveTopStories", async (req, res) => {
    let storyIDs: number[] = [];

    let topStoryIds = (await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json")).data;

    console.log("Getting stories...");

    async function getStories(stories: number[]) {
        for (let storyID of stories) {
            let story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyID}.json`);
            if (story.data.kids != undefined && story.data.kids != null) {
                storyIDs.push.apply(storyIDs, story.data.kids);
                await getStories(story.data.kids);
            }
        }
    }

    await getStories(topStoryIds);

    let uniqueStoryIds = storyIDs.filter((id, index) => storyIDs.indexOf(id) === index);

    await saveStories(uniqueStoryIds);

    console.log(`Processed ${uniqueStoryIds.length} stories.`);

    res.send(`Processed ${uniqueStoryIds.length} stories.`);
})

const saveStories = async (storyIds: number[]) => {

    try {
        connection.connect();
    }
    catch (error) {
        throw new Error(error);
    }

    for (let id of storyIds) {
        console.log(`Saving story ${id}...`)
        let story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);

        const storyId = story.data.id ? story.data.id : null;
        const deleted = story.data.deleted ? story.data.deleted : null;
        const type = story.data.type ? story.data.type : null;
        const username = story.data.by ? story.data.by : null;
        const time = story.data.time ? story.data.time : null;
        const text = story.data.text ? story.data.text : null;
        const dead = story.data.dead ? story.data.dead : null;
        const parent = story.data.parent ? story.data.parent : null
        const poll = story.data.poll ? story.data.poll : null;
        const kids = story.data.kids ? story.data.kids.join(",") : null;
        const url = story.data.url ? story.data.url : null;
        const score = story.data.score ? story.data.score : null;
        const title = story.data.title ? story.data.title : null;
        const parts = story.data.parts ? story.data.parts.join(",") : null;
        const descendants = story.data.descendants ? story.data.descendants : null;

        let query = `INSERT INTO Stories (storyID, deleted, type, username, time, text, dead, parent, poll, kids, url, score, title, parts, descendants) VALUES (${storyId}, ${deleted}, '${type}', '${username}',${time}, '${text}', '${dead}', ${parent},'${poll}','${kids}','${url}',${score},'${title}','${parts}',${descendants})`

        let sqlQuery = connection.query(query);
        sqlQuery.on('error', () => {
            console.log(`Unable to save story ${id}`)
        })
        sqlQuery.on('result', () => {
            console.log("Saved story.")
        })
    }

    try {
        connection.end();
    }
    catch (error) {
        throw new Error(error);
    }
}







