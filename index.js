const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const redis = require('redis');
const fs = require('fs');

const port = process.env.PORT || 8800;
const app = express();

const client = redis.createClient();

    client.on('connect', function() {
        console.log('Redis client connected');
    });
    client.on('error', function (err) {
        console.log('Something went wrong ' + err);
    });

app.get('/', (req, res) => {
    res.send('Adex Web Scraper'.toUpperCase() + "<br/><br/>This scraper returns the body content of a web page"
        +"<br/> To use this scraper, "
        + "add '\/scrape\/?url=the url of the site to be scraped' to the url of"
        +" the Adex web scraper home page.");
})

app.get('/scrape', (req,res) => {
    const url = req.query.url;

    request(url, (err,resp,html) => {
        if(!err){
            const $ = cheerio.load(html);
            const body = $('body');
            const bodyText = body.text();
            const title =$('title');
            const titleText = title.text();
            
            fs.writeFile(`${titleText}.txt`, bodyText, (err) => {
                if(err) res.send(`Error: failed to save file`)
                console.log('File scraped successfully')
                res.send(`File saved as (${titleText}).txt in your editor <br/><br/>` + bodyText)
                res.end();
            })
            
        }
        if(err){
            res.send({
                    StatusCode : 404,
                    Error: err
            })
        }
    })
})

app.post('/move', (req,res) => {
    let file_path = req.query.filename;
    fs.readFile(file_path, (err, data) => {
        promise = new Promise((resolve, reject) => {
        if (err) {
            console.log(err);
            res.send({error : err})};

        data = data.toString(); 
        
        client.set(file_path, data, () => {
            res.send({
                status: 200,
                message: 'File moved to Redis successfully'
            })
            resolve("File moved to Redis successfully")
        });
        });
        promise.then((message) => {
        
            console.log(message)
    
            fs.unlink(file_path, (err) => {
                if (err) throw err;
                console.log(`${file_path} deleted!`);
            }); 
        });
    });
});

app.get('/file', (req, res) => {
    let file_path = req.query.filename;
    client.get(file_path, (err, data) => {
        res.send(data);
    })
})

app.listen(port, () => {
    console.log('i am listening on ' + port);
})