const express = require('express');
const app = express();
const rp = require('request-promise');
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;
const validUrl = require('valid-url');

solucao = 'CAPCHA_NOT_READY';

const waitFor = (ms) => new Promise(r => setTimeout(r, ms))

async function getCaptcha(id) {
    console.log('id --' + id)
    while (solucao === 'CAPCHA_NOT_READY') {
        await waitFor(1000);
        await rp("http://2captcha.com/res.php?key=" + '031bf0bf0c9651313e43f00b4355defe' + "&action=get&id=" + id)
            .then(function (body) {
                console.log(body.replace('OK|', ''));
                solucao = body.replace('OK|', '');
            })
            .catch(function (err) {
                console.log(body);
            });

    }
    return solucao;
}

async function solveCaptcha(imagem) {

    key = '031bf0bf0c9651313e43f00b4355defe';
    captcha = ''

    var options = {
        method: 'POST',
        uri: 'http://2captcha.com/in.php',
        form: {

            key: key,
            body: imagem,
            method: 'base64'
        },
        headers: {
            /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
        }
    };

    return await rp(options)

}

async function run() {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox', '--disable-dev-shm-usage']}
    );
    
    console.log("iniciando varredura na web");
    const page = await browser.newPage();
    try {
        await page.goto('https://siscoaf.fazenda.gov.br/siscoaf-internet/pages/consultaPO/consultarPO.jsf', { timeout: 0 });
    }

    
    catch (error) {
        console.log(error);
        browser.close();
    }
    console.log("passou1");
    img = await page.screenshot({
        //clip: { x: 685, y: 340, width: 200, height: 100 }
        clip: { x: 540, y: 290, width: 230, height: 80 },
        encoding : 'base64'
    });


    const CNPJ = '#txtNrCpfCnpj';
    const CAPTCHA = "#captcha > span > input";
    const BUSCAR = '#btnConsultar';
    console.log("passou2");
    await solveCaptcha(img)
        .then(function (body) {
            console.log(body.replace('OK|', ''));
            captcha = body.replace('OK|', '');
            getCaptcha(body.replace('OK|', '')).then( async x => {
              
                await page.click(CNPJ);
                await page.keyboard.type('42.956.441/0012-64');
                await page.click(CAPTCHA);
                console.log("passou4");
                await page.keyboard.type(solucao);
                await page.waitFor(1 * 3000);
                await page.click(BUSCAR);
                
                await page.waitForNavigation();
                console.log("passou8");
    
                await page.evaluate(() => document.querySelector('#msg > div > ul > li > span').textContent).then( x => {
                    console.log("resultado da pesquisa --->  ", x);
                })

            
                await browser.close().then(console.log('fechou'));
    
            
            })
        })
        .catch(function (err) {
            console.log(body);
        });
        console.log("passou3");
   
}

function teste22() {
    console.log("teste de aplicacao");
}


//run();


var parseUrl = function(url) {
    url = decodeURIComponent(url)
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = 'http://' + url;
    }

    return url;
};

app.get('/', function(req, res) {
    var urlToScreenshot = parseUrl(req.query.url);

    if (validUrl.isWebUri(urlToScreenshot)) {
        console.log('Screenshotting: ' + urlToScreenshot);
        (async() => {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox','--disable-dev-shm-usage']
            });

            const page = await browser.newPage();
            await page.goto(urlToScreenshot);
            await page.screenshot().then(function(buffer) {
                res.setHeader('Content-Disposition', 'attachment;filename="' + urlToScreenshot + '.png"');
                res.setHeader('Content-Type', 'image/png');
                res.send(buffer)
            });

            await browser.close().then(console.log('fechou'));
        })();
    } else {
        res.send('Invalid url: ' + urlToScreenshot);
    }

});

app.get('/co', function(req, res) {



        console.log('coaf teste ');
        (async() => {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true,
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox','--disable-dev-shm-usage','--ignore-certificate-errors','--ignore-urlfetcher-cert-requests ']
            });

            const page = await browser.newPage();
            await page.goto('https://siscoaf.fazenda.gov.br/siscoaf-internet/pages/consultaPO/consultarPO.jsf',{  ignoreSSL: true ,timeout: 0, waitUntil: 'networkidle2' });
            await page.screenshot().then(function(buffer) {
                res.setHeader('Content-Disposition', 'attachment;filename="' + urlToScreenshot + '.png"');
                res.setHeader('Content-Type', 'image/png');
                res.send(buffer)
            });

            await browser.close().then(console.log('fechou'));
        })();


});

app.get('/coaf', (req, res) => {

    var searhCNPJ = req.query.cnpj;
    console.log(searhCNPJ);
    
    (async() => {
        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            headless: true,
            args: [
                '--no-sandbox','--disable-setuid-sandbox', '--disable-dev-shm-usage','--ignore-certificate-errors'
            ],
            dumpio: false
        },
        );
        
        console.log("iniciando varredura na web");
        const page = await browser.newPage();
      
        await page.goto('https://siscoaf.fazenda.gov.br/siscoaf-internet/pages/consultaPO/consultarPO.jsf', {  timeout: 0, waitUntil: 'networkidle0' });
    
/*         await page.setRequestInterception(true);
        await page.on('request', interceptedRequest => {
            console.log(interceptedRequest.url());
            interceptedRequest.continue();
        }); */
        console.log("passou1");
        img = await page.screenshot({
            //clip: { x: 685, y: 340, width: 200, height: 100 }
            clip: { x: 540, y: 290, width: 230, height: 80 },
            encoding : 'base64'
        });
    
    
        const CNPJ = '#txtNrCpfCnpj';
        const CAPTCHA = "#captcha > span > input";
        const BUSCAR = '#btnConsultar';
        console.log("passou2");
        await solveCaptcha(img)
            .then(function (body) {
                console.log(body.replace('OK|', ''));
                captcha = body.replace('OK|', '');
                getCaptcha(body.replace('OK|', '')).then( async x => {
                  
                    await page.click(CNPJ);
                    await page.keyboard.type(searhCNPJ);
                    await page.click(CAPTCHA);
                    console.log("passou4");
                    await page.keyboard.type(solucao);
                    await page.waitFor(1000);
                    await page.click(BUSCAR);
                    
                    await page.waitForNavigation();
                    console.log("passou8");
        
                    await page.evaluate(() => document.querySelector('#msg > div > ul > li > span').textContent).then( x => {
                        console.log("resultado da pesquisa --->  ", x);
                        res.send(JSON.stringify({ status: x }));
                        solucao = 'CAPCHA_NOT_READY';
                    })

                 /*    const html = await page.content();
                    console.log(html); */
    
                
                    await browser.close().then(console.log('fechou'));
        
                
                })
            })
            .catch(function (err) {
                console.log(body);
            });
            console.log("passou3");
       
            
  
    })();

})



app.listen(port, function() {
    console.log('App listening on port ' + port)
})
