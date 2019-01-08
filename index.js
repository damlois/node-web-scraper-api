const express = require('express');
const cheerio = require('cheerio');
const request = require('request')
const fs = require('fs');

const port = process.env.PORT || 8800;

const app = express();

app.get('/', function(req, res){
    res.send('Adex Web Scraper'.toUpperCase() + "<br/><br/>This scraper returns the body content of a web page"
        +"<br/> To use this scraper, "
        + "add '\/scrape\/?url=the url of the site to be scraped' to the url of"
        +" the Adex web scraper home page.");
})

app.get('/scrape', function(req,res){
    const url = req.query.url;

    request(url, function(err,resp,html){
        if(!err){
            var $ = cheerio.load(html);
            var body = $('body');
            var bodyText = body.text();
            var title =$('title');
            var titleText = title.text();
            
            fs.writeFile(`${titleText}.txt`, bodyText, (err) => {
                if(err) res.send(`Error: file failed to save`)
                res.send(`File saved as (${titleText}).txt in your editor <br/><br/>` + bodyText)
                res.end();
            })
            
        }
        
        else{
            res.send(
                {
                    StatusCode : 404,
                    Error: 'Url not found'
                }
            )
        }
    })
})

app.listen(port, () => {
    console.log('i am listening on ' + port);
})