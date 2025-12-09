const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logger = (req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
};
app.use(logger);

app.use(express.static('public'));

let temperatures = [
    { id: 1, from: 'celsius', to: 'fahrenheit', value: 100, result: 212 },
    { id: 2, from: 'fahrenheit', to: 'celsius', value: 32, result: 0 }
];

function convert(from, to, value) {
    const num = parseFloat(value);
    
    if (from === 'celsius' && to === 'fahrenheit') return (num * 9/5) + 32;
    if (from === 'fahrenheit' && to === 'celsius') return (num - 32) * 5/9;
    if (from === 'celsius' && to === 'kelvin') return num + 273.15;
    if (from === 'kelvin' && to === 'celsius') return num - 273.15;
    
    throw new Error('Неподдерживаемая конвертация');
}

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Конвертер температур</title>
        <style>
            body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; }
            .result-box { 
                background: #f8f9fa; 
                padding: 15px; 
                margin: 20px 0; 
                border-radius: 5px;
                border-left: 4px solid #bb00ffff;
                min-height: 100px;
            }
            .box { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 5px; }
            input, select, button { padding: 10px; margin: 5px; }
            button { background: #bb00ffff; color: white; border: none; cursor: pointer; border-radius: 4px; }
            button:hover { background: #bb00ffff; }
            pre { background: #eee; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
            .api-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .method { display: inline-block; padding: 4px 8px; margin-right: 10px; border-radius: 3px; color: white; }
            .get { background: #28a745; }
            .post { background: #bb00ffff; }
            .delete { background: #dc3545; }
        </style>
    </head>
    <body>
        <h1>Конвертер температур</h1>
        
        <div class="result-box">
            <h3>Результат:</h3>
            <pre id="result">Здесь будет результат...</pre>
        </div>
        
        <div class="box">
            <h3>Быстрая конвертация:</h3>
            <input type="number" id="value" value="100">
            <select id="from">
                <option value="celsius">Цельсий</option>
                <option value="fahrenheit">Фаренгейт</option>
                <option value="kelvin">Кельвин</option>
            </select>
            →
            <select id="to">
                <option value="fahrenheit">Фаренгейт</option>
                <option value="celsius">Цельсий</option>
                <option value="kelvin">Кельвин</option>
            </select>
            <button onclick="convertViaQuery()">Конвертировать (Query)</button>
            <button onclick="convertViaParams()">Конвертировать (Params)</button>
            <button onclick="convertViaPost()">Конвертировать (POST)</button>
        </div>
        
        <div class="box">
            <h3>API маршруты:</h3>
            
            <div class="api-row">
                <span class="method get">GET</span>
                <code>/api/convert?from=celsius&to=fahrenheit&value=100</code>
                <button onclick="testGet('/api/convert?from=celsius&to=fahrenheit&value=100')">Выполнить</button>
            </div>
            
            <div class="api-row">
                <span class="method get">GET</span>
                <code>/api/convert/celsius/fahrenheit/100</code>
                <button onclick="testGet('/api/convert/celsius/fahrenheit/100')">Выполнить</button>
            </div>
            
            <div class="api-row">
                <span class="method post">POST</span>
                <code>/api/convert</code>
                <button onclick="testPost()">Выполнить</button>
            </div>
            
            <div class="api-row">
                <span class="method get">GET</span>
                <code>/api/temperatures</code>
                <button onclick="callApi('GET', '/api/temperatures')">Выполнить</button>
            </div>
            
            <div class="api-row">
                <span class="method get">GET</span>
                <code>/api/temperatures/1</code>
                <button onclick="callApi('GET', '/api/temperatures/1')">Выполнить</button>
            </div>
            
            <div class="api-row">
                <span class="method post">POST</span>
                <code>/api/temperatures</code>
                <button onclick="createTemp()">Выполнить</button>
            </div>
            
            <div class="api-row">
                <span class="method delete">DELETE</span>
                <code>/api/temperatures/1</code>
                <button onclick="deleteTemp(1)">Выполнить</button>
            </div>
        </div>
        
        <script>
            function showResult(data) {
                document.getElementById('result').textContent = JSON.stringify(data, null, 2);
            }
            
            async function callApi(method, url, body) {
                const options = { method };
                if (body) {
                    options.headers = { 'Content-Type': 'application/json' };
                    options.body = JSON.stringify(body);
                }
                
                try {
                    const response = await fetch(url, options);
                    const data = await response.json();
                    showResult(data);
                } catch (error) {
                    showResult({ error: error.message });
                }
            }
            
            function testGet(url) { 
                callApi('GET', url); 
            }
            
            function testPost() {
                callApi('POST', '/api/convert', {
                    from: 'celsius',
                    to: 'fahrenheit',
                    value: 100
                });
            }
            
            function convertViaQuery() {
                const value = document.getElementById('value').value;
                const from = document.getElementById('from').value;
                const to = document.getElementById('to').value;
                testGet(\`/api/convert?from=\${from}&to=\${to}&value=\${value}\`);
            }
            
            function convertViaParams() {
                const value = document.getElementById('value').value;
                const from = document.getElementById('from').value;
                const to = document.getElementById('to').value;
                testGet(\`/api/convert/\${from}/\${to}/\${value}\`);
            }
            
            function convertViaPost() {
                const value = document.getElementById('value').value;
                const from = document.getElementById('from').value;
                const to = document.getElementById('to').value;
                callApi('POST', '/api/convert', {from, to, value});
            }
            
            function createTemp() {
                callApi('POST', '/api/temperatures', {
                    from: 'celsius',
                    to: 'kelvin',
                    value: 25
                });
            }
            
            function deleteTemp(id) {
                callApi('DELETE', \`/api/temperatures/\${id}\`);
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/api/temperatures', (req, res) => {
    res.json(temperatures);
});

app.get('/api/temperatures/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const temp = temperatures.find(t => t.id === id);
    
    if (!temp) return res.status(404).json({ error: 'Не найдено' });
    res.json(temp);
});

app.post('/api/temperatures', (req, res) => {
    const { from, to, value } = req.body;
    
    if (!from || !to || !value) {
        return res.status(400).json({ error: 'Нужны все поля' });
    }
    
    try {
        const result = convert(from, to, value);
        const newTemp = {
            id: temperatures.length + 1,
            from,
            to,
            value: parseFloat(value),
            result: parseFloat(result.toFixed(2))
        };
        
        temperatures.push(newTemp);
        res.status(201).json(newTemp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/temperatures/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = temperatures.findIndex(t => t.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Не найдено' });
    }
    
    const deleted = temperatures.splice(index, 1);
    res.json({ message: 'Удалено', deleted });
});

app.get('/api/convert', (req, res) => {
    const { from, to, value } = req.query;
    
    if (!from || !to || !value) {
        return res.status(400).json({ error: 'Нужны параметры: from, to, value' });
    }
    
    try {
        const result = convert(from, to, value);
        res.json({
            method: 'GET (query)',
            from,
            to,
            value: parseFloat(value),
            result: parseFloat(result.toFixed(2))
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/convert/:from/:to/:value', (req, res) => {
    const { from, to, value } = req.params;
    
    try {
        const result = convert(from, to, value);
        res.json({
            method: 'GET (params)',
            from,
            to,
            value: parseFloat(value),
            result: parseFloat(result.toFixed(2))
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/convert', (req, res) => {
    const { from, to, value } = req.body;
    
    if (!from || !to || !value) {
        return res.status(400).json({ error: 'Нужны все поля' });
    }
    
    try {
        const result = convert(from, to, value);
        res.json({
            method: 'POST',
            from,
            to,
            value: parseFloat(value),
            result: parseFloat(result.toFixed(2))
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});