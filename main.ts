import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import https from "https";

axios.defaults.timeout = 60000;
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

const port = 3001;
const app = express();
app.use(bodyParser.json());

export const server = app.listen(port, () => console.log(`App running on port ${port}`));

app.get("/saveTopStories", async (req, res) => {
    let storyIDs: number[] = [];

    let topStoryIds = (await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json")).data;

    async function processStories(stories: number[]) {
        for (let storyID of stories) {
            let story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyID}.json`);
            if (story.data.kids != undefined && story.data.kids != null) {
                storyIDs.push.apply(storyIDs, story.data.kids);
                await processStories(story.data.kids);
            }
            else{
                console.log("No child stories!")
            }
        }
    }
    
    await processStories(topStoryIds);

    let uniqueStoryIds = storyIDs.filter((id, index) => storyIDs.indexOf(id) === index);

    res.send(uniqueStoryIds);
})



